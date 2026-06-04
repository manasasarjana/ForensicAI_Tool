import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, FileText, BarChart3, Users } from 'lucide-react';

const LandingPage = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      left: Math.random() * 100,
      size: Math.random() * 40 + 10,
      delay: Math.random() * 15,
      duration: Math.random() * 15 + 12,
    }));
  }, []);
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms automatically analyze evidence and generate comprehensive forensic reports.'
    },
    {
      icon: Lock,
      title: 'SHA-256 Integrity',
      description: 'Cryptographic hashing ensures evidence integrity and maintains chain of custody.'
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Generate court-ready forensic reports with structured analysis and findings.'
    },
    {
      icon: BarChart3,
      title: 'Audit Logging',
      description: 'Complete audit trail of all actions for compliance and accountability.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Secure access control with investigator and administrator roles.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption, authentication, and secure storage.'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary-600/15 rounded-full blur-[100px] animate-blob-1"></div>
        <div className="absolute bottom-[30%] right-[15%] w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-[120px] animate-blob-2"></div>
        <div className="absolute top-[60%] left-[30%] w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] animate-blob-1"></div>
        
        {/* Floating Particles / Bubbles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              bottom: '-100px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
              border: '1px solid rgba(99, 102, 241, 0.05)',
              animation: `floatUp ${p.duration}s infinite linear`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-dark-800/40 backdrop-blur-md border-b border-dark-700/50 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary-500 animate-float" />
              <span className="ml-2 text-xl font-bold text-dark-100 tracking-wider">ForensicsAI</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black text-dark-100 mb-6 tracking-tight">
            Automated Digital
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-500"> Forensics</span>
            <br />
            Reporting Tool
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional-grade digital forensics platform with AI-powered analysis,
            secure evidence management, and automated report generation for law enforcement
            and cybersecurity professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-100">
            <Link to="/register" className="btn-primary text-lg px-8 py-3.5">
              Start Investigation
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3.5">
              Access Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-800/20 backdrop-blur-sm border-y border-dark-800/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
              Enterprise-Grade Forensics Platform
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Built for professionals who demand accuracy, security, and efficiency
              in digital forensic investigations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`card p-6 text-center animate-fade-in-up delay-${(index % 5 + 1) * 100} hover:scale-[1.03] hover:border-primary-500/30 transition-all duration-300`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600/25 border border-primary-500/30 rounded-xl mb-4 text-primary-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
              Streamlined Investigation Workflow
            </h2>
            <p className="text-xl text-dark-300">
              From evidence collection to final report - all in one secure platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Case', desc: 'Initialize new investigation with case details and metadata' },
              { step: '2', title: 'Upload Evidence', desc: 'Secure evidence upload with automatic hash verification' },
              { step: '3', title: 'AI Analysis', desc: 'Automated analysis and report generation using AI' },
              { step: '4', title: 'Export Report', desc: 'Professional PDF/DOCX reports ready for court' }
            ].map((item, idx) => (
              <div key={idx} className={`text-center animate-fade-in-up delay-${(idx + 1) * 100} p-6 card hover:scale-[1.03] transition-all duration-300`}>
                <div className="w-12 h-12 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-primary-400 shadow-md shadow-primary-600/10">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-dark-100 mb-2">{item.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary-900/40 to-indigo-950/40 backdrop-blur-md border border-primary-500/20 rounded-3xl p-12 shadow-2xl animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
            Ready to Transform Your Forensic Workflow?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join law enforcement agencies and cybersecurity teams using ForensicsAI
            to streamline their digital investigations.
          </p>
          <div className="flex justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3.5 hover:scale-105 active:scale-100 transition-all">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-800/40 backdrop-blur-md border-t border-dark-700/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary-500" />
              <span className="ml-2 text-lg font-semibold text-dark-100">ForensicsAI</span>
            </div>
            <div className="flex space-x-6 text-sm text-dark-400">
              <a href="#" className="hover:text-dark-100">Privacy Policy</a>
              <a href="#" className="hover:text-dark-100">Terms of Service</a>
              <a href="#" className="hover:text-dark-100">Documentation</a>
              <a href="#" className="hover:text-dark-100">Support</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-700/40 text-center text-sm text-dark-400">
            © 2024 ForensicsAI. All rights reserved. Built for digital forensics professionals.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default LandingPage;