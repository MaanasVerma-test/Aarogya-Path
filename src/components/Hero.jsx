import React from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero({ onStartAssessment }) {
  return (
    <section className="bg-background pt-20 pb-24 border-b border-[#d1ebd8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <span className="pill-badge mb-6">
            🌿 Early Awareness Saves Lives
          </span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gray-900 leading-tight">Know Your Health</span><br />
          <span className="text-accent leading-tight">Before It's Too Late</span>
        </motion.h1>

        <motion.p 
          className="max-w-2xl text-lg md:text-xl text-gray-600 mb-10"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Aarogya Path helps you understand and prevent lifestyle diseases early — through simple assessments and honest guidance.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button 
            onClick={onStartAssessment}
            className="flex items-center justify-center bg-primary hover:bg-[#1f4a37] text-white px-8 py-3.5 rounded-full font-medium text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Check Your Risk Now <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
          <a 
            href="#how-it-works"
            className="flex items-center justify-center border-2 border-primary text-primary hover:bg-primary/5 px-8 py-3.5 rounded-full font-medium text-lg transition-colors"
          >
            <Info className="mr-2 h-5 w-5" /> See How It Works
          </a>
        </motion.div>

      </div>
    </section>
  )
}
