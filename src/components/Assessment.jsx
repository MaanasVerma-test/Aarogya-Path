import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Activity, X, Download } from 'lucide-react'
import { diseases } from './Diseases'

const initialState = {
  age: '',
  gender: '',
  height: '', // cm
  weight: '', // kg
  smoke: '',
  drink: '',
  exercise: '',
  diet: '',
  sleep: '',
  headaches: '',
  fatigue: '',
  familyHistory: [],
  shortBreath: '',
  jointPain: '',
  screenTime: ''
}

export default function Assessment({ onClose }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialState)
  const [results, setResults] = useState(null)

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const toggleFamilyHistory = (disease) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.includes(disease) 
        ? prev.familyHistory.filter(d => d !== disease)
        : [...prev.familyHistory, disease]
    }))
  }

  const calculateResults = () => {
    // Basic logic
    let age = parseInt(formData.age) || 30
    let h = parseInt(formData.height) / 100 || 1.7
    let w = parseInt(formData.weight) || 70
    let bmi = w / (h * h)
    
    // Risk points per disease: [Diabetes, Heart, Hyper, Respiratory, Bone, Sleep]
    let risks = {
      'Diabetes': 0,
      'Heart Disease': 0,
      'Hypertension': 0,
      'Respiratory Issues': 0,
      'Bone & Joint Health': 0,
      'Sleep Disorders': 0
    }

    if (age > 40) {
      Object.keys(risks).forEach(k => risks[k] += 1)
    }

    if (bmi > 25) {
      risks['Diabetes'] += 2
      risks['Heart Disease'] += 2
      risks['Bone & Joint Health'] += 1
    }

    if (formData.exercise === 'Never' && (formData.screenTime === '4-6hrs' || formData.screenTime === '6+ hrs')) {
      Object.keys(risks).forEach(k => risks[k] += 1)
    }

    if (formData.smoke === 'Yes' || formData.smoke === 'Occasionally') {
      risks['Respiratory Issues'] += 3
      risks['Heart Disease'] += 2
      risks['Hypertension'] += 1
    }

    if (formData.sleep === '< 5' || formData.sleep === '5-6') {
      risks['Hypertension'] += 2
      risks['Sleep Disorders'] += 3
      if (formData.fatigue === 'Yes') risks['Sleep Disorders'] += 1
    }

    if (formData.familyHistory.includes('Diabetes')) risks['Diabetes'] += 2
    if (formData.familyHistory.includes('Heart Disease')) risks['Heart Disease'] += 2
    if (formData.familyHistory.includes('Hypertension')) risks['Hypertension'] += 2

    if (formData.shortBreath === 'Yes') risks['Respiratory Issues'] += 2
    if (formData.jointPain === 'Yes') risks['Bone & Joint Health'] += 3
    if (formData.headaches === 'Yes') {
      risks['Hypertension'] += 1
      risks['Sleep Disorders'] += 1
    }

    // Map to Low/Mod/High and Tips
    const finalRisks = diseases.map(d => {
      let score = risks[d.title] || 0
      let level = score >= 3 ? 'High' : score >= 1 ? 'Moderate' : 'Low'
      let color = score >= 3 ? 'text-red-600 bg-red-50' : score >= 1 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
      let icon = score >= 3 ? '🔴' : score >= 1 ? '🟡' : '🟢'
      
      return {
        ...d,
        level, color, icon, score
      }
    })

    // Overall Score (100 - average penalty)
    const totalPenalty = Object.values(risks).reduce((a, b) => a + b, 0)
    const overallScore = Math.max(0, 100 - (totalPenalty * 3.5))

    const finalAssessment = {
      overallScore: Math.round(overallScore),
      diseaseRisks: finalRisks
    }

    setResults(finalAssessment)
    
    // Persist to Dashboard
    try {
      localStorage.setItem('aarogya_assessment', JSON.stringify({
        date: new Date().toISOString(),
        data: finalAssessment,
        answers: formData
      }))
    } catch (e) {}

    setStep(4)
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">Step 1: Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="e.g. 35" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex gap-3">
            {['Male', 'Female', 'Other'].map(g => (
              <button key={g} onClick={() => setFormData({...formData, gender: g})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.gender === g ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 175" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70" />
        </div>
      </div>
    </div>
  )

  const renderLifestyle = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">Step 2: Lifestyle Habits</h3>
      
      {/* Reusable radio group helper */}
      {[
        { label: 'Do you smoke?', field: 'smoke', options: ['Yes', 'No', 'Occasionally'] },
        { label: 'Do you drink alcohol?', field: 'drink', options: ['Yes', 'No', 'Occasionally'] },
        { label: 'Exercise frequency', field: 'exercise', options: ['Never', '1-2x week', '3-5x week', 'Daily'] },
        { label: 'Diet type', field: 'diet', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Mixed'] },
        { label: 'Sleep hours per night', field: 'sleep', options: ['< 5', '5-6', '7-8', '8+'] }
      ].map((q, i) => (
        <div key={i}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{q.label}</label>
          <div className="flex flex-wrap gap-3">
            {q.options.map(opt => (
              <button key={opt} onClick={() => setFormData({...formData, [q.field]: opt})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData[q.field] === opt ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderSymptoms = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">Step 3: Symptoms & History</h3>
      
      {[
        { label: 'Frequent headaches?', field: 'headaches', options: ['Yes', 'No'] },
        { label: 'Unusually fatigued?', field: 'fatigue', options: ['Yes', 'No'] },
        { label: 'Shortness of breath?', field: 'shortBreath', options: ['Yes', 'No'] },
        { label: 'Joint or back pain?', field: 'jointPain', options: ['Yes', 'No'] },
        { label: 'Screen time per day', field: 'screenTime', options: ['< 2hrs', '2-4hrs', '4-6hrs', '6+ hrs'] }
      ].map((q, i) => (
        <div key={i}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{q.label}</label>
          <div className="flex flex-wrap gap-3">
            {q.options.map(opt => (
              <button key={opt} onClick={() => setFormData({...formData, [q.field]: opt})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData[q.field] === opt ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Family History (Select all that apply)</label>
        <div className="flex flex-wrap gap-3">
          {['Diabetes', 'Heart Disease', 'Hypertension'].map(disease => (
            <button key={disease} onClick={() => toggleFamilyHistory(disease)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${formData.familyHistory.includes(disease) ? 'bg-primary text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {formData.familyHistory.includes(disease) && <CheckCircle2 className="w-4 h-4 mr-2" />}
              {disease}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!results) return null;
    let scoreColor = results.overallScore > 75 ? 'text-green-500' : results.overallScore > 50 ? 'text-yellow-500' : 'text-red-500'

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Hi! Here's Your Health Risk Report</h2>
          <p className="text-gray-600">Based on your answers, we've calculated your personalized risk assessment.</p>
        </div>

        {/* Circular Progress (CSS based) */}
        <div className="flex justify-center my-8">
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-gray-100 shadow-inner">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" 
                className={`${scoreColor} opacity-20`} />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 88}`} strokeDashoffset={`${2 * Math.PI * 88 * (1 - results.overallScore/100)}`}
                className={`${scoreColor} transition-all duration-1000 ease-out`} />
            </svg>
            <div className="text-center">
              <span className={`text-5xl font-black ${scoreColor}`}>{results.overallScore}</span>
              <span className="block text-sm text-gray-500 font-medium mt-1">Health Score</span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Disease Risk Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.diseaseRisks.map(r => (
            <div key={r.id} className={`p-5 rounded-xl border ${r.color} bg-white transition-all shadow-sm hover:shadow-md`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.emoji}</span>
                  <h4 className="font-bold text-gray-900">{r.title}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white shadow-sm flex items-center gap-1`}>
                  {r.icon} {r.level} Risk
                </span>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 mt-4 list-disc pl-5 opacity-80">
                {r.score > 0 ? (
                  <>
                    <li>Schedule a routine screening early.</li>
                    <li>Focus on {r.title === 'Diabetes' ? 'cutting processed sugars' : 'active 30-min daily routines'}.</li>
                  </>
                ) : (
                  <li>Maintain your current healthy habits.</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button className="flex items-center justify-center bg-gray-900 text-white px-8 py-3 rounded-full font-medium transition-colors hover:bg-gray-800">
            <Download className="mr-2 h-5 w-5" /> Download Report (PDF)
          </button>
          <button onClick={() => { setStep(1); setFormData(initialState); setResults(null); }} className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium transition-colors hover:bg-gray-50">
            Retake Assessment
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-lg flex items-center">
            Aarogya<span className="text-primary font-normal text-sm ml-1">Assessment</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="max-w-3xl mx-auto px-4 pb-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && renderBasicInfo()}
            {step === 2 && renderLifestyle()}
            {step === 3 && renderSymptoms()}
            {step === 4 && renderResults()}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-10 flex justify-between items-center border-t pt-6">
            <button 
              onClick={handlePrev} 
              disabled={step === 1}
              className={`px-6 py-2.5 rounded-full font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Back
            </button>
            <button 
              onClick={step === 3 ? calculateResults : handleNext}
              className="px-8 py-2.5 rounded-full font-medium bg-primary text-white hover:bg-[#1f4a37] shadow-md transition-all"
            >
              {step === 3 ? 'See Results' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
