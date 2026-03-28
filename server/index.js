import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// ── Uploads Setup ──
const uploadsDir = path.join(process.cwd(), 'uploads');
for (const sub of ['xrays', 'prescriptions', 'reports']) {
  const dir = path.join(uploadsDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const category = _req.params.category || 'reports';
    cb(null, path.join(uploadsDir, category));
  },
  filename: (_req, file, cb) => {
    const id = crypto.randomUUID();
    cb(null, `${id}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images and PDF files are accepted.'));
  }
});

// ── Gemini Setup ──
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPTS = {
  xrays: `You are a radiologist AI assistant. The user has uploaded an X-ray image.
Analyze it carefully and respond in this EXACT JSON format (no markdown, no code fences):
{
  "findings": [
    {
      "area": "Body area/region",
      "observation": "What you see",
      "status": "Normal" | "Abnormal" | "Needs Review",
      "explanation": "Simple plain-English explanation of what this means"
    }
  ],
  "overallImpression": "A plain-language summary of the X-ray findings.",
  "urgency": "Routine" | "Follow-up Recommended" | "Urgent - See Doctor",
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Always remind the user this is AI-assisted and they should consult a radiologist.`,

  prescriptions: `You are a pharmacist AI assistant. The user has uploaded a prescription or medication list.
Extract all medications, check for potential side effects, drug interactions, and provide simple explanations.
Respond in this EXACT JSON format (no markdown, no code fences):
{
  "medications": [
    {
      "name": "Drug name",
      "dosage": "Dosage if visible",
      "purpose": "What this drug is typically used for",
      "commonSideEffects": ["side effect 1", "side effect 2"],
      "warnings": "Any important warnings or contraindications"
    }
  ],
  "interactions": [
    {
      "drugs": "Drug A + Drug B",
      "risk": "Low" | "Moderate" | "High",
      "description": "What could happen"
    }
  ],
  "overallSummary": "A plain-language summary of the prescription.",
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Always remind the user to consult their prescribing doctor about any concerns.`,

  reports: `You are a medical report analyst. The user has uploaded a medical report or lab result.
Extract all test values, identify abnormal ones, and explain everything in simple language.
Respond in this EXACT JSON format (no markdown, no code fences):
{
  "extractedValues": [
    {
      "testName": "Test Name",
      "value": "measured value with unit",
      "normalRange": "normal range",
      "status": "Normal" | "High" | "Low",
      "explanation": "Simple explanation (only for abnormal, empty string for normal)"
    }
  ],
  "overallSummary": "A plain-language summary of the report.",
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Always remind the user to consult a real doctor.`
};

// ── In-Memory Store (Supabase later) ──
const uploadHistory = [];

// ── Gemini Call with Model Fallback ──
async function callGemini(prompt, mimeType, base64Data) {
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];
  let lastError;
  let allErrors = [];

  for (const modelName of models) {
    try {
      console.log(`  → Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType, data: base64Data } }
      ]);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log(`  ✓ Success with ${modelName}`);
      return JSON.parse(text);
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) {
        return { overallSummary: parseErr.message, recommendations: ['Consult a healthcare professional.'] };
      }
      console.warn(`  ✗ ${modelName} failed:`, parseErr.message);
      lastError = parseErr;
      allErrors.push(`${modelName}(${parseErr.status || parseErr.message})`);
    }
  }
  throw new Error(`All AI models failed. Reasons: ${allErrors.join(', ')}`);
}

// ── Upload + Analyze Route ──
app.post('/api/upload/:category', upload.single('file'), async (req, res) => {
  try {
    const category = req.params.category;
    if (!['xrays', 'prescriptions', 'reports'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Use: xrays, prescriptions, or reports' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log(`\n📂 Upload received: ${req.file.originalname} → [${category}]`);

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    // Call Gemini with category-specific prompt
    const analysis = await callGemini(PROMPTS[category], mimeType, base64Data);

    // Save to history
    const record = {
      id: crypto.randomUUID(),
      category,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      mimeType,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString(),
      analysis
    };
    uploadHistory.push(record);

    res.json({ success: true, data: record });
  } catch (err) {
    console.error('Analysis Error:', err.message || err);
    res.status(500).json({ error: `Analysis failed: ${err.message || 'Unknown error'}` });
  }
});

// ── Get Upload History ──
app.get('/api/uploads', (_req, res) => {
  res.json({ success: true, data: uploadHistory.slice().reverse() });
});

app.get('/api/uploads/:category', (req, res) => {
  const filtered = uploadHistory.filter(u => u.category === req.params.category).reverse();
  res.json({ success: true, data: filtered });
});

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uploads: uploadHistory.length });
});

app.listen(PORT, () => {
  console.log(`🩺 AarogyaPath server running on http://localhost:${PORT}`);
});
