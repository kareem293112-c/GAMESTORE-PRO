import React from 'react';
import { motion } from 'motion/react';
import { Truck, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DeliveryPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600/20 p-3 rounded-2xl">
              <Truck className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'ar' ? 'شروط التوصيل والإرجاع' : 'Delivery & Return Conditions'}
            </h1>
          </div>

          <div className="space-y-12 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-400" /> 
                {language === 'ar' ? 'آلية التوصيل' : 'Delivery Mechanism'}
              </h2>
              <p>
                {language === 'ar' 
                  ? 'يتم تسليم معظم المنتجات الرقمية (مثل الأكواد وبطاقات الشحن) بشكل فوري وتلقائي عبر البريد الإلكتروني أو في لوحة التحكم الخاصة بك فور إتمام عملية الدفع بنجاح.' 
                  : 'Most digital products (such as codes and recharge cards) are delivered instantly and automatically via email or in your dashboard as soon as the payment process is successfully completed.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-400" />
                {language === 'ar' ? 'سياسة الإرجاع' : 'Return Policy'}
              </h2>
              <p>
                {language === 'ar'
                  ? 'نظراً لطبيعة المنتجات الرقمية التي لا يمكن إرجاعها بمجرد الكشف عنها، فإننا لا نقوم بعمليات استرداد الأموال إلا في الحالات التالية:'
                  : 'Due to the nature of digital products that cannot be returned once revealed, we do not perform refunds except in the following cases:'}
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li>{language === 'ar' ? 'إذا كان الكود المرسل لا يعمل ولم نتمكن من استبداله.' : 'If the sent code does not work and we are unable to replace it.'}</li>
                <li>{language === 'ar' ? 'إذا لم تتوفر السلعة المطلوبة بعد الدفع.' : 'If the requested item is not available after payment.'}</li>
              </ul>
            </section>

            <section className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {language === 'ar' ? 'تنبيه هام' : 'Important Notice'}
              </h2>
              <p className="text-amber-200/80">
                {language === 'ar'
                  ? 'يرجى التأكد من توافق المنتج مع منطقتك (Region) وجهازك قبل الشراء، حيث أننا لا نتحمل مسؤولية شراء منتجات غير متوافقة.'
                  : 'Please ensure that the product is compatible with your region and device before purchasing, as we are not responsible for purchasing incompatible products.'}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
