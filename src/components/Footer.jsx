import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h4 className="text-2xl font-bold text-white mb-2">Aarogya<span className="text-accent font-normal">Path</span></h4>
            <p className="text-sm">Know Your Health Before It's Too Late.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 text-sm mb-6 md:mb-0 items-center">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} AarogyaPath. All rights reserved. Built for preventive healthcare awareness in India.
        </div>
      </div>
    </footer>
  )
}
