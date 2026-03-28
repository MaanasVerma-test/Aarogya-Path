import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, AlertTriangle, CheckCircle2, XCircle,
  Loader2, ArrowLeft, RefreshCw, Pill, Bone, ClipboardList,
  Clock, ChevronRight, Shield, Type, Plus, Trash2
} from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { supabase } from '../lib/supabaseClient'

// ── Initialize AI Clients directly in Browser ──
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '', 
  dangerouslyAllowBrowser: true 
})

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
}

const COMMON_MEDICINES = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Atorvastatin', 'Metformin',
  'Omeprazole', 'Amlodipine', 'Levothyroxine', 'Losartan', 'Albuterol',
  'Pantoprazole', 'Gabapentin', 'Sertraline', 'Azithromycin', 'Metoprolol',
  'Lisinopril', 'Prednisone', 'Montelukast', 'Escitalopram', 'Ciprofloxacin'
]

const CATEGORIES = [
  {
    id: 'xrays',
    label: 'X-Rays',
    icon: <Bone className="w-8 h-8" />,
    emoji: '🦴',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    desc: 'Upload X-ray images for AI anomaly detection',
    accepts: 'Chest X-rays, Bone X-rays, Dental X-rays'
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: <Pill className="w-8 h-8" />,
    emoji: '💊',
    color: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    desc: 'Check for side effects & drug interactions',
    accepts: 'Doctor prescriptions, Medication lists'
  },
  {
    id: 'reports',
    label: 'Medical Reports',
    icon: <ClipboardList className="w-8 h-8" />,
    emoji: '📋',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    desc: 'Simplify lab results & extract key values',
    accepts: 'Blood tests, Urine tests, Pathology reports'
  }
]

