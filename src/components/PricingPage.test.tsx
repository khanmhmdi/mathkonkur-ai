import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PricingPage } from '../components/PricingPage';
import { AuthProvider } from '../contexts/AuthContext';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('PricingPage', () => {
  it('renders the pricing page title', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('انتخاب کنید')).toBeInTheDocument();
  });

  it('renders all three pricing plans', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('رایگان')).toBeInTheDocument();
    expect(screen.getByText('حرفه‌ای (Pro)')).toBeInTheDocument();
    expect(screen.getByText('طلایی (Elite)')).toBeInTheDocument();
  });

  it('renders the free plan with correct price', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('۰')).toBeInTheDocument();
    expect(screen.getAllByText(/تومان/).length).toBe(3);
  });

  it('renders the Pro plan with correct price', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('۱۹۹,۰۰۰')).toBeInTheDocument();
    expect(screen.getByText(/ماهانه/)).toBeInTheDocument();
  });

  it('renders the Elite plan with correct price', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('۴۹۹,۰۰۰')).toBeInTheDocument();
    expect(screen.getByText(/۳ ماهه/)).toBeInTheDocument();
  });

  it('renders the featured badge for Pro plan', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('پیشنهاد ویژه')).toBeInTheDocument();
  });

  it('renders all feature items for free plan', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('دسترسی به بانک سوالات عمومی')).toBeInTheDocument();
    expect(screen.getByText('۵ پرسش از هوش مصنوعی در روز')).toBeInTheDocument();
    expect(screen.getByText('ذخیره تا ۱۰ سوال نشان‌دار')).toBeInTheDocument();
    expect(screen.getByText('تحلیل پایه پاسخ‌ها')).toBeInTheDocument();
  });

  it('renders all feature items for Pro plan', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('دسترسی نامحدود به تمام سوالات')).toBeInTheDocument();
    expect(screen.getByText('پرسش نامحدود از هوش مصنوعی')).toBeInTheDocument();
    expect(screen.getByText('تحلیل پیشرفته با متد تستی')).toBeInTheDocument();
  });

  it('renders all feature items for Elite plan', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('تمام امکانات نسخه حرفه‌ای')).toBeInTheDocument();
    expect(screen.getByText('برنامه‌ریزی هوشمند هفتگی')).toBeInTheDocument();
    expect(screen.getByText('آزمون‌های شبیه‌ساز کنکور')).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('شروع رایگان')).toBeInTheDocument();
    expect(screen.getByText('خرید اشتراک پرو')).toBeInTheDocument();
    expect(screen.getByText('خرید اشتراک طلایی')).toBeInTheDocument();
  });

  it('renders enterprise contact section', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('نیاز به پلن سازمانی یا گروهی دارید؟')).toBeInTheDocument();
    expect(screen.getByText('تماس با واحد فروش')).toBeInTheDocument();
  });

  it('renders the pricing badge', () => {
    renderWithRouter(<PricingPage />);
    expect(screen.getByText('پلن‌های اشتراک MathKonkur')).toBeInTheDocument();
  });
});
