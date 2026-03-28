import React from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero({ onStartAssessment }) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-20 pb-24 overflow-hidden border-b border-[#d1ebd8]">
      
      {/* Absolute Full-Width Spline Background */}
      <div className="absolute inset-0 w-full h-full z-0 bg-background/50">
        <iframe 
          src="https://my.spline.design/untitled-y3a2yYzNpkGvyUGscjPN1ZC7/"
          frameBorder="0" width="100%" height="100%"
          title="Spline 3D Interactive Medical Model Background"
          className="w-[calc(100%+100px)] h-[calc(100%+100px)] object-cover scale-[1.05] -translate-x-[50px] -translate-y-[50px]"
        ></iframe> 
        {/* Subtle overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 drop-shadow-sm"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gray-900 leading-tight block">Know Your Health</span>
          <span className="text-accent leading-tight block drop-shadow-md">Before It's Too Late</span>
        </motion.h1>

        <motion.p 
          className="max-w-3xl text-lg md:text-2xl text-gray-800 font-medium mb-10 drop-shadow-sm bg-white/40 p-4 rounded-3xl backdrop-blur-sm border border-white/50"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Aarogya Path helps you understand and prevent lifestyle diseases early — through simple assessments and honest guidance.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button 
            onClick={onStartAssessment}
            className="flex items-center justify-center bg-primary hover:bg-[#1f4a37] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Check Your Risk Now <ArrowRight className="ml-2 h-6 w-6" />
          </button>
          
          <a 
            href="#how-it-works"
            className="flex items-center justify-center bg-white/80 backdrop-blur-md border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1"
          >
            <Info className="mr-2 h-6 w-6" /> See How It Works
          </a>
        </motion.div>

      </div>
    </section>
  )
}
