import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, AlertTriangle, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react'

export const diseases = [
  { 
    id: 1, 
    emoji: '🩸', 
    title: 'Diabetes', 
    desc: 'Blood sugar imbalance from lifestyle factors',
    fullDesc: 'Diabetes is a chronic metabolic disease characterized by elevated levels of blood glucose. Over time, it leads to serious damage to the heart, blood vessels, eyes, kidneys, and nerves if left unmanaged.',
    symptoms: ['Excessive thirst & hunger', 'Frequent urination', 'Unexplained weight loss', 'Fatigue & blurred vision'],
    risks: ['Family history of diabetes', 'Overweight / Obesity', 'Physical inactivity', 'Age over 45'],
    prevention: ['Maintain a healthy weight', 'Eat a balanced diet rich in fiber', 'Exercise regularly (30 mins/day)', 'Monitor blood sugar levels annually']
  },
  { 
    id: 2, 
    emoji: '❤️', 
    title: 'Heart Disease', 
    desc: 'Cardiovascular risk from diet & stress',
    fullDesc: 'Heart disease describes a range of conditions that affect your heart. Diseases under the heart disease umbrella include blood vessel diseases, such as coronary artery disease, heart rhythm problems, and congenital heart defects.',
    symptoms: ['Chest pain or pressure', 'Shortness of breath', 'Pain in the neck, jaw, or back', 'Numbness or coldness in legs/arms'],
    risks: ['High blood pressure & cholesterol', 'Smoking & heavy alcohol use', 'Unhealthy diet high in saturated fats', 'High stress levels'],
    prevention: ['Quit smoking immediately', 'Control blood pressure & cholesterol', 'Manage stress through meditation/yoga', 'Eat heart-healthy foods (omega-3s)']
  },
  { 
    id: 3, 
    emoji: '🧠', 
    title: 'Hypertension', 
    desc: 'Silent high blood pressure risks',
    fullDesc: 'Hypertension, or high blood pressure, is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.',
    symptoms: ['Headaches (rare early on)', 'Shortness of breath', 'Nosebleeds', 'Often considered a "silent killer" with no symptoms'],
    risks: ['High sodium (salt) intake', 'Lack of physical activity', 'Being overweight', 'Genetics and advancing age'],
    prevention: ['Reduce sodium in your diet', 'Limit alcohol consumption', 'Exercise 150 minutes a week', 'Get 7-9 hours of quality sleep']
  },
  { 
    id: 4, 
    emoji: '🫁', 
    title: 'Respiratory Issues', 
    desc: 'Breathing, lung health & pollution effects',
    fullDesc: 'Chronic respiratory diseases are diseases of the airways and other structures of the lung. Common ones include asthma, chronic obstructive pulmonary disease (COPD), occupational lung diseases, and pulmonary hypertension.',
    symptoms: ['Chronic cough', 'Shortness of breath with mild exertion', 'Wheezing', 'Chest tightness'],
    risks: ['Tobacco smoking', 'Indoor/Outdoor air pollution', 'Occupational dusts and chemicals', 'Frequent lower respiratory infections'],
    prevention: ['Avoid exposure to pollutants', 'Wear masks in high-smog areas', 'Do breathing exercises (Pranayama)', 'Keep indoor air clean and well-ventilated']
  },
  { 
    id: 5, 
    emoji: '🦴', 
    title: 'Bone & Joint Health', 
    desc: 'Arthritis and calcium deficiency',
    fullDesc: 'Bone and joint disorders like Osteoporosis and Arthritis cause bones to become weak, brittle, and joints to become inflamed leading to severe pain and mobility issues as you age.',
    symptoms: ['Joint pain and stiffness', 'Swelling or tenderness', 'Decreased range of motion', 'Bone fractures from minor falls'],
    risks: ['Low calcium and Vitamin D diets', 'Sedentary lifestyle', 'Aging population', 'Hormonal changes'],
    prevention: ['Consume calcium-rich foods', 'Get safe sun exposure for Vitamin D', 'Do weight-bearing exercises', 'Avoid smoking and heavy drinking']
  },
  { 
    id: 6, 
    emoji: '😴', 
    title: 'Sleep Disorders', 
    desc: 'Chronic fatigue and sleep apnea',
    fullDesc: 'Sleep disorders involve problems with the quality, timing, and amount of sleep, which result in daytime distress and impairment in functioning. They are strongly linked to heart disease and depression.',
    symptoms: ['Difficulty falling or staying asleep', 'Daytime fatigue', 'Irregular breathing or increased movement during sleep', 'Irritability and anxiety'],
    risks: ['High screen time before bed', 'Irregular work schedules', 'High caffeine intake', 'Obesity (for Sleep Apnea)'],
    prevention: ['Maintain a consistent sleep schedule', 'Avoid screens 1 hour before bed', 'Limit caffeine after 2 PM', 'Create a dark, cool sleeping environment']
  },
]

export default function Diseases() {
  const [selectedDisease, setSelectedDisease] = useState(null)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedDisease) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [selectedDisease])

  return (
    <section id="diseases" className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="pill-badge mb-4 inline-block shadow-sm">💡 Preventive Knowledge</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Diseases We Help You Prevent</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple awareness today can prevent years of suffering tomorrow. Click on a condition below to explore warning signs and protective measures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diseases.map((doc, i) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedDisease(doc)}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-accent/30 transition-all cursor-pointer group flex flex-col"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform origin-left">{doc.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{doc.title}</h3>
              <p className="text-gray-600 flex-1 leading-relaxed">{doc.desc}</p>
              
              <div className="mt-8 flex items-center font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full-Screen Detailed Modal */}
      <AnimatePresence>
        {selectedDisease && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDisease(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-accent p-8 text-white flex justify-between items-start sticky top-0 z-20">
                <div className="flex gap-4 items-center">
                  <div className="text-5xl bg-white/20 p-4 rounded-2xl shadow-inner backdrop-blur-sm">{selectedDisease.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-extrabold mb-1">{selectedDisease.title}</h2>
                    <p className="text-white/80 font-medium">{selectedDisease.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDisease(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                <div className="mb-10 text-gray-700 leading-relaxed text-lg border-l-4 border-accent pl-5 py-1 bg-gradient-to-r from-accent/5 to-transparent rounded-r-xl">
                  {selectedDisease.fullDesc}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Symptoms */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                      <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle className="w-5 h-5"/></div>
                      <h4 className="font-bold text-gray-900">Symptoms</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedDisease.symptoms.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                      <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Activity className="w-5 h-5"/></div>
                      <h4 className="font-bold text-gray-900">Risk Factors</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedDisease.risks.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm h-full">
                    <div className="flex items-center gap-3 mb-4 border-b border-green-200/50 pb-3">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><ShieldCheck className="w-5 h-5"/></div>
                      <h4 className="font-bold text-emerald-900">Prevention</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedDisease.prevention.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-emerald-800 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-white flex justify-end sticky bottom-0">
                <button 
                  onClick={() => setSelectedDisease(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
