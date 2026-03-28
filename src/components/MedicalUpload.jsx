import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, AlertTriangle, CheckCircle2, XCircle,
  Loader2, ArrowLeft, RefreshCw, Pill, Bone, ClipboardList,
  Clock, ChevronRight, Shield
} from 'lucide-react'

const API_BASE = 'http://localhost:3001/api'

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

export default function MedicalUpload({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [history, setHistory] = useState([])

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

  const uploadAndAnalyze = async () => {
    if (!file || !selectedCategory) return
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/upload/${selectedCategory.id}`, {
        method: 'POST',
        body: formData
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')
      setResult(json.data)
      // Fetch updated history
      const hRes = await fetch(`${API_BASE}/uploads`)
      const hJson = await hRes.json()
      if (hJson.success) setHistory(hJson.data)
    } catch (err) {
      setError(err.message || 'Failed to analyze.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setSelectedCategory(null)
  }

  const cat = selectedCategory
  const statusIcon = (s) => s === 'Normal' || s === 'Routine'
    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
    : s === 'Abnormal' || s === 'High' || s === 'Urgent - See Doctor'
      ? <XCircle className="w-5 h-5 text-red-500" />
      : <AlertTriangle className="w-5 h-5 text-yellow-500" />

  const statusBadge = (s) => {
    if (['Normal', 'Low', 'Routine'].includes(s)) return 'bg-green-100 text-green-700'
    if (['Abnormal', 'High', 'Urgent - See Doctor'].includes(s)) return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  // ── Render Results by Category ──
  const renderXrayResults = (analysis) => (
    <div className="space-y-6">
      {/* Urgency Banner */}
      {analysis.urgency && (
        <div className={`p-4 rounded-xl text-center font-semibold ${
          analysis.urgency.includes('Urgent') ? 'bg-red-100 text-red-800 border border-red-300' :
          analysis.urgency.includes('Follow') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
          'bg-green-100 text-green-800 border border-green-300'
        }`}>
          {analysis.urgency.includes('Urgent') ? '🚨' : analysis.urgency.includes('Follow') ? '⚠️' : '✅'} {analysis.urgency}
        </div>
      )}
      {/* Findings */}
      {analysis.findings?.map((f, i) => (
        <div key={i} className={`p-5 rounded-xl border ${f.status === 'Normal' ? 'border-green-200 bg-green-50/50' : f.status === 'Abnormal' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">{statusIcon(f.status)}<h4 className="font-bold text-gray-900">{f.area}</h4></div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(f.status)}`}>{f.status}</span>
          </div>
          <p className="text-gray-700 text-sm mb-1"><strong>Observation:</strong> {f.observation}</p>
          <p className="text-gray-600 text-sm italic">💡 {f.explanation}</p>
        </div>
      ))}
    </div>
  )

  const renderPrescriptionResults = (analysis) => (
    <div className="space-y-6">
      {/* Medications */}
      {analysis.medications?.map((med, i) => (
        <div key={i} className="p-5 rounded-xl border border-purple-200 bg-white">
          <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-purple-600" /><h4 className="font-bold text-gray-900">{med.name}</h4>
            {med.dosage && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{med.dosage}</span>}
          </div>
          <p className="text-gray-700 text-sm mb-2"><strong>Purpose:</strong> {med.purpose}</p>
          {med.commonSideEffects?.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">⚠️ Possible Side Effects:</p>
              <div className="flex flex-wrap gap-2">
                {med.commonSideEffects.map((se, j) => (
                  <span key={j} className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full">{se}</span>
                ))}
              </div>
            </div>
          )}
          {med.warnings && <p className="text-red-600 text-sm mt-2">🔴 {med.warnings}</p>}
        </div>
      ))}
      {/* Interactions */}
      {analysis.interactions?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h4 className="font-bold text-red-800 mb-3">⚠️ Drug Interactions</h4>
          {analysis.interactions.map((int, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${int.risk === 'High' ? 'bg-red-200 text-red-800' : int.risk === 'Moderate' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{int.risk}</span>
                <span className="font-semibold text-gray-900">{int.drugs}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1 ml-16">{int.description}</p>
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
              <thead><tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-2 font-semibold">Test</th><th className="px-4 py-2 font-semibold">Value</th><th className="px-4 py-2 font-semibold">Normal</th><th className="px-4 py-2 font-semibold">Status</th>
              </tr></thead>
              <tbody>
                {analysis.extractedValues.map((v, i) => (
                  <React.Fragment key={i}>
                    <tr className={`border-t ${v.status !== 'Normal' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2 font-medium flex items-center gap-2">{statusIcon(v.status)} {v.testName}</td>
                      <td className="px-4 py-2 font-mono">{v.value}</td>
                      <td className="px-4 py-2 text-gray-500">{v.normalRange}</td>
                      <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span></td>
                    </tr>
                    {v.explanation && <tr className="bg-yellow-50/50"><td colSpan={4} className="px-4 py-1.5 text-sm text-yellow-800 italic pl-10">💡 {v.explanation}</td></tr>}
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
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={result || selectedCategory ? () => { if (result) reset(); else setSelectedCategory(null) } : onClose}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> {result ? 'Upload Another' : selectedCategory ? 'Back to Categories' : 'Back to Home'}
          </button>
          <span className="font-bold text-lg">🩺 Medical <span className="text-primary">Upload</span></span>
          {(result || selectedCategory) && (
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 pb-24">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Category Selection ── */}
          {!selectedCategory && !result && (
            <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-12">
                <span className="pill-badge mb-4 inline-block">🩺 AI-Powered Analysis</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Upload Your Medical Documents</h1>
                <p className="text-gray-600 max-w-xl mx-auto">Choose a category to get started. Our AI will analyze your upload and provide clear, actionable insights.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CATEGORIES.map((c, i) => (
                  <motion.button key={c.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-left p-6 rounded-2xl border-2 ${c.borderColor} ${c.bgLight} hover:shadow-xl transition-all group`}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {c.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{c.label}</h3>
                    <p className="text-sm text-gray-600 mb-3">{c.desc}</p>
                    <p className="text-xs text-gray-400">Accepts: {c.accepts}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary">
                      Upload now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Upload History */}
              {history.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Recent Uploads</h3>
                  <div className="space-y-3">
                    {history.slice(0, 5).map(h => {
                      const hCat = CATEGORIES.find(c => c.id === h.category)
                      return (
                        <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{hCat?.emoji}</span>
                            <div>
                              <p className="font-medium text-gray-900">{h.fileName}</p>
                              <p className="text-xs text-gray-500">{hCat?.label} • {new Date(h.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{(h.fileSize / 1024).toFixed(0)} KB</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Upload File ── */}
          {selectedCategory && !result && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {cat.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Upload {cat.label}</h2>
                <p className="text-gray-600">{cat.desc}</p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                  ${dragActive ? `${cat.borderColor} ${cat.bgLight} scale-[1.02]` : 'border-gray-300 hover:border-accent hover:bg-gray-50'}
                  ${file ? `${cat.borderColor} ${cat.bgLight}` : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])} />

                {file ? (
                  <div className="flex flex-col items-center gap-4">
                    {preview ? <img src={preview} alt="Preview" className="max-h-48 rounded-xl shadow-md object-contain" /> : <FileText className="w-16 h-16 text-accent" />}
                    <div><p className="font-semibold text-gray-900">{file.name}</p><p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }} className="text-sm text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-20 h-20 rounded-full ${cat.bgLight} flex items-center justify-center`}>
                      <Upload className={`w-10 h-10 ${cat.textColor}`} />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">Drop your {cat.label.toLowerCase()} here</p>
                    <p className="text-sm text-gray-500">JPEG, PNG, WebP, or PDF (max 10 MB)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
                  <AlertTriangle className="w-5 h-5 inline mr-2" /> {error}
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button onClick={uploadAndAnalyze} disabled={!file || loading}
                  className={`flex items-center px-10 py-3.5 rounded-full font-medium text-lg transition-all shadow-lg
                    ${!file || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#1f4a37] hover:shadow-xl'}`}>
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : <><Upload className="w-5 h-5 mr-2" /> Upload & Analyze</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Results ── */}
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {cat.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{cat.label} Analysis</h2>
                <p className="text-gray-500">File: {result.fileName}</p>
              </div>

              {/* Category-Specific Results */}
              {result.category === 'xrays' && renderXrayResults(result.analysis)}
              {result.category === 'prescriptions' && renderPrescriptionResults(result.analysis)}
              {result.category === 'reports' && renderReportResults(result.analysis)}

              {/* Overall Summary (common) */}
              {(result.analysis.overallSummary || result.analysis.overallImpression) && (
                <div className={`mt-8 ${cat.bgLight} rounded-2xl p-6 border ${cat.borderColor}`}>
                  <h3 className={`font-bold text-lg ${cat.textColor} mb-3`}>📝 Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{result.analysis.overallSummary || result.analysis.overallImpression}</p>
                </div>
              )}

              {/* Recommendations */}
              {result.analysis.recommendations?.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl p-6 border shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">💊 Recommendations</h3>
                  <ul className="space-y-3">
                    {result.analysis.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" /><span className="text-gray-700">{r}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <button onClick={reset} className="flex items-center justify-center bg-primary text-white px-8 py-3 rounded-full font-medium transition-colors hover:bg-[#1f4a37] shadow-md">
                  <RefreshCw className="mr-2 h-5 w-5" /> Upload Another
                </button>
                <button onClick={onClose} className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium transition-colors hover:bg-gray-50">
                  Back to Home
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                <p className="text-sm text-yellow-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  <strong>Disclaimer:</strong> This is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
