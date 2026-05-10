import React from 'react';
import { motion } from 'motion/react';
import { Info, Target, Users, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutUsPage: React.FC = () => {
  const { t, language } = useLanguage();

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
              <Info className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'ar' ? 'من نحن' : 'About Us'}
            </h1>
          </div>

          <div className="space-y-12 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" /> 
                {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
              </h2>
              <p>
                {language === 'ar' 
                  ? 'نحن نسعى لتوفير أفضل تجربة تسوق للاعبين، من خلال تقديم منتجات رقمية موثوقة وبأسعار تنافسية. هدفنا هو أن نكون الوجهة الأولى لكل لاعب يبحث عن الجودة والسرعة.' 
                  : 'We strive to provide the best shopping experience for gamers by offering reliable digital products at competitive prices. Our goal is to be the primary destination for every gamer looking for quality and speed.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                {language === 'ar' ? 'فريقنا' : 'Our Team'}
              </h2>
              <p>
                {language === 'ar'
                  ? 'يتكون فريقنا من مجموعة من المتحمسين للألعاب والمحترفين في التجارة الإلكترونية، الذين يعملون بجد لضمان رضاكم وتوفير الدعم اللازم لكم في كل خطوة.'
                  : 'Our team consists of a group of gaming enthusiasts and e-commerce professionals who work hard to ensure your satisfaction and provide the necessary support at every step.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                {language === 'ar' ? 'لماذا نحن؟' : 'Why Choose Us?'}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>{language === 'ar' ? 'توصيل فوري وتلقائي' : 'Instant and automatic delivery'}</span>
                </li>
                <li className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>{language === 'ar' ? 'أسعار تنافسية وحصرية' : 'Competitive and exclusive prices'}</span>
                </li>
                <li className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>{language === 'ar' ? 'دعم فني متواصل' : 'Continuous technical support'}</span>
                </li>
                <li className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>{language === 'ar' ? 'طرق دفع آمنة ومتنوعة' : 'Secure and varied payment methods'}</span>
                </li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
