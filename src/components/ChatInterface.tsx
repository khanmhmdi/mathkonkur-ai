import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, X, ChevronDown, Sigma, Image as ImageIcon, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUBJECTS = [
  "جبر و توابع", 
  "معادله و نامعادله", 
  "توابع و نمودارها", 
  "مثلثات", 
  "هندسه تحلیلی", 
  "بردارها و هندسه", 
  "حسابان",
  "گسسته و احتمال"
];

const LEVELS = [
  "ریاضی فیزیک", "علوم تجربی", "انسانی و معارف"
];

export const ChatInterface = ({ onClose, initialMessage }: { onClose: () => void, initialMessage?: string | null }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "سلام! من MathKonkur AI هستم. آماده‌ام تا در حل سخت‌ترین تست‌های ریاضی و درک عمیق مفاهیم حسابی و هندسی بهت کمک کنم. کدوم مبحث رو شروع کنیم؟" }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [subject, setSubject] = useState(SUBJECTS[6]); // Default to Calculus
  const [level, setLevel] = useState(LEVELS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [visitorLimitExceeded, setVisitorLimitExceeded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const processedInitialRef = useRef<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Create a new conversation
  const createConversation = async (firstMessage: string, image?: { data: string; mimeType: string }) => {
    try {
      console.log('🔐 ChatInterface: Creating conversation', {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT SET',
        subject,
        level,
        messageLength: firstMessage.length
      });
      
      const res = await api.post<any>('/chat', {
        subject,
        level,
        initialMessage: firstMessage,
        image: image ? `data:${image.mimeType};base64,${image.data}` : undefined
      });
      const data = res.data.data;
      setConversationId(data.conversation.id);
      return data;
    } catch (error: any) {
      console.error("Create Chat Error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  };

  // Handle initial message
  useEffect(() => {
    if (initialMessage && processedInitialRef.current !== initialMessage) {
      processedInitialRef.current = initialMessage;
      
      const startInitialChat = async () => {
        setMessages(prev => [...prev, { role: 'user', text: initialMessage }]);
        setIsSending(true);
        try {
          const conv = await createConversation(initialMessage, selectedImage || undefined);
          if (conv.message?.content) {
            setMessages(prev => [...prev, { role: 'model', text: conv.message.content }]);
          }
          if (selectedImage) setSelectedImage(null);
        } catch (error: any) {
          const errorCode = error.response?.data?.error?.code;
          const status = error.response?.status;
          if (errorCode === 'VISITOR_PROMPT_LIMIT_EXCEEDED' || status === 429) {
            setVisitorLimitExceeded(true);
            setMessages(prev => [...prev, { role: 'model', text: 'برای ادامه در سایت ثبت نام کنید' }]);
          } else {
            setMessages(prev => [...prev, { role: 'model', text: error.message || "خطایی در برقراری ارتباط با سرور رخ داد." }]);
          }
        } finally {
          setIsSending(false);
        }
      };
      startInitialChat();
    }
  }, [initialMessage]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsSending(true);

    try {
      let currentId = conversationId;
      if (!currentId) {
        const conv = await createConversation(userMessage, currentImage || undefined);
        // If createConversation already returned the AI reply (standard in my backend /chat flow)
        if (conv.message?.content) {
          setMessages(prev => [...prev, { role: 'model', text: conv.message.content }]);
          setIsSending(false);
          return;
        }
        currentId = conv.conversation.id;
      }

      // Send to existing chat
      const res = await api.post<any>(`/chat/${currentId}/message`, {
        content: userMessage,
        image: currentImage ? `data:${currentImage.mimeType};base64,${currentImage.data}` : undefined
      });

      setMessages(prev => [...prev, { role: 'model', text: res.data.data.message.content }]);
    } catch (error: any) {
      console.error(error);
      const errorCode = error.response?.data?.error?.code;
      const status = error.response?.status;
      if (errorCode === 'VISITOR_PROMPT_LIMIT_EXCEEDED' || status === 429) {
        setVisitorLimitExceeded(true);
        setMessages(prev => [...prev, { role: 'model', text: 'برای ادامه در سایت ثبت نام کنید' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: error.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید." }]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col md:inset-4 md:rounded-3xl md:shadow-2xl md:border md:border-slate-200 overflow-hidden text-right"
      dir="rtl"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sigma className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">هوش مصنوعی MathKonkur</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                آماده پاسخگویی
              </span>
              <span>•</span>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
              >
                {subject} ({level})
                <ChevronDown className={cn("w-3 h-3 transition-transform", showSettings && "rotate-180")} />
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-slate-100 overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">مبحث مورد نظر</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        subject === s 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">رشته و سطح</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        level === l 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={cn(
              "flex gap-4 max-w-3xl",
              msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === 'user' ? "bg-slate-200" : "bg-indigo-100"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Sigma className="w-5 h-5 text-indigo-600" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tl-none" 
                : "bg-white text-slate-800 border border-slate-100 rounded-tr-none"
            )}>
              <div className="prose prose-sm max-w-none prose-indigo">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isSending && (
          <div className="flex gap-4 max-w-3xl ml-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
              <Sigma className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tr-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">در حال تحلیل ریاضی...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative inline-block"
              >
                <img 
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                  alt="Selected" 
                  className="h-20 w-20 object-cover rounded-xl border border-slate-200"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="سوال ریاضی خود را بپرسید یا تصویری از سوال هندسه بفرستید..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 pl-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[60px] max-h-[200px] text-right"
              rows={1}
              dir="rtl"
            />
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="ارسال تصویر سوال"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isSending}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
              >
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
        
        {visitorLimitExceeded && (
          <div className="px-4 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-amber-800 font-bold mb-3">برای ادامه در سایت ثبت نام کنید</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/auth');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                  ورود / ثبت نام
                </button>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-center text-[10px] text-slate-400 mt-3">
          MathKonkur یک هوش مصنوعی است. برای اطمینان، محاسبات پیچیده را دوباره چک کنید.
        </p>
      </div>
    </motion.div>
  );
};
