import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Diseases from './components/Diseases'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import Assessment from './components/Assessment'
import MedicalUpload from './components/MedicalUpload'

function App() {
  const [showAssessment, setShowAssessment] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-accent selection:text-white">
      <Navbar onStartAssessment={() => setShowAssessment(true)} onOpenAnalyzer={() => setShowUpload(true)} />
      
      <main>
        <Hero onStartAssessment={() => setShowAssessment(true)} />
        <Diseases />
        <HowItWorks />

        {/* Medical Upload CTA */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="pill-badge mb-6 inline-block">🩺 AI-Powered</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upload & Analyze Medical Documents</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Upload X-rays, prescriptions, or lab reports. Our AI checks for anomalies, flags side effects, and simplifies complex results into plain English.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-primary hover:bg-[#1f4a37] text-white px-10 py-3.5 rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl"
            >
              🩺 Upload Medical Documents
            </button>
          </div>
        </section>
        
        {/* Simple About Section */}
        <section id="about" className="py-24 bg-primary text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-accent">Our Mission</h2>
            <p className="text-xl leading-relaxed italic opacity-90">
              "AarogyaPath was built to bring preventive healthcare awareness to every Indian household. We believe early knowledge is the most powerful medicine."
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Full-page Assessment Overlay */}
      {showAssessment && (
        <Assessment onClose={() => setShowAssessment(false)} />
      )}

      {/* Full-page Medical Upload Overlay */}
      {showUpload && (
        <MedicalUpload onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}

export default App
