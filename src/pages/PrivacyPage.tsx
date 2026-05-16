import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600/20 p-3 rounded-2xl">
              <Eye className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> مقدمة
              </h2>
              <p>نحن في GamersStore نقدر خصوصيتك تماماً. نلتزم بحماية بياناتك الشخصية وضمان سرية المعلومات التي تشاركها معنا عند استخدام منصتنا لشراء أو بيع المنتجات الرقمية.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> البيانات التي نجمعها
              </h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، ورقم الهاتف.</li>
                <li>بيانات الدفع: يتم معالجتها عبر بوابات دفع مشفرة ولا نقوم بتخزين بيانات البطاقات لدينا.</li>
                <li>سجلات الاستخدام: لتحسين تجربة التسوق الخاصة بك.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> ملفات تعريف الارتباط (Cookies)
              </h2>
              <p>نستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك وتسهيل عملية تسجيل الدخول وضمان استقرار سلة التسوق الخاصة بك أثناء التصفح.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> حماية البيانات
              </h2>
              <p>تخضع جميع البيانات لمعالجة مشفرة (End-to-End Encryption) ولا يتم مشاركتها أبداً مع أطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
