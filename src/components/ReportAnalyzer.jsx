import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertTriangle, CheckCircle2, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'

const API_URL = 'http://localhost:3001/api/analyze-report'

export default function ReportAnalyzer({ onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError(null)
    setResults(null)
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

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const onDragLeave = () => setDragActive(false)

  const analyzeReport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    formData.append('report', file)

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Server error')
      setResults(json.data)
    } catch (err) {
      setError(err.message || 'Failed to analyze the report.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResults(null)
    setError(null)
  }

  const statusIcon = (status) => {
    if (status === 'Normal') return <CheckCircle2 className="w-5 h-5 text-green-500" />
    if (status === 'High') return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const statusBadge = (status) => {
    const map = {
      Normal: 'bg-green-100 text-green-700',
      High: 'bg-red-100 text-red-700',
      Low: 'bg-yellow-100 text-yellow-700'
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </button>
          <span className="font-bold text-lg">
            🩺 Report <span className="text-primary">Analyzer</span>
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 pb-24">
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                  AI Medical Report <span className="text-accent">Analysis</span>
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Upload a medical report or lab result image and our AI will extract key values, flag abnormalities, and explain everything in plain English.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                  ${dragActive ? 'border-primary bg-background scale-[1.02]' : 'border-gray-300 hover:border-accent hover:bg-gray-50'}
                  ${file ? 'border-accent bg-green-50/50' : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {file ? (
                  <div className="flex flex-col items-center gap-4">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 rounded-xl shadow-md object-contain" />
                    ) : (
                      <FileText className="w-16 h-16 text-accent" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="text-sm text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">Drop your report here, or click to browse</p>
                    <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP, and PDF (max 10 MB)</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
                  <AlertTriangle className="w-5 h-5 inline mr-2" /> {error}
                </div>
              )}

              {/* Analyze Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={analyzeReport}
                  disabled={!file || loading}
                  className={`flex items-center px-10 py-3.5 rounded-full font-medium text-lg transition-all shadow-lg
                    ${!file || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#1f4a37] hover:shadow-xl'}`}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><FileText className="w-5 h-5 mr-2" /> Analyze Report</>
                  )}
                </button>
              </div>

            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">📋 Your Report Analysis</h2>
                <p className="text-gray-500">Here's what our AI found in your medical report.</p>
              </div>

              {/* Extracted Values Table */}
              {results.extractedValues && results.extractedValues.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
                  <div className="p-5 bg-gray-50 border-b">
                    <h3 className="font-bold text-lg text-gray-900">🔬 Extracted Test Values</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-gray-600">
                          <th className="px-5 py-3 font-semibold">Test</th>
                          <th className="px-5 py-3 font-semibold">Value</th>
                          <th className="px-5 py-3 font-semibold">Normal Range</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.extractedValues.map((item, i) => (
                          <React.Fragment key={i}>
                            <tr className={`border-t ${item.status !== 'Normal' ? 'bg-red-50/30' : ''}`}>
                              <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2">
                                {statusIcon(item.status)} {item.testName}
                              </td>
                              <td className="px-5 py-3 text-gray-700 font-mono">{item.value}</td>
                              <td className="px-5 py-3 text-gray-500">{item.normalRange}</td>
                              <td className="px-5 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                            {item.explanation && (
                              <tr className="bg-yellow-50/50">
                                <td colSpan={4} className="px-5 py-2 text-sm text-yellow-800 italic pl-12">
                                  💡 {item.explanation}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Overall Summary */}
              {results.overallSummary && (
                <div className="bg-background rounded-2xl p-6 border border-green-200 mb-8">
                  <h3 className="font-bold text-lg text-primary mb-3">📝 Overall Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{results.overallSummary}</p>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">💊 Recommendations</h3>
                  <ul className="space-y-3">
                    {results.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <button onClick={reset} className="flex items-center justify-center bg-primary text-white px-8 py-3 rounded-full font-medium transition-colors hover:bg-[#1f4a37] shadow-md">
                  <RefreshCw className="mr-2 h-5 w-5" /> Analyze Another Report
                </button>
                <button onClick={onClose} className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium transition-colors hover:bg-gray-50">
                  Back to Home
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
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
