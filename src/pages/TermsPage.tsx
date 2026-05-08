import React from 'react';
import { motion } from 'motion/react';
import { FileText, Gavel, Users, Scale, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600/20 p-3 rounded-2xl">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">اتفاقية العضوية وشروط الاستخدام</h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> أهلية العضوية
              </h2>
              <p>باستخدامك لهذا الموقع، تقر بأن عمرك لا يقل عن 18 عاماً أو أنك تتصفح بموافقة ولي أمرك. العضوية شخصية ولا يجوز التنازل عنها للغير.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-blue-400" /> قواعد السلوك
              </h2>
              <p>يُمنع منعاً باتاً استخدام الموقع لأغراض الاحتيال أو غسيل الأموال أو التحرش بالمستخدمين الآخرين. أي محاولة للتلاعب بنظام الأسعار ستؤدي إلى حظر الحساب فوراً.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" /> حقوق الملكية الفنية
              </h2>
              <p>جميع العلامات التجارية وحقوق الألعاب المعروضة تنتمي لأصحابها الأصليين (مثل Riot Games, Epic Games, etc). متجرنا وسيط لتسهيل عملية النقل والبيع القانوني.</p>
            </section>

            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" /> سياسة الاسترجاع
              </h3>
              <p className="text-sm">نظراً لطبيعة المنتجات الرقمية (أكواد السيريلات، اشتراكات)، لا يمكن استرداد المبلغ بعد "إتمام الطلب" واستلام الكود بنجاح، إلا في حال ثبت عدم صلاحية الكود قبل الاستخدام.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
