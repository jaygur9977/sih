import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  BoltIcon, 
  CpuChipIcon,
  ServerIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const LandingPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null)

  // Matrix rain effect
  useEffect(() => {
    const createMatrixRain = () => {
      const chars = '01';
      const container = document.getElementById('matrix-rain');
      if (!container) return;

      // Clear existing
      container.innerHTML = '';

      // Create falling characters
      for (let i = 0; i < 50; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        char.style.left = `${Math.random() * 100}vw`;
        char.style.animationDelay = `${Math.random() * 5}s`;
        char.style.fontSize = `${Math.random() * 10 + 10}px`;
        char.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(char);
      }
    };

    createMatrixRain();
    const interval = setInterval(createMatrixRain, 10000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { name: 'Nmap', icon: GlobeAltIcon, color: '#00D4AA' },
    { name: 'OpenVAS', icon: ShieldCheckIcon, color: '#2563EB' },
    { name: 'Nessus', icon: ServerIcon, color: '#FF6B6B' },
    { name: 'Nikto', icon: BoltIcon, color: '#F59E0B' },
    { name: 'Nuclei', icon: CpuChipIcon, color: '#8B5CF6' },
    { name: 'Custom Scripts', icon: CodeBracketIcon, color: '#10B981' },
  ]

  const features = [
    {
      title: 'Intelligent Scanning',
      description: 'AI-powered active & passive enumeration with smart target analysis',
      icon: BoltIcon
    },
    {
      title: 'Vulnerability Correlation',
      description: 'Automated CVE correlation with NVD, ExploitDB, and Rapid7 databases',
      icon: ChartBarIcon
    },
    {
      title: 'AI-Powered Analysis',
      description: 'RAG-based chatbot for natural language queries and attack path generation',
      icon: ChatBubbleLeftRightIcon
    },
    {
      title: 'Structured Reports',
      description: 'Professional PDF reports with CVSS scores and remediation guidance',
      icon: DocumentTextIcon
    }
  ]

  const pricingPlans = [
    {
      name: 'Basic Scan',
      price: '₹100',
      duration: 'per scan',
      features: [
        'Nmap Scanning',
        'Nikto Web Scan',
        'Nuclei Templates',
        'Basic Report',
        '24hr Support'
      ],
      popular: false,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'Professional',
      price: '₹1,000',
      duration: 'per scan',
      features: [
        'Everything in Basic',
        'OpenVAS Deep Scan',
        'Nessus Integration',
        'Advanced Reports',
        'AI Chatbot Access',
        'Priority Support'
      ],
      popular: true,
      color: 'from-green-500 to-cyan-500'
    },
    {
      name: 'Enterprise',
      price: '₹10,000',
      duration: 'monthly',
      features: [
        'All Tools Unlimited',
        'Custom Tool Integration',
        'Real-time Monitoring',
        'Team Collaboration',
        'Dedicated AI Assistant',
        'Custom API Access',
        '24/7 Phone Support'
      ],
      popular: false,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Matrix Rain Background */}
      <div id="matrix-rain" className="matrix-rain"></div>

      {/* Animated Grid Background */}
      <div className="cyber-grid absolute inset-0 opacity-20"></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/cyber-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-darker via-transparent to-cyber-darker"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-4">
              <span className="text-white">Cyber</span>
              <span className="text-cyber-primary glow-text">Guardian</span>
              <span className="text-white"> AI</span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-cyber-primary to-cyber-secondary mx-auto rounded-full mb-6"></div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Advanced AI-powered security assistant for intelligent vulnerability scanning, 
              threat analysis, and automated penetration testing.
            </p>
          </motion.div>

          {/* Animated CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-lg font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2 group">
              Start Free Scan
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-cyber-primary rounded-lg font-bold text-lg hover:bg-cyber-primary/10 transition-colors duration-300">
              Watch Demo
            </button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: '10K+', label: 'Scans Completed' },
              { value: '99.9%', label: 'Accuracy' },
              { value: '50+', label: 'Tools Integrated' },
              { value: '24/7', label: 'AI Monitoring' }
            ].map((stat, index) => (
              <div
                key={index}
                className="cyber-border p-6 rounded-xl backdrop-blur-sm bg-cyber-dark/30 hover:bg-cyber-dark/50 transition-all duration-300"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`text-3xl font-bold ${hoveredCard === index ? 'text-cyber-primary glow-text' : 'text-white'}`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-gray-400 animate-bounce">Scroll Down</div>
        </motion.div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What We <span className="text-cyber-primary">Offer</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Comprehensive cybersecurity solutions powered by artificial intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="tool-card p-6 rounded-xl relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Icon className="h-12 w-12 text-cyber-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tools Integration Section */}
      <section className="py-20 px-4 bg-cyber-dark/50 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Integrated <span className="text-cyber-primary">Tools</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              We integrate industry-leading security tools for comprehensive analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center p-6 tool-card rounded-xl"
                >
                  <div className="p-4 rounded-full mb-4" style={{ backgroundColor: `${tool.color}20` }}>
                    <Icon className="h-8 w-8" style={{ color: tool.color }} />
                  </div>
                  <span className="font-semibold">{tool.name}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Choose Your <span className="text-cyber-primary">Plan</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Flexible pricing for individuals, teams, and enterprises
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className={`price-card rounded-xl p-8 relative ${plan.popular ? 'ring-2 ring-cyber-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-cyber-primary text-cyber-darker font-bold rounded-full text-sm">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.duration}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-cyber-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 rounded-lg font-bold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary'
                      : 'bg-cyber-dark border border-cyber-primary'
                  } hover:opacity-90 transition-opacity`}>
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="cyber-border rounded-2xl p-12 bg-gradient-to-br from-cyber-dark to-cyber-darker"
          >
            <LockClosedIcon className="h-16 w-16 text-cyber-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Secure Your Digital Assets?
            </h2>
            <p className="text-gray-400 text-xl mb-8">
              Join thousands of security professionals using CyberGuardian AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-lg font-bold text-lg hover:scale-105 transition-transform duration-300">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-cyber-primary rounded-lg font-bold text-lg hover:bg-cyber-primary/10 transition-colors duration-300">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-cyber-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ShieldCheckIcon className="h-8 w-8 text-cyber-primary" />
              <span className="text-xl font-bold">CyberGuardian AI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 National Technical Research Organisation. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage