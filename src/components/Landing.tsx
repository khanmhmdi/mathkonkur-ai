import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Sparkles, MessageSquare, Sigma, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sigma className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">MathKonkur</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">ویژگی‌ها</a>
            <Link 
              to="/bank"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              بانک سوالات
            </Link>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <span className="text-sm text-slate-700 font-medium">{user.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </div>
            ) : (
              <Link 
                to="/auth"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                <LogIn className="w-4 h-4" />
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Hero = ({ onStartChat }: { onStartChat: () => void }) => {
  return (
    <section className="pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center relative">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3 h-3" />
          <span>هوش مصنوعی فوق‌تخصص ریاضیات کنکور</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.2]">
          ۱۰۰٪ ریاضی کنکور با <br />
          <span className="text-indigo-600">دستیار هوشمند MathKonkur</span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          از جبر و احتمال تا حسابان و هندسه؛ تمام مباحث کنکور را با تحلیل‌های دقیق هوش مصنوعی و متد آموزشی تعاملی استاد شوید.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStartChat}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <Sigma className="w-5 h-5" />
            شروع حل تست و رفع اشکال
          </button>
          <Link 
            to="/bank"
            className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            بانک سوالات کنکور
          </Link>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          {[
            {
              title: "پوشش کامل سرفصل‌ها",
              desc: "از حسابان و دیفرانسیل تا گسسته و هندسه تحلیلی مطابق با آخرین تغییرات کتاب درسی.",
              icon: Sigma
            },
            {
              title: "نمایش فرمول‌ها با LaTeX",
              desc: "تمامی فرمول‌ها و محاسبات به صورت کاملاً استاندارد و خوانا نمایش داده می‌شوند.",
              icon: BookOpen
            },
            {
              title: "تحلیل گام‌به‌گام تست",
              desc: "ارائه نکات کنکوری، دام‌های آموزشی و روش‌های تستی برای هر سوال.",
              icon: Sparkles
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

