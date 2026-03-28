import React from 'react'
import { FileQuestion, Bot, LineChart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileQuestion className="w-10 h-10 text-primary" />,
      title: 'Answer a Few Questions',
      desc: 'Takes under 3 minutes. Honest answers yield the best results.'
    },
    {
      icon: <Bot className="w-10 h-10 text-primary" />,
      title: 'AI Analyzes Your Risk',
      desc: 'Based on your symptoms, habits, and lifestyle data.'
    },
    {
      icon: <LineChart className="w-10 h-10 text-primary" />,
      title: 'Get Your Health Report',
      desc: 'Personalized prevention tips and actionable guidance.'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-[#F9FAFB] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 md:gap-4 relative">
          
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gray-200 z-0 border-dashed border-b-2"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex-1 text-center relative z-10 bg-[#F9FAFB] px-4"
            >
              <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-md flex items-center justify-center mb-6 border-4 border-white ring-1 ring-gray-100 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">
                  {index + 1}
                </span>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
