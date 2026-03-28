import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Diseases from './components/Diseases'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import Assessment from './components/Assessment'

function App() {
  const [showAssessment, setShowAssessment] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-accent selection:text-white">
      <Navbar onStartAssessment={() => setShowAssessment(true)} />
      
      <main>
        <Hero onStartAssessment={() => setShowAssessment(true)} />
        <Diseases />
        <HowItWorks />
        
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
    </div>
  )
}

export default App
