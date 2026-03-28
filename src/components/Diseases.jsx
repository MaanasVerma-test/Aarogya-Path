import React from 'react'
import { motion } from 'framer-motion'

export const diseases = [
  { id: 1, emoji: '🩸', title: 'Diabetes', desc: 'Blood sugar imbalance from lifestyle factors' },
  { id: 2, emoji: '❤️', title: 'Heart Disease', desc: 'Cardiovascular risk from diet & stress' },
  { id: 3, emoji: '🧠', title: 'Hypertension', desc: 'Silent high blood pressure risks' },
  { id: 4, emoji: '🫁', title: 'Respiratory Issues', desc: 'Breathing, lung health & pollution effects' },
  { id: 5, emoji: '🦴', title: 'Bone & Joint Health', desc: 'Arthritis and calcium deficiency' },
  { id: 6, emoji: '😴', title: 'Sleep Disorders', desc: 'Chronic fatigue and sleep apnea' },
]

export default function Diseases() {
  return (
    <section id="diseases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Diseases We Help You Prevent</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple awareness today can prevent years of suffering tomorrow. Take control of your future.
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
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(45,106,79,0.15)] transition-all cursor-default"
            >
              <div className="text-5xl mb-4">{doc.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-gray-600">{doc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
