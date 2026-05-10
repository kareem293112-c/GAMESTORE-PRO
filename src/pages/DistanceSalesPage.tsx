import React from 'react';
import { motion } from 'motion/react';
import { FileText, Gavel, Scale, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DistanceSalesPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4">
      <div className="max-max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600/20 p-3 rounded-2xl">
              <Scale className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {language === 'ar' ? 'اتفاقية البيع عن بعد' : 'Distance Sales Agreement'}
            </h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono">
                <FileText className="w-4 h-4 text-indigo-400" /> MADDE 1: TARAFLAR
              </h2>
              <p>İşbu Sözleşme, GAMESTORE-PRO (Bundan sonra "ALICI" olarak anılacaktır) ile bu siteyi kullanan kullanıcı (Bundan sonra "SATICI" olarak anılacaktır) arasında aşağıda belirtilen şartlar dahilinde düzenlenmiştir.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> MADDE 2: KONU
              </h2>
              <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini yaptığı, sözleşmede belirtilen niteliklere sahip ve satış fiyatı belirtilen ürün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono">
                <Gavel className="w-4 h-4 text-indigo-400" /> MADDE 3: CAYMA HAKKI
              </h2>
              <p>Dijital içerikler, anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler kapsamında, ürünün niteliği gereği cayma hakkı kullanılamaz. Sipariş onaylandığında ve dijital kod ALICI'ya iletildiğinde hizmet tamamlanmış sayılır.</p>
            </section>

            <section className="border-t border-slate-800 pt-8 mt-8">
              <p className="italic text-slate-400">
                {language === 'ar' 
                  ? 'هذه الاتفاقية تخضع للقوانين المعمول بها في التجارة الإلكترونية التركية Mesafeli Satış Sözleşmesi.' 
                  : 'This agreement is subject to the laws applicable to Turkish e-commerce (Distance Sales Agreement).'}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
