import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CreditCard, UserCheck, AlertTriangle } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-600/20 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">نظام تسوق آمن</h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" /> تشفير البيانات (SSL)
              </h2>
              <p>يتم تأمين جميع المعاملات على موقعنا باستخدام بروتوكول SSL المتطور 256-bit، مما يضمن أن بياناتك الشخصية وتفاصيل طلباتك مشفرة بالكامل وغير قابلة للاختراق.</p>
            </section>

            <section className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> حماية المدفوعات
              </h2>
              <p>نحن نعمل مع مزودي دفع معتمدين دولياً (PCI-DSS Compliant). لا نقوم بالاطلاع على أرقام بطاقاتك الائتمانية أو تخزينها؛ عملية الدفع تتم في بيئة مصرفية معزولة تماماً.</p>
            </section>

            <section className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" /> التحقق من الهوية
              </h2>
              <p>نطبق نظام التحقق الثنائي (2FA) لضمان أن صاحب الحساب هو الوحيد القادر على إتمام العمليات الحساسة وسحب المبالغ المالية.</p>
            </section>

            <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-amber-200">نصيحة أمان: لا تشارك كلمة مرور حسابك أو رموز التحقق مع أي شخص، حتى لو ادعى أنه من فريق دعم GamersStore.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
