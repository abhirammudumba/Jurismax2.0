import { useState } from 'react'
import './App.css'
import AdminDashboard from './Admin.jsx'

import {
  Scale,
  Building2,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Handshake,
  Award,
  ArrowRight,
  Menu,
  X,
  Target,
  Users,
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  MessageSquare,
} from 'lucide-react'

const services = [
  {
    icon: Building2,
    title: 'Registrations',
    description:
      'Start your business with confidence through professional registration and company incorporation support.',
  },
  {
    icon: FileText,
    title: 'Licenses',
    description:
      'Navigate essential business licenses and permissions with clear, reliable guidance.',
  },
  {
    icon: ClipboardCheck,
    title: 'Filings',
    description:
      'Keep your business documentation and statutory filings organized and on track.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliances',
    description:
      'Stay informed about important compliance requirements as your business grows.',
  },
  {
    icon: Scale,
    title: 'Legal Services',
    description:
      'Get support with important legal documentation and business requirements.',
  },
  {
    icon: Handshake,
    title: 'Consultation',
    description:
      'Make informed business decisions with guidance tailored to your needs.',
  },
  {
    icon: Award,
    title: 'Trademarks',
    description:
      'Build and protect your brand identity with trademark registration support.',
  },
]

const reasons = [
  {
    icon: Target,
    title: 'Business-Focused Approach',
    description:
      'We understand that every business is different. Our approach starts with your goals and requirements.',
  },
  {
    icon: Users,
    title: 'Client-Centered Support',
    description:
      'Clear communication and meaningful client relationships are at the heart of what we do.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Professional Guidance',
    description:
      'We simplify complex business and compliance processes so you can focus on moving forward.',
  },
]

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))

    setSubmitted(false)
    setErrorMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSubmitted(false)
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const API_URL = 'https://jurismax2-0.onrender.com'

      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to submit your enquiry.'
        )
      }

      setSubmitted(true)

      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      })
    } catch (error) {
      console.error('Enquiry submission failed:', error)

      setErrorMessage(
        error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo" onClick={closeMenu}>
            <img
              src="/jurismax-logo.avif"
              alt="Jurismax Startup Studio"
              className="brand-logo"
            />
          </a>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={closeMenu}>
              Home
            </a>

            <a href="#services" className="nav-link" onClick={closeMenu}>
              Services
            </a>

            <a href="#about" className="nav-link" onClick={closeMenu}>
              About Us
            </a>

            <a href="#why-us" className="nav-link" onClick={closeMenu}>
              Why Jurismax
            </a>

            <a
              href="#contact"
              className="nav-link contact-link"
              onClick={closeMenu}
            >
              Let's Talk <ArrowRight size={16} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section" id="home">
          <div className="hero-content">
            <span className="hero-tag">
              YOUR BUSINESS. OUR EXPERTISE.
            </span>

            <h1 className="hero-title">
              Build Bold.
              <br />
              Start Smart.
              <br />
              <span className="accent-text">Grow Beyond.</span>
            </h1>

            <p className="hero-description">
              Your business journey deserves the right foundation.
              From registrations and legal support to compliance
              and consultation, we're here to help you move forward
              with clarity and confidence.
            </p>

            <div className="hero-buttons">
              <a href="#services" className="primary-button">
                Explore Services <ArrowRight size={18} />
              </a>

              <a href="#about" className="secondary-button">
                Discover Jurismax <ArrowRight size={18} />
              </a>
            </div>

            <div className="hero-note">
              <span className="hero-note-line"></span>
              <span>Ideas deserve a strong beginning.</span>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1100&q=85"
              alt="Professional reviewing and signing business documents"
            />
            <div className="image-caption">
              <span className="caption-dot"></span>
              Building stronger business foundations
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="services-section" id="services">
          <div className="section-heading">
            <span className="section-tag">WHAT WE DO</span>
            <h2>
              Everything Your Business Needs
              <br />
              <span className="accent-text">To Move Forward.</span>
            </h2>
            <p>
              Practical business and legal support to help turn
              your ideas into a well-structured business.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => {
              const Icon = service.icon

              return (
                <div className="service-card" key={index}>
                  <div className="service-icon">
                    <Icon size={29} />
                  </div>

                  <span className="service-number">
                    0{index + 1}
                  </span>

                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <a href="#contact" className="service-link">
                    Explore Service <ArrowRight size={16} />
                  </a>
                </div>
              )
            })}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">
          <div className="about-content">
            <span className="section-tag">ABOUT JURISMAX</span>

            <h2>
              Your Vision Deserves a
              <span className="accent-text"> Strong Foundation.</span>
            </h2>

            <p>
              At Jurismax, we believe every great business begins
              with the right decisions. We aim to make business
              and legal processes simpler for entrepreneurs,
              startups, and growing businesses.
            </p>

            <p>
              From registrations to compliance-related support,
              our focus is on providing clear guidance and helping
              you navigate important business requirements.
            </p>

            <div className="about-highlights">
              <div className="highlight-item">
                <CheckCircle2 size={21} />
                <span>Legal Clarity</span>
              </div>

              <div className="highlight-item">
                <CheckCircle2 size={21} />
                <span>Business Support</span>
              </div>

              <div className="highlight-item">
                <CheckCircle2 size={21} />
                <span>Clear Guidance</span>
              </div>

              <div className="highlight-item">
                <CheckCircle2 size={21} />
                <span>Growth Mindset</span>
              </div>
            </div>

            <a href="#contact" className="primary-button">
              Get in Touch <ArrowRight size={18} />
            </a>
          </div>

          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
              alt="Professionals working together"
            />
          </div>
        </section>

        {/* WHY JURISMAX SECTION */}
        <section className="why-section" id="why-us">
          <div className="section-heading">
            <span className="section-tag">THE JURISMAX DIFFERENCE</span>
            <h2>
              Clarity in Every Step.
              <br />
              <span className="accent-text">
                Confidence in Every Decision.
              </span>
            </h2>
            <p>
              A thoughtful approach to helping businesses
              build, organize, and move ahead.
            </p>
          </div>

          <div className="reasons-grid">
            {reasons.map((reason, index) => {
              const Icon = reason.icon

              return (
                <div className="reason-card" key={index}>
                  <div className="reason-icon">
                    <Icon size={32} />
                  </div>

                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact-section" id="contact">
          <div className="contact-heading">
            <span className="section-tag">LET'S CONNECT</span>
            <h2>
              Let's Build
              <span className="accent-text"> What's Next.</span>
            </h2>
            <p>
              Have a business idea or need professional assistance?
              Let's start a conversation.
            </p>
          </div>

          <div className="contact-container">
            <div className="contact-info">
              <span className="contact-kicker">START A CONVERSATION</span>
              <h3>We'd Love to Hear From You.</h3>

              <p>
                Tell us what you're working on. Reach out to us
                and let's discuss how we can help your business
                take its next step.
              </p>

              <div className="contact-detail">
                <Mail size={22} />
                <div>
                  <span>Email Us</span>
                  <a href="mailto:support@jurismax.in">
                    support@jurismax.in
                  </a>
                </div>
              </div>

              <div className="contact-detail">
                <MessageSquare size={22} />
                <div>
                  <span>Send an Enquiry</span>
                  <p>
                    Share your requirements through the form.
                  </p>
                </div>
              </div>

              <div className="contact-decoration">
                JURISMAX <span>STARTUP STUDIO</span>
              </div>
            </div>

            {/* CONTACT FORM */}
            <form className="contact-form" onSubmit={handleSubmit}>
              <span className="form-kicker">HOW CAN WE HELP?</span>
              <h3>Send Us a Message</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    pattern="[0-9+\-\s()]{7,20}"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">Select Service</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a service</option>

                    {services.map((service) => (
                      <option key={service.title} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell us about your requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>

              {submitted && (
                <p className="form-success" role="status">
                  Thank you! Your enquiry has been submitted successfully.
                </p>
              )}

              {errorMessage && (
                <p className="form-error" role="alert">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <a href="#home" className="footer-logo">
            <Scale size={27} />
            <span>JURISMAX</span>
          </a>

          <p>
            Building stronger business foundations with clarity
            and confidence.
          </p>

          <a href="mailto:support@jurismax.in">
            support@jurismax.in
          </a>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Jurismax. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

// APP ROUTING
function App() {
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />
  }

  return <HomePage />
}

export default App