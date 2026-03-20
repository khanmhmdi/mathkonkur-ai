import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Filter, HelpCircle, Lightbulb, MessageSquare, Search, Sigma, Star, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { cn } from '../utils/cn';

export const QuestionBank = ({ onClose, onAskAI }: { onClose: () => void, onAskAI: (q: any) => void }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [qRes, fRes] = await Promise.all([
        api.get<any[]>('/questions'),
        api.get<any[]>('/favorites')
      ]);
      setQuestions(qRes.data.data);
      setFavorites(fRes.data.data.map((f: any) => f.questionId));
    } catch (error) {
      console.error("Failed to load question bank data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (questionId: string) => {
    try {
      const isFav = favorites.includes(questionId);
      if (isFav) {
        await api.delete(`/favorites/${questionId}`);
        setFavorites(prev => prev.filter(id => id !== questionId));
      } else {
        await api.post('/favorites', { questionId });
        setFavorites(prev => [...prev, questionId]);
      }
    } catch (error) {
      alert('خطا در بروزرسانی لیست نشان‌شده‌ها');
    }
  };

  const recordAttempt = async (questionId: string, answerIndex: number) => {
    try {
      await api.post(`/questions/${questionId}/submit`, {
        answerIndex,
        timeSpentSeconds: 60 // Mock for now
      });
    } catch (error) {
      console.error("Failed to record attempt", error);
    }
  };

  const subjects = ['all', ...Array.from(new Set(questions.map(q => q.subject)))];
  const levels = ['all', 'آسان', 'متوسط', 'سخت'];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || q.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || q.level === selectedLevel;
    const matchesFavorites = !showOnlyFavorites || favorites.includes(q.id);
    return matchesSearch && matchesSubject && matchesLevel && matchesFavorites;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-white flex flex-col overflow-hidden text-right min-h-[calc(100vh-120px)]"
      dir="rtl"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Sigma className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">بانک سوالات کنکور ۱۴۰۴</h2>
            <p className="text-xs text-slate-500">تحلیل هوشمند جدیدترین تست‌های کنکور</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600 font-bold text-sm"
        >
          <ChevronRight className="w-4 h-4" />
          بازگشت به خانه
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Question List */}
        <div className="w-full md:w-96 border-l border-slate-100 flex flex-col bg-slate-50/30">
          {/* Search and Filter Panel */}
          <div className="p-4 bg-white border-b border-slate-100 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="جستجو در سوالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    selectedSubject === subject 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600"
                  )}
                >
                  {subject === 'all' ? 'همه موضوعات' : subject}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 w-full mb-1">سطح دشواری:</span>
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                    selectedLevel === level 
                      ? (level === 'آسان' ? "bg-green-500 text-white" : level === 'متوسط' ? "bg-amber-500 text-white" : level === 'سخت' ? "bg-red-500 text-white" : "bg-slate-600 text-white")
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {level === 'all' ? 'همه سطوح' : level}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  showOnlyFavorites 
                    ? "bg-amber-500 text-white shadow-sm" 
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                )}
              >
                <Star className={cn("w-4 h-4", showOnlyFavorites && "fill-current")} />
                {showOnlyFavorites ? "نمایش همه سوالات" : "نمایش سوالات نشان شده"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm">در حال بارگذاری سوالات...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setShowExplanation(false);
                    // Also fire a "view" attempt? No, let's wait for actual interaction
                  }}
                  className={cn(
                    "w-full text-right p-4 rounded-2xl border transition-all group",
                    selectedQuestion?.id === q.id 
                      ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20" 
                      : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {q.subject}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        q.level === 'آسان' ? "text-green-600 bg-green-50" : 
                        q.level === 'متوسط' ? "text-amber-600 bg-amber-50" : 
                        "text-red-600 bg-red-50"
                      )}>
                        {q.level}
                      </span>
                      {favorites.includes(q.id) && (
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">سوال {q.questionNumber || q.id.slice(0,4)}</span>
                  </div>
                  <div className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {q.text}
                    </ReactMarkdown>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">سوالی با این مشخصات پیدا نشد.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Question Detail */}
        <div className="hidden md:flex flex-1 flex-col bg-white overflow-y-auto p-8">
          {selectedQuestion ? (
            <div className="max-w-2xl mx-auto w-full space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-bold">صورت سوال:</span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedQuestion.id)}
                    className={cn(
                      "p-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold",
                      favorites.includes(selectedQuestion.id)
                        ? "bg-amber-50 border-amber-200 text-amber-600"
                        : "bg-white border-slate-200 text-slate-400 hover:border-amber-200 hover:text-amber-600"
                    )}
                  >
                    <Star className={cn("w-5 h-5", favorites.includes(selectedQuestion.id) && "fill-current")} />
                    {favorites.includes(selectedQuestion.id) ? "نشان شده" : "نشان کردن سوال"}
                  </button>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-lg leading-relaxed text-slate-800">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {selectedQuestion.text}
                  </ReactMarkdown>
                  
                  {selectedQuestion.image && (
                    <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-white">
                      <img 
                        src={selectedQuestion.image} 
                        alt="Question figure" 
                        className="w-full h-auto object-contain max-h-[300px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedQuestion.options.map((opt, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-100 bg-white flex items-center gap-4 hover:border-emerald-200 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {opt}
                      </ReactMarkdown>
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-8">
                <button 
                  onClick={() => {
                    setShowExplanation(!showExplanation);
                    if (!showExplanation) recordAttempt(selectedQuestion.id, -1); // -1 indicates "show explanation/viewed"
                  }}
                  className="flex-1 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-5 h-5" />
                  {showExplanation ? "پنهان کردن پاسخ" : "مشاهده پاسخ تشریحی"}
                </button>
                <button 
                  onClick={() => onAskAI(selectedQuestion)}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  تحلیل هوشمند با AI
                </button>
              </div>

              <AnimatePresence>
                {showExplanation && selectedQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-8 bg-amber-50 rounded-[32px] border border-amber-100"
                  >
                    <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      تحلیل و پاسخ تشریحی:
                    </h4>
                    <div className="prose prose-amber max-w-none text-amber-800 leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {selectedQuestion.explanation}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Sigma className="w-16 h-16 opacity-20" />
              <p className="font-medium">یک سوال را از لیست سمت راست انتخاب کنید.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
