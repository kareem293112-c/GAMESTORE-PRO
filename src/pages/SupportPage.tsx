import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Phone, Clock, HelpCircle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SupportPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال رسالتك بنجاح! سيرد فريقنا عليك قريباً.');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            كيف يمكننا مساعدتك؟
          </motion.h1>
          <p className="text-slate-400 text-lg">فريق الدعم الفني جاهز للرد على استفساراتكم على مدار الساعة.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-indigo-500" /> قنوات التواصل
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">واتساب 24/7</p>
                    <p className="text-white font-bold">+905360167664</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                    <p className="text-white font-bold">karmo2931@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ساعات العمل</p>
                    <p className="text-white font-bold">11:00 AM - 11:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl h-full">
              <h2 className="text-2xl font-bold text-white mb-6">أرسل تذكرة دعم</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400 mr-2">الاسم الكامل</label>
                    <input type="text" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400 mr-2">البريد الإلكتروني</label>
                    <input type="email" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 mr-2">الموضوع</label>
                  <input type="text" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 mr-2">الرسالة</label>
                  <textarea rows={5} required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
                  <Send className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" /> إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
