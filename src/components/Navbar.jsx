import React from 'react'
import { HeartPulse, LayoutDashboard } from 'lucide-react'

export default function Navbar({ onStartAssessment, onOpenAnalyzer, onOpenDashboard }) {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
            <HeartPulse className="h-8 w-8 text-accent mr-2" />
            <span className="text-xl font-bold text-gray-900">
              Aarogya<span className="text-primary font-normal">Path</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Home</a>
            <a href="#diseases" className="text-gray-600 hover:text-primary transition-colors">Diseases</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How It Works</a>
            <button onClick={onOpenAnalyzer} className="text-gray-600 hover:text-primary transition-colors">Analyze Report</button>
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenDashboard}
              className="hidden md:flex items-center text-gray-700 hover:text-primary font-medium transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 mr-1.5" /> Dashboard
            </button>
            <button 
              onClick={onStartAssessment}
              className="bg-primary hover:bg-[#1f4a37] text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Start Free Assessment
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
