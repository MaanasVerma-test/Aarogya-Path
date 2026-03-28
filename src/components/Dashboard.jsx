import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Activity, FileText, CheckCircle2, ChevronRight, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard({ onClose }) {
  const [assessmentData, setAssessmentData] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState([])

  useEffect(() => {
    try {
      const savedAssessment = localStorage.getItem('aarogya_assessment')
      if (savedAssessment) setAssessmentData(JSON.parse(savedAssessment))

      const savedHistory = localStorage.getItem('aarogya_medical_history')
      if (savedHistory) setMedicalHistory(JSON.parse(savedHistory))
    } catch (e) {
      console.error("Failed to parse local storage", e)
    }
  }, [])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Home
          </button>
          <span className="font-bold text-lg">My <span className="text-primary">Dashboard</span></span>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 pb-24">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Health Overview</h1>
          <p className="text-gray-600">Your personal AI-analyzed health records, securely stored on your device.</p>
        </div>

        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
          
          {/* Left Column - Assessment */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-800"><Activity className="w-6 h-6 mr-3 text-primary"/> Latest Assessment</h2>
            
            {assessmentData ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-sm font-bold text-primary uppercase tracking-wider mb-1 block">Overall Health Score</span>
                    <div className="text-6xl font-black text-gray-900 flex items-baseline gap-2">
                       {assessmentData.data.overallScore} <span className="text-2xl text-gray-400 font-medium">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</span>
                    <div className="text-gray-600 font-medium">{formatDate(assessmentData.date)}</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4 text-gray-800">Risk Breakdown</h3>
                <div className="space-y-3">
                  {assessmentData.data.diseaseRisks.map((risk, i) => (
                     <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${risk.score > 0 ? (risk.level === 'High' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100') : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{risk.emoji}</span>
                          <span className="font-bold text-gray-800">{risk.title}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.level === 'High' ? 'bg-red-200 text-red-800' : risk.level === 'Moderate' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                          {risk.level} Risk
                        </span>
                     </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-gray-200 border-dashed text-center flex flex-col items-center justify-center h-64">
                <Activity className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-600 mb-2">No Assessment Data</h3>
                <p className="text-gray-500 text-sm mb-6">Take the free health assessment to see your risk breakdown here.</p>
                <button onClick={() => { onClose(); document.dispatchEvent(new Event('start-assessment')) }} className="bg-primary hover:bg-[#1f4a37] text-white px-6 py-2.5 rounded-full font-medium transition-colors cursor-pointer">Start Assessment</button>
              </div>
            )}
          </div>

          {/* Right Column - Medical Uploads */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-800"><FileText className="w-6 h-6 mr-3 text-accent"/> Medical Records</h2>

            {medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <motion.div key={record.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/30 group hover:border-accent/40 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">{record.category}</span>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{record.filename || 'Manual Entry'}</h3>
                      </div>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex items-center"><Clock className="w-3 h-3 mr-1"/>{formatDate(record.date)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {record.analysis.overallSummary || record.analysis.overallImpression || "Details analyzed successfully."}
                    </p>
                    
                    <div className="flex justify-end border-t border-gray-50 pt-3">
                       {/* Realistically, this could open the detailed view, but keeping it simple for now */}
                       <span className="text-xs font-bold text-gray-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-green-500"/> Analyzed</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-gray-200 border-dashed text-center flex flex-col items-center justify-center h-64">
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-600 mb-2">No Medical Records</h3>
                <p className="text-gray-500 text-sm mb-6">Upload an X-ray, prescription, or report to store its AI analysis.</p>
                <button onClick={() => { onClose(); document.dispatchEvent(new Event('open-analyzer')) }} className="bg-accent hover:bg-[#3d916b] text-white px-6 py-2.5 rounded-full font-medium transition-colors cursor-pointer">Analyze Document</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
