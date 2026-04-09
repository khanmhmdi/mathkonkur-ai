import React from 'react';
import { motion } from 'motion/react';
import { Check, Sigma, Zap, Star, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PRICING_PLANS = [
  {
    name: 'رایگان',
    price: '۰',
    description: 'برای شروع یادگیری و آشنایی با سیستم',
    features: [
      'دسترسی به بانک سوالات عمومی',
      '۵ پرسش از هوش مصنوعی در روز',
      'ذخیره تا ۱۰ سوال نشان‌دار',
      'تحلیل پایه پاسخ‌ها'
    ],
    buttonText: 'شروع رایگان',
    highlight: false,
    icon: Sigma,
    color: 'slate'
  },
  {
    name: 'حرفه‌ای (Pro)',
    price: '۱۹۹,۰۰۰',
    period: 'ماهانه',
    description: 'محبوب‌ترین انتخاب برای دانش‌آموزان کنکوری',
    features: [
      'دسترسی نامحدود به تمام سوالات',
      'پرسش نامحدود از هوش مصنوعی',
      'ذخیره نامحدود سوالات نشان‌دار',
      'تحلیل پیشرفته با متد تستی',
      'رفع اشکال هوشمند مبحثی',
      'بدون تبلیغات'
    ],
    buttonText: 'خرید اشتراک پرو',
    highlight: true,
    icon: Zap,
    color: 'indigo'
  },
  {
    name: 'طلایی (Elite)',
    price: '۴۹۹,۰۰۰',
    period: '۳ ماهه',
    description: 'کامل‌ترین پکیج برای موفقیت ۱۰۰٪ در کنکور',
    features: [
      'تمام امکانات نسخه حرفه‌ای',
      'برنامه‌ریزی هوشمند هفتگی',
      'آزمون‌های شبیه‌ساز کنکور',
      'پشتیبانی اولویت‌دار',
      'گزارش تحلیلی نقاط ضعف و قوت',
      'دسترسی به جزوات اختصاصی'
    ],
    buttonText: 'خرید اشتراک طلایی',
    highlight: false,
    icon: Trophy,
    color: 'amber'
  }
];

export const PricingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePlanSelect = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnUrl: '/pricing' } });
      return;
    }
    // TODO: Handle payment flow when authenticated
    alert('این قابلیت به زودی فعال می‌شود!');
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6"
          >
            <Star className="w-3 h-3" />
            <span>پلن‌های اشتراک MathKonkur</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            مسیر موفقیت خود را <span className="text-indigo-600">انتخاب کنید</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            با انتخاب یکی از پلن‌های زیر، به ابزارهای پیشرفته هوش مصنوعی برای تسلط کامل بر ریاضیات کنکور دسترسی پیدا کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-[40px] p-8 border-2 flex flex-col ${
                plan.highlight 
                  ? 'border-indigo-600 shadow-2xl shadow-indigo-100 scale-105 z-10' 
                  : 'border-slate-100 shadow-sm hover:shadow-md transition-shadow'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  پیشنهاد ویژه
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                plan.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                plan.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                <plan.icon className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{plan.description}</p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-medium">تومان</span>
                </div>
                {plan.period && (
                  <span className="text-slate-400 text-xs mt-1 block">/ {plan.period}</span>
                )}
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-slate-600 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handlePlanSelect}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.highlight 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                {plan.buttonText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 bg-slate-50 rounded-[40px] p-12 border border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-right">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">نیاز به پلن سازمانی یا گروهی دارید؟</h3>
              <p className="text-slate-600">برای مدارس و آموزشگاه‌ها تخفیف‌های ویژه‌ای در نظر گرفته‌ایم.</p>
            </div>
            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
              تماس با واحد فروش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
