import { useState } from 'react'

import { useEffect } from 'react'

import Layout from "../../../layout/everyone-layout/Layout"
import {
  Gamepad2,
  MapPin, Calendar, Clock, CheckCircle, Star, Video, Phone, Mail
} from 'lucide-react'


import { setupTypes, consultationBenefits, hardwareCategories, budgetRanges } from '../data'

import BookingModal from '../components/BookingModal'

import ConsultationCalendar from '../components/ConsultationCalendar'

import { useLocation } from 'react-router-dom'

const SetUpConsultation = () => {

  const [selectedSetup, setSelectedSetup] = useState('beginner')

  const [selectedDate, setSelectedDate] = useState(null)

  const [showBookingModal, setShowBookingModal] = useState(false)

  const location = useLocation();

  const handleDateSelect = (date) => {

    setSelectedDate(date)

    setShowBookingModal(true)

  }

  const scrollToBookingSection = () => {

    const bookingSection = document.getElementById('book-consultation');

    if (bookingSection) {

      bookingSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
    }
  }

  useEffect(() => {
    if (location.state?.scrollToBooking) {
      setTimeout(() => {
        const bookingSection = document.getElementById('book-consultation');
        if (bookingSection) {
          bookingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [location.state]);

  return (
    <Layout>
      <div className="min-h-screen gaming-theme">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-dark-light py-16 setup-consultation-hero-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-sm border border-primary/20">
                  <Gamepad2 className="text-primary" size={20} />
                  <span className="text-primary font-semibold">FREE FOR FIRST-TIME VISITORS</span>
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF88]/10 rounded-sm border border-[#00FF88]/20">
                  <MapPin className="text-[#00FF88]" size={20} />
                  <span className="text-[#00FF88] font-semibold">NAIROBI STORE ONLY</span>
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Professional <span className="bg-gradient-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">Gaming Setup</span> Consultation
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                Get expert advice from Kenya's top gaming specialists. Perfect your gaming setup at our Nairobi store -
                from casual gaming to professional streaming and competitive esports.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={
                    scrollToBookingSection
                  }
                  className="rounded-sm bg-gradient-to-r from-primary to-[#00D4FF] px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-glow-blue flex items-center justify-center gap-2"
                >
                  <Calendar size={20} /> Book Free Consultation
                </button>
                <button className="rounded-sm border-2 border-white/30 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2">
                  <Video size={20} /> Watch Setup Tour
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Nairobi Consultation?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Kenya's most comprehensive gaming setup service, backed by 8+ years of expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {consultationBenefits.map((benefit, index) => (
                <div key={index} className="bg-dark-light rounded-sm border border-gray-800 p-6 hover:border-primary transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center mb-4">
                    <div className="text-primary">{benefit.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Setup Types */}
        <section className="py-16 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Setup Type</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Select the consultation that matches your gaming needs and budget
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {setupTypes.map((setup) => (
                <button
                  key={setup.id}
                  onClick={() => {
                    setSelectedSetup(setup.id)
                    setBookingData(prev => ({ ...prev, setupType: setup.id }))
                  }}
                  className={`rounded-sm border p-6 text-left transition-all ${selectedSetup === setup.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-800 hover:border-gray-700'
                    }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${setup.color} rounded-sm flex items-center justify-center mb-4`}>
                    <div className="text-white">{setup.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{setup.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-white">{setup.price}</span>
                    {setup.price === 'FREE' && (
                      <span className="px-2 py-1 bg-[#00FF88]/20 text-[#00FF88] text-xs font-semibold rounded-sm">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Perfect for {setup.id === 'beginner' ? 'new gamers in Nairobi' :
                      setup.id === 'streaming' ? 'content creators' :
                        setup.id === 'competitive' ? 'esports enthusiasts' : 'premium gaming experience'}
                  </p>
                  {/* <div className="flex items-center text-primary">
                    <span className="text-sm font-medium">Select Package</span>
                    <ChevronRight size={16} className="ml-1" />
                  </div> */}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Hardware Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">We Cover All Hardware Categories</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hardwareCategories.map((category, index) => (
                <div key={index} className="bg-dark-light rounded-sm border border-gray-800 p-6 hover:border-primary transition">
                  <div className="w-12 h-12 bg-secondary/10 rounded-sm flex items-center justify-center mb-4">
                    <div className="text-secondary">{category.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{category.name}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#00FF88]" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Budget Planning */}
        <section className="py-16 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Budget Planning for Kenyan Gamers</h2>
                <p className="text-gray-400">
                  Get the best value for your Kenyan Shilling investment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {budgetRanges.map((budget, index) => (
                  <div key={index} className="bg-dark rounded-sm border border-gray-800 p-6 hover:border-primary transition">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">{budget.range}</h3>
                      <div className="flex">
                        {[...Array(index + 1)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4">{budget.description}</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-500">1-2 hour consultation</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-sm border border-primary/30 p-6">
                <h3 className="text-xl font-bold text-white mb-3">💰 Price Match Guarantee</h3>
                <p className="text-gray-300">
                  We guarantee to match or beat any legitimate price from other stores in Nairobi.
                  Bring competitor quotes to your consultation for verification.
                </p>
              </div>
            </div>
          </div>
        </section>


        <section className="py-16" id='book-consultation'>
          <div className="container mx-auto px-4" >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Book Your Consultation</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Select an available date from the calendar below. Consultations are available
                Monday through Friday, 8:30 AM to 4:00 PM (excluding lunch hour).
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ConsultationCalendar
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />

              {/* Booking Modal */}
              <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
                <p className="text-gray-400">
                  Contact our Nairobi store directly
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark rounded-sm border border-gray-800 p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Call Us</h3>
                  <p className="text-gray-400 mb-2">Available 9AM-9PM</p>
                  <a href="tel:+254700000000" className="text-primary hover:text-[#00D4FF] text-xl font-semibold">
                    +254 708 728 793
                  </a>
                </div>

                <div className="bg-dark rounded-sm border border-gray-800 p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-secondary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                  <p className="text-gray-400 mb-2">Response within 2 hours</p>
                  <a href="mailto:consultation@megagamers.co.ke" className="text-primary hover:text-[#00D4FF]">
                    consultation@megagamers.co.ke
                  </a>
                </div>

                <div className="bg-dark rounded-sm border border-gray-800 p-6 text-center">
                  <div className="w-12 h-12 bg-[#00FF88]/10 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-[#00FF88]" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Visit Store</h3>
                  <p className="text-gray-400 mb-2">Walk-ins welcome</p>
                  <p className="text-gray-300">Tom Mboya Street, Nairobi</p>
                  <p className="text-sm text-gray-500">Near National Archives</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default SetUpConsultation