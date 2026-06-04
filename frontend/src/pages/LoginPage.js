import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const LoginPage = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      left: Math.random() * 100,
      size: Math.random() * 40 + 10,
      delay: Math.random() * 15,
      duration: Math.random() * 15 + 12,
    }));
  }, []);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[5%] w-80 h-80 bg-primary-600/12 rounded-full blur-[90px] animate-blob-1"></div>
        <div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-indigo-500/12 rounded-full blur-[100px] animate-blob-2"></div>
        
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
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <Link to="/" className="flex justify-center hover:opacity-80 transition-opacity">
          <Shield className="h-12 w-12 text-primary-500 animate-float" />
        </Link>
        <h2 className="mt-4 text-center text-3xl font-bold text-dark-100">
          Sign in to DigitalForensics
        </h2>
        <p className="mt-2 text-center text-sm text-dark-400">
          Access your digital forensics platform
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up delay-100">
        <div className="card py-6 px-6 sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-dark-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-dark-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center mb-4"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Login as Investigator'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                disabled={loading}
                className="btn-secondary w-full flex justify-center items-center font-medium bg-dark-700 hover:bg-dark-600 text-dark-100 border border-dark-600 hover:border-primary-500/50 transition-colors"
              >
                Login as Administrator
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-dark-400">New to DigitalForensics?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="btn-secondary w-full flex justify-center"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <Link
            to="/"
            className="text-sm text-primary-400 hover:text-primary-300 block"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;