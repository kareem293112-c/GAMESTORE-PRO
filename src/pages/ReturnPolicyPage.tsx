import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-rose-600/20 p-3 rounded-2xl">
              <RefreshCcw className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase">
              İptal ve İade Koşulları
            </h1>
          </div>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <p>
              Gamestore Pro web sitesi üzerinden satışı yapılan tüm ürün ve hizmetler (Oyun içi para, E-pin, Dijital Hediye Kartları, Oyun Kodları, Hesaplar vb.) "Dijital İçerik ve Anında İfa Edilen Hizmetler" kapsamında yer almaktadır.
            </p>

            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                1. CAYMA HAKKI İSTİSNASI
              </h2>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin "Cayma Hakkının İstisnaları" başlıklı 15. Maddesi (ğ) bendi uyarınca; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde" tüketicinin cayma hakkı bulunmamaktadır. Dolayısıyla, sipariş onaylanıp ödeme yapıldıktan sonra işlemin iptal edilmesi mümkün değildir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                2. İADE VE DEĞİŞİM ŞARTLARI
              </h2>
              <ul className="list-disc list-inside space-y-4">
                <li>
                  Satın alınan dijital kodlar/ürünler, doğası gereği tek kullanımlık, kopyalanabilir ve anında tüketilebilir nitelikte olduğundan, ALICI'ya teslim edildikten sonra <strong>kesinlikle iptal edilemez, iade alınamaz ve ücret iadesi yapılamaz</strong>.
                </li>
                <li>
                  Yalnızca sistemden veya tedarikçiden kaynaklı hatalı, eksik veya çalışmayan bir kod teslim edilmesi durumunda; teknik ekibimizin yapacağı inceleme ve doğrulama sonucunda ürün yenisi ile değiştirilir veya bakiye/ücret iadesi sağlanır.
                </li>
                <li>
                  Kullanıcı hatasından (yanlış ID girilmesi, yanlış bölge/bölgesel kilit uyumsuzluğu vb.) kaynaklı sorunlarda iade yapılmaz.
                </li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
