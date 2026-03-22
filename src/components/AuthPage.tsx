import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, GraduationCap, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const levels = ['ریاضی فیزیک', 'علوم تجربی', 'انسانی و معارف'] as const;

type Level = (typeof levels)[number];

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, register, logout, user } = useAuth();
  
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level>('ریاضی فیزیک');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, isLoading, navigate, returnUrl]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    
    // Validation
    if (!email) {
      setError('ایمیل الزامی است');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('ایمیل معتبر نیست');
      return;
    }
    if (!password || password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (mode === 'register' && !name) {
      setError('نام الزامی است');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
        setStatus('ورود با موفقیت انجام شد. درحال انتقال ...');
      } else {
        await register({ email, password, name, level });
        setStatus('ثبت نام با موفقیت انجام شد. درحال انتقال ...');
      }
      setTimeout(() => navigate(returnUrl), 500);
    } catch (err: any) {
      console.error('[AuthPage] auth error', err);
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'خطای شبکه یا اطلاعات نامعتبر');
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setStatus(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center gap-4">
          <div className="animate-spin">
            <Loader className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-slate-600 font-medium">در حال بارگذاری ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4 py-12" dir="rtl">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              MathKonkur
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            {mode === 'login' 
              ? 'وارد دستیار ریاضی کنکور شوید' 
              : 'حساب جدید خود را ایجاد کنید'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex bg-gradient-to-r from-indigo-600 to-blue-600 p-2 gap-2">
            <button
              onClick={() => { toggleMode(); if (mode !== 'login') setMode('login'); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'login' 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ورود
            </button>
            <button
              onClick={() => { toggleMode(); if (mode !== 'register') setMode('register'); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'register' 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ثبت نام
            </button>
          </div>

          <div className="p-8">
            {/* Already Logged In */}
            {isAuthenticated && user ? (
              <div className="mb-6 p-4 border-2 border-green-100 rounded-2xl bg-green-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-semibold mb-1">شما وارد شده‌اید</p>
                    <p className="text-green-700 text-sm mb-3">
                      با حساب <strong>{user.name}</strong> ({user.email})
                    </p>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {status && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
                  <p className="text-green-700 text-sm font-medium">{status}</p>
                </div>
              )}

              {/* Register: Name Field */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    نام و نام‌خانوادگی
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); error && setError(null); }}
                      placeholder="نام خود را وارد کنید"
                      minLength={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); error && setError(null); }}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); error && setError(null); }}
                    placeholder="حداقل ۶ کاراکتر"
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Register: Level Selection */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    شاخه تحصیلی
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as Level)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer font-medium"
                  >
                    {levels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
                {isSubmitting 
                  ? 'لطفاً منتظر بمانید...' 
                  : (mode === 'login' ? 'ورود' : 'ایجاد حساب')}
              </button>
            </form>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <p className="text-blue-700 text-xs leading-relaxed">
            با ورود یا ثبت‌نام، شما قوانین استفاده و سیاست حفاظت از داده‌های شخصی را پذیرفته‌اید.
          </p>
        </div>
      </div>
    </div>
  );
}