export default function MedicalUpload({ onClose, session }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [inputMode, setInputMode] = useState('upload') // 'upload' or 'manual'
  
  // File state
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  // Manual text state
  const [reportText, setReportText] = useState('')
  const [medicines, setMedicines] = useState([])
  const [medInput, setMedInput] = useState('')
  const [showAutoComplete, setShowAutoComplete] = useState(false)

  // System state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const medInputRef = useRef(null)

  // ── File Handlers ──
  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError(null)
    setResult(null)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }, [])

  // ── Manual Medicine Handlers ──
  const addMedicine = (name) => {
    if (!name.trim()) return
    if (!medicines.includes(name.trim())) {
      setMedicines([...medicines, name.trim()])
    }
    setMedInput('')
    setShowAutoComplete(false)
    medInputRef.current?.focus()
  }

  const removeMedicine = (name) => {
    setMedicines(medicines.filter(m => m !== name))
  }

  const filteredMedicines = COMMON_MEDICINES.filter(m => 
    m.toLowerCase().includes(medInput.toLowerCase()) && !medicines.includes(m)
  ).slice(0, 5)

  // Hide autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (medInputRef.current && !medInputRef.current.contains(e.target)) {
        setShowAutoComplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  // ── AI Client-Side Execution ──
  const handleAnalyze = async () => {
    if (!selectedCategory) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prompt = PROMPTS[selectedCategory.id]
      let analysis = null

      if (inputMode === 'upload') {
        if (!file || !preview) throw new Error("Please select an image file.")
        
        // Extract base64 from data URL (preview)
        // preview is structured like "data:image/jpeg;base64,...base64data"
        const [metaData, base64Data] = preview.split(',')
        const mimeType = metaData.split(':')[1].split(';')[0]

        // Use Gemini Flash Vision for images
        const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash']
        for (const modelName of models) {
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName })
              const aiResult = await model.generateContent([
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } }
              ])
              const response = await aiResult.response
              let text = response.text()
              text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
              analysis = JSON.parse(text)
              break
            } catch (err) {
              if (err instanceof SyntaxError) {
                 analysis = { overallSummary: err.message, recommendations: ['Consult a healthcare professional.'] }
                 break
              }
              const is429 = err.status === 429 || (err.message && err.message.includes('429'))
              if (is429 && attempt < 2) {
                 await new Promise(r => setTimeout(r, 2000)) // Short wait on client
                 continue
              }
              break
            }
          }
          if (analysis) break
        }
        if (!analysis) throw new Error("Google Gemini AI rate limit exceeded or connection failed.")

      } else {
        // Text mode - Use Groq LLaMA 3
        let textData = ''
        if (selectedCategory.id === 'prescriptions') {
          if (medicines.length === 0) throw new Error("Please add at least one medicine.")
          textData = "Medicines list: \n" + medicines.map(m => `- ${m}`).join('\n')
        } else if (selectedCategory.id === 'reports') {
          if (!reportText.trim()) throw new Error("Please enter report details.")
          textData = reportText
        }

        const textPrompt = `Here is manually entered medical data provided by the user:\n\n---\n${textData}\n---\n\nAnalyze this data exactly as you would a document containing this text. ${prompt}`

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: textPrompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
        
        const textOut = chatCompletion.choices[0]?.message?.content || '{}'
        analysis = JSON.parse(textOut)
      }
      
      const record = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        date: new Date().toISOString(),
        category: selectedCategory.id,
        filename: file?.name || (selectedCategory.id === 'prescriptions' ? 'Manual Prescription' : 'Manual Report'),
        analysis
      }
      setResult(record)

      // Save to Supabase if logged in
      if (session) {
         try {
           const { error: dbError } = await supabase.from('medical_history').insert({
             user_id: session.user.id,
             category: selectedCategory.id,
             filename: record.filename,
             analysis_result: analysis
           })
           if (dbError) console.error("Supabase Save Error:", dbError)
         } catch (err) {
           console.error(err)
         }
      }

      // Persist to Dashboard History (fallback)
      try {
        const history = JSON.parse(localStorage.getItem('aarogya_medical_history') || '[]')
        localStorage.setItem('aarogya_medical_history', JSON.stringify([record, ...history]))
      } catch (e) {}

    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to analyze.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setReportText('')
    setMedicines([])
    setResult(null)
    setError(null)
    setSelectedCategory(null)
    setInputMode('upload')
  }

  const cat = selectedCategory
  const statusIcon = (s) => s === 'Normal' || s === 'Routine' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : s === 'Abnormal' || s === 'High' || s === 'Urgent - See Doctor' ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />
  const statusBadge = (s) => {
    if (['Normal', 'Low', 'Routine'].includes(s)) return 'bg-green-100 text-green-700'
    if (['Abnormal', 'High', 'Urgent - See Doctor'].includes(s)) return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  // ── Render Results by Category (reused) ──
  const renderXrayResults = (analysis) => (
    <div className="space-y-6">
      {analysis.urgency && (
        <div className={`p-4 rounded-xl text-center font-semibold ${analysis.urgency.includes('Urgent') ? 'bg-red-100 text-red-800 border border-red-300' : analysis.urgency.includes('Follow') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
          {analysis.urgency.includes('Urgent') ? '🚨' : analysis.urgency.includes('Follow') ? '⚠️' : '✅'} {analysis.urgency}
        </div>
      )}
      {analysis.findings?.map((f, i) => (
        <div key={i} className={`p-5 rounded-xl border ${f.status === 'Normal' ? 'border-green-200 bg-green-50/50' : f.status === 'Abnormal' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'}`}>
          <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2">{statusIcon(f.status)}<h4 className="font-bold text-gray-900">{f.area}</h4></div><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(f.status)}`}>{f.status}</span></div>
          <p className="text-gray-700 text-sm mb-1"><strong>Observation:</strong> {f.observation}</p>
          <p className="text-gray-600 text-sm italic">💡 {f.explanation}</p>
        </div>
      ))}
    </div>
  )

  const renderPrescriptionResults = (analysis) => (
    <div className="space-y-6">
      {analysis.medications?.map((med, i) => (
        <div key={i} className="p-5 rounded-xl border border-purple-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-purple-600" /><h4 className="font-bold text-gray-900 text-lg">{med.name}</h4>{med.dosage && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{med.dosage}</span>}</div>
          <p className="text-gray-700 text-sm mb-3"><strong>Purpose:</strong> {med.purpose}</p>
          {med.commonSideEffects?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">⚠️ Possible Side Effects:</p>
              <div className="flex flex-wrap gap-2">{med.commonSideEffects.map((se, j) => (<span key={j} className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full">{se}</span>))}</div>
            </div>
          )}
          {med.warnings && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-100">🔴 <strong>Warning:</strong> {med.warnings}</p>}
        </div>
      ))}
      {analysis.interactions?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Drug Interactions Found</h4>
          {analysis.interactions.map((int, i) => (
            <div key={i} className="mb-3 last:mb-0 bg-white p-3 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${int.risk === 'High' ? 'bg-red-200 text-red-800' : int.risk === 'Moderate' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{int.risk} Risk</span>
                <span className="font-semibold text-gray-900">{int.drugs}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{int.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderReportResults = (analysis) => (
    <div className="space-y-4">
      {analysis.extractedValues?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b"><h3 className="font-bold text-gray-900">🔬 Test Values</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left text-gray-600"><th className="px-4 py-3 font-semibold">Test</th><th className="px-4 py-3 font-semibold">Value</th><th className="px-4 py-3 font-semibold">Normal</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead>
              <tbody>
                {analysis.extractedValues.map((v, i) => (
                  <React.Fragment key={i}>
                    <tr className={`border-t ${v.status !== 'Normal' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">{statusIcon(v.status)} {v.testName}</td><td className="px-4 py-3 font-mono font-medium">{v.value}</td><td className="px-4 py-3 text-gray-500">{v.normalRange}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span></td>
                    </tr>
                    {v.explanation && <tr className="bg-yellow-50/30"><td colSpan={4} className="px-4 py-2 text-sm text-yellow-800 italic pl-11">💡 {v.explanation}</td></tr>}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={result || selectedCategory ? () => { if (result) { setResult(null); setError(null); } else setSelectedCategory(null) } : onClose}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> {result ? 'Edit Input' : selectedCategory ? 'Categories' : 'Home'}
          </button>
          <span className="font-bold text-lg">🩺 Medical <span className="text-primary">Analysis</span></span>
          {(result || selectedCategory) && <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 font-medium">Close</button>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Categories ── */}
          {!selectedCategory && !result && (
            <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-12">
                <span className="pill-badge mb-4 inline-block shadow-sm">✨ Safe & Private</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">What would you like to analyze?</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Upload documents or manually enter your medical details. Our AI will break down complex jargon into plain, actionable insights.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CATEGORIES.map((c, i) => (
                  <motion.button key={c.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6, scale: 1.02 }} onClick={() => setSelectedCategory(c)}
                    className={`text-left p-6 md:p-8 rounded-3xl border-2 ${c.borderColor} ${c.bgLight} hover:shadow-2xl transition-all group relative overflow-hidden`}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>{c.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{c.label}</h3>
                    <p className="text-gray-600 mb-4">{c.desc}</p>
                    <div className="mt-auto flex items-center font-bold text-primary group-hover:text-[#1f4a37]">Start <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" /></div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Input Mode ── */}
          {selectedCategory && !result && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mx-auto mb-5 shadow-xl rotate-3`}>{cat.icon}</div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{cat.label}</h2>
                <p className="text-gray-600 text-lg">{cat.desc}</p>
              </div>

              {/* Mode Toggle (only for prescriptions and reports) */}
              {cat.id !== 'xrays' && (
                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 w-fit mx-auto shadow-inner">
                  <button onClick={() => setInputMode('upload')} className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${inputMode==='upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Upload className="w-4 h-4 mr-2"/> Upload File
                  </button>
                  <button onClick={() => setInputMode('manual')} className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${inputMode==='manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Type className="w-4 h-4 mr-2"/> Enter Manually
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/50">
                {inputMode === 'upload' ? (
                  <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onClick={() => document.getElementById('file-input').click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragActive ? `${cat.borderColor} ${cat.bgLight} scale-105` : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'} ${file ? `${cat.borderColor} ${cat.bgLight}` : ''}`}>
                    <input id="file-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFile(e.target.files?.[0])} />
                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        {preview ? <img src={preview} alt="Preview" className="max-h-48 rounded-xl shadow-md object-contain" /> : <FileText className="w-16 h-16 text-primary" />}
                        <p className="font-bold text-gray-900 text-lg">{file.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }} className="text-sm font-medium text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full ${cat.bgLight} flex items-center justify-center`}><Upload className={`w-8 h-8 ${cat.textColor}`} /></div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP (max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Manual Prescription Entry */}
                    {cat.id === 'prescriptions' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Add Medicines</label>
                        <div className="relative mb-4" ref={medInputRef}>
                          <div className="flex gap-2">
                            <input type="text" value={medInput} onChange={(e) => {setMedInput(e.target.value); setShowAutoComplete(true)}} onFocus={() => setShowAutoComplete(true)} onKeyDown={(e) => {if(e.key === 'Enter'){ e.preventDefault(); addMedicine(medInput)}}} placeholder="e.g., Paracetamol 500mg" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                            <button onClick={() => addMedicine(medInput)} disabled={!medInput.trim()} className="px-5 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Plus className="w-5 h-5"/></button>
                          </div>
                          {/* Autocomplete Dropdown */}
                          <AnimatePresence>
                            {showAutoComplete && filteredMedicines.length > 0 && (
                              <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="absolute top-full left-0 right-16 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                {filteredMedicines.map((m, i) => (
                                  <div key={i} onClick={() => addMedicine(m)} className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-gray-700 font-medium flex items-center gap-2 border-b last:border-0 border-gray-100"><Pill className="w-4 h-4 text-purple-400"/> {m}</div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {medicines.length > 0 && (
                          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Prescription List</h4>
                            <div className="space-y-2">
                              {medicines.map((m, i) => (
                                <div key={i} className="flex justify-between items-center bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
                                  <span className="font-semibold text-gray-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> {m}</span>
                                  <button onClick={() => removeMedicine(m)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Report Entry */}
                    {cat.id === 'reports' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Paste your medical report or test results here</label>
                        <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="e.g., Hemoglobin 11.2, Fasting Blood Sugar 145 mg/dL..." className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none shadow-inner" />
                        <p className="text-xs text-gray-500 mt-2">Just paste the text directly. Our AI will automatically extract the values and analyze them.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium animate-pulse shadow-sm flex items-center justify-center"><AlertTriangle className="w-5 h-5 mr-2" /> {error}</div>}

              <div className="mt-8">
                <button onClick={handleAnalyze} disabled={loading || (inputMode==='upload' && !file) || (inputMode==='manual' && cat.id==='prescriptions' && medicines.length===0) || (inputMode==='manual' && cat.id==='reports' && !reportText.trim())}
                  className={`w-full flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl
                    ${loading || (inputMode==='upload' && !file) || (inputMode==='manual' && cat.id==='prescriptions' && medicines.length===0) || (inputMode==='manual' && cat.id==='reports' && !reportText.trim()) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02]'}`}>
                  {loading ? <><Loader2 className="w-6 h-6 mr-3 animate-spin"/> Analyzing your data...</> : <>✨ Analyze {cat.label}</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Results ── */}
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mx-auto mb-5 shadow-xl rotate-3`}>{cat.icon}</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{cat.label} Insights</h2>
                <p className="text-gray-500 text-lg">Analysis completed by AI.</p>
              </div>

              <div className="grid md:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-8">
                  {result.category === 'xrays' && renderXrayResults(result.analysis)}
                  {result.category === 'prescriptions' && renderPrescriptionResults(result.analysis)}
                  {result.category === 'reports' && renderReportResults(result.analysis)}
                </div>

                <div className="space-y-6">
                  {/* Summary Box */}
                  {(result.analysis.overallSummary || result.analysis.overallImpression) && (
                    <div className={`rounded-3xl p-6 border-2 ${cat.borderColor} ${cat.bgLight} shadow-sm`}>
                      <h3 className={`font-bold text-lg ${cat.textColor} mb-3 border-b ${cat.borderColor} pb-2`}>📝 Overall Summary</h3>
                      <p className="text-gray-800 leading-relaxed font-medium">{result.analysis.overallSummary || result.analysis.overallImpression}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.analysis.recommendations?.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl shadow-gray-100">
                      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center"><CheckCircle2 className="w-5 h-5 text-accent mr-2"/> Recommended Steps</h3>
                      <ul className="space-y-3">
                        {result.analysis.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span className="text-gray-700 font-medium">{r}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Disclaimer */}
                  <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-3xl text-yellow-800 shadow-sm">
                    <h4 className="font-bold flex items-center gap-2 mb-2"><Shield className="w-5 h-5"/> Important Notice</h4>
                    <p className="text-sm">This AI analysis is <strong>not medical advice</strong>. Always consult a qualified healthcare provider for diagnosis and treatment decisions.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
