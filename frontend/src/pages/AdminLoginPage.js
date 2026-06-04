import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
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

  const { login, user, logout } = useAuth();
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
        // Here we need to verify role. However, AuthContext sets the user state asynchronously 
        // after login resolves if it returns success. But `login` currently doesn't immediately 
        // return the user object cleanly to check. Wait, let's look at AuthContext: 
        // `const { user... } = response.data; ... return { success: true };`
        // We can check if `result.success` is true, then we can verify `user.role` after redirect, 
        // OR we can trust `App.js` protected routing to kick them out of `/admin` if they aren't admin.
        // Let's rely on App.js to do the protection, so we just navigate directly to `/admin`.
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-6 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-red-950/10 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[5%] w-80 h-80 bg-red-600/10 rounded-full blur-[90px] animate-blob-1"></div>
        <div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-dark-800/20 rounded-full blur-[100px] animate-blob-2"></div>
        
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
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0) 70%)',
              border: '1px solid rgba(239, 68, 68, 0.05)',
              animation: `floatUp ${p.duration}s infinite linear`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="flex justify-center">
          <ShieldAlert className="h-14 w-14 text-red-500 animate-float" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold text-dark-100">
          Administrator Access
        </h2>
        <p className="mt-2 text-center text-sm text-red-400 font-medium">
          ForensicsAI System Administration
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up delay-100">
        <div className="card py-6 px-6 border-t-4 border-t-red-600 sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                Admin Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field focus:ring-red-500 focus:border-red-500 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="admin@forensicsai.com"
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
                  className={`input-field pr-10 focus:ring-red-500 focus:border-red-500 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your administrative password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-dark-400 hover:text-red-400 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-dark-400 hover:text-red-400 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-100 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-dark-900 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2 border-t-white" />
                    Authenticating...
                  </>
                ) : (
                  'Secure Login'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-dark-400">Not an Administrator?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-dark-600 rounded-md shadow-sm text-sm font-medium text-dark-200 bg-transparent hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-900 transition-colors duration-200"
              >
                Return to Investigator Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
