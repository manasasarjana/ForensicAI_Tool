import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, FileText, BarChart3, Users } from 'lucide-react';

const LandingPage = () => {
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
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-dark-100">ForensicsAI</span>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-dark-100 mb-6">
            Automated Digital
            <span className="text-primary-500"> Forensics</span>
            <br />
            Reporting Tool
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            Professional-grade digital forensics platform with AI-powered analysis,
            secure evidence management, and automated report generation for law enforcement
            and cybersecurity professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Investigation
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Access Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
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
                <div key={index} className="card p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-dark-100" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
              Streamlined Investigation Workflow
            </h2>
            <p className="text-xl text-dark-300">
              From evidence collection to final report - all in one secure platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-dark-100">1</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Create Case</h3>
              <p className="text-dark-300">Initialize new investigation with case details and metadata</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-dark-100">2</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Upload Evidence</h3>
              <p className="text-dark-300">Secure evidence upload with automatic hash verification</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-dark-100">3</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">AI Analysis</h3>
              <p className="text-dark-300">Automated analysis and report generation using AI</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-dark-100">4</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Export Report</h3>
              <p className="text-dark-300">Professional PDF/DOCX reports ready for court</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
            Ready to Transform Your Forensic Workflow?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join law enforcement agencies and cybersecurity teams using ForensicsAI
            to streamline their digital investigations.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3 bg-white text-primary-900 hover:bg-gray-100">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-800 border-t border-dark-700 py-8">
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
          <div className="mt-4 pt-4 border-t border-dark-700 text-center text-sm text-dark-400">
            © 2024 ForensicsAI. All rights reserved. Built for digital forensics professionals.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;