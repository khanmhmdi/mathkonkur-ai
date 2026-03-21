import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Hero } from './components/Landing';
import { ChatInterface } from './components/ChatInterface';
import { QuestionBank } from './components/QuestionBank';
import { AuthTestComponent } from './components/AuthTestComponent';
import { AnimatePresence } from 'motion/react';
import { Sigma } from 'lucide-react';
import { Question } from './data/questions';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleAskAI = (q: Question) => {
    let message = `لطفاً این سوال کنکور را برای من تحلیل کن و گام‌به‌گام توضیح بده:\n\n${q.text}\n\nگزینه‌ها:\n${q.options.map((o, i) => `${i+1}) ${o}`).join('\n')}`;
    if (q.image) {
      message += `\n\n[توجه: این سوال دارای یک تصویر هندسی/نمودار است که آدرس آن ${q.image} می‌باشد. لطفاً در تحلیل خود به ویژگی‌های بصری احتمالی اشاره کن.]`;
    }
    setInitialMessage(message);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900" dir="rtl">
      <Navbar />
      <div className="bg-slate-50 border-b border-slate-100 py-2 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-700 text-xs">
          ذخیره نشان‌ها در مرورگر شما انجام می‌شود. برای استفاده از PostgreSQL، بک‌اند خود را با APIهای مرتبط بسازید.
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <main>
            <Hero 
              onStartChat={() => {
                setInitialMessage(null);
                setIsChatOpen(true);
              }} 
            />
            
            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">چرا MathKonkur را انتخاب کنیم؟</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    ما تمام مباحث ریاضیات کنکور را با دقت بالا و به صورت تخصصی پوشش می‌دهیم.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "فرمول‌های خوانا", desc: "نمایش تمام معادلات و فرمول‌ها با استفاده از LaTeX برای وضوح کامل." },
                    { title: "تحلیل تخصصی حسابان", desc: "تمرکز ویژه بر مباحث سنگین حد، مشتق و انتگرال با متدهای نوین." },
                    { title: "هندسه و گسسته", desc: "آموزش مفهومی هندسه تحلیلی و مباحث ترکیبیات و احتمال." },
                    { title: "تکنیک‌های تست‌زنی", desc: "ارائه روش‌های سریع و نکات کلیدی برای مدیریت زمان در جلسه کنکور." }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">MathKonkur چگونه یادگیری شما را متحول می‌کند؟</h2>
                    <div className="space-y-8">
                      {[
                        { step: "۰۱", title: "انتخاب سرفصل ریاضی", desc: "از بین ۸ سرفصل اصلی ریاضیات کنکور، مبحث مورد نظر خود را انتخاب کنید." },
                        { step: "۰۲", title: "ارسال تست یا مبحث", desc: "تست مورد نظر یا مفهومی که در آن ابهام دارید را برای هوش مصنوعی بفرستید." },
                        { step: "۰۳", title: "یادگیری عمیق و تستی", desc: "هوش مصنوعی با تحلیل دقیق و نمایش فرمول‌ها، شما را تا حل کامل سوال همراهی می‌کند." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6">
                          <span className="text-4xl font-bold text-indigo-100">{item.step}</span>
                          <div>
                            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                            <p className="text-slate-600">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="aspect-square bg-indigo-600 rounded-[40px] relative overflow-hidden shadow-2xl shadow-indigo-200">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 flex flex-col justify-center">
                        <div className="w-12 h-12 bg-white rounded-2xl mb-6 flex items-center justify-center">
                          <Sigma className="text-indigo-600 w-8 h-8" />
                        </div>
                        <p className="text-white text-xl font-medium leading-relaxed text-center">
                          "ریاضیات کنکور فقط فرمول نیست، درک منطق پشت هر معادله کلید موفقیت توست."
                        </p>
                        <p className="text-white/60 mt-4 text-sm text-center">— هوش مصنوعی MathKonkur</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        } />
        <Route path="/bank" element={
          <QuestionBank 
            onClose={() => navigate('/')} 
            onAskAI={handleAskAI}

          />
        } />
        <Route path="/auth-test" element={<AuthTestComponent />} />
      </Routes>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© ۲۰۲۶ MathKonkur AI. تخصصی‌ترین پلتفرم هوشمند ریاضیات کنکور.</p>
        </div>
      </footer>

      <AnimatePresence>
        {isChatOpen && (
          <ChatInterface 
            onClose={() => {
              setIsChatOpen(false);
              setInitialMessage(null);
            }} 
            initialMessage={initialMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}
