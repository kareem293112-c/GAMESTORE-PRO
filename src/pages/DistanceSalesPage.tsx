import React from 'react';
import { motion } from 'motion/react';
import { FileText, Gavel, Scale, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DistanceSalesPage: React.FC = () => {
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
              <Scale className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              MESAFELİ SATIŞ SÖZLEŞMESİ
            </h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 1. TARAFLAR
              </h2>
              <p>Bu Sözleşme, Gamestore Pro (Bu sözleşmede "SATICI" olarak anılacaktır) ile Gamestore Pro web sitesi üzerinden sipariş veren ve ürün/hizmet satın alan kullanıcı (Bu sözleşmede "ALICI" olarak anılacaktır) arasında elektronik ortamda akdedilmiştir.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 2. SÖZLEŞMENİN KONUSU
              </h2>
              <p>İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait Gamestore Pro web sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış ücreti belirtilen dijital ürün/hizmetin (Oyun içi para, dijital kartlar, epin, oyun kodları vb.) satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 3. ÜRÜN TESLİMATI VE KULLANIMI
              </h2>
              <p>Sözleşme konusu ürünler, dijital içerik ve anlık ifa edilen hizmet niteliğinde olduğundan, fiziki kargo gönderimi yapılmaz. Ürünler, ALICI'nın ödemeyi başarıyla tamamlamasının ardından web sitesi üzerindeki "Siparişlerim" sayfasında veya ALICI tarafından belirtilen iletişim kanalları üzerinden dijital ortamda anlık veya kontrol sonrası teslim edilir.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 4. GENEL HÜKÜMLER
              </h2>
              <div className="space-y-4">
                <p>4.1. ALICI, web sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
                <p>4.2. Dijital ürünlerin kullanımı için gerekli olan internet bağlantısı, oyun hesapları ve cihaz gereksinimleri tamamen ALICI'nın sorumluluğundadır.</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
