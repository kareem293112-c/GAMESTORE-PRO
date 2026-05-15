import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gizlilik Politikası / Privacy Policy</h1>
            <p className="text-slate-500 text-sm mt-0.5">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          {/* Identity */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">1. Veri Sorumlusu / Satıcı Bilgileri</h2>
            <ul className="space-y-1 text-slate-400">
              <li><span className="text-slate-300 font-medium">Ad Soyad:</span> ABDULKERIM ĞAREZ</li>
              <li><span className="text-slate-300 font-medium">Vergi Numarası:</span> 4541721451</li>
              <li><span className="text-slate-300 font-medium">E-posta:</span> karmo2931@gmail.com</li>
              <li><span className="text-slate-300 font-medium">Telefon / WhatsApp:</span> +90 536 016 76 64</li>
              <li><span className="text-slate-300 font-medium">Platform:</span> Gamestore Pro</li>
              <li><span className="text-slate-300 font-medium">Web Sitesi:</span> gamestore-pro-u1v1.onrender.com</li>
            </ul>
          </section>

          {/* Data Collected */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">2. Toplanan Kişisel Veriler</h2>
            <p className="text-slate-400 mb-3">Sitemizi kullandığınızda aşağıdaki veriler toplanabilir:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Ad, soyad ve e-posta adresi</li>
              <li>Telefon numarası (iletişim amacıyla)</li>
              <li>Ödeme bilgileri (yalnızca ödeme altyapısı tarafından işlenir, bizimle paylaşılmaz)</li>
              <li>IP adresi ve tarayıcı bilgileri (güvenlik amacıyla)</li>
              <li>Sipariş geçmişi ve ürün tercihleri</li>
            </ul>
          </section>

          {/* Purpose */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">3. Verilerin Kullanım Amacı</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Siparişlerin işlenmesi ve dijital ürünlerin teslim edilmesi</li>
              <li>Müşteri desteği sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Dolandırıcılığın önlenmesi ve güvenliğin sağlanması</li>
              <li>Hizmet kalitesinin iyileştirilmesi</li>
            </ul>
          </section>

          {/* Third Parties */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">4. Üçüncü Taraflarla Paylaşım</h2>
            <p className="text-slate-400">
              Kişisel verileriniz; ödeme işlemcileri, yasal zorunluluklar veya açık rızanız olmadan
              üçüncü taraflarla paylaşılmaz. Ödeme altyapısı PCI-DSS uyumlu güvenli sistemler
              üzerinden çalışmaktadır.
            </p>
          </section>

          {/* Digital Products */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 border-l-2 border-l-amber-500">
            <h2 className="text-white font-bold text-base mb-3">5. Dijital Ürünler Hakkında Önemli Bilgi</h2>
            <p className="text-slate-400">
              Satılan tüm ürünler dijital niteliktedir (oyun kodu, gift card, dijital pin vb.).
              Ürün teslimattan sonra iade veya iptal mümkün{' '}
              <span className="text-amber-400 font-semibold">değildir</span>.
              Lütfen satın almadan önce ürün detaylarını dikkatlice okuyunuz.
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">6. Çerezler (Cookies)</h2>
            <p className="text-slate-400">
              Sitemiz oturum yönetimi ve kullanıcı deneyimini iyileştirmek amacıyla çerezler
              kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz,
              ancak bu bazı işlevleri etkileyebilir.
            </p>
          </section>

          {/* Rights */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">7. KVKK Kapsamında Haklarınız</h2>
            <p className="text-slate-400 mb-3">6698 sayılı KVKK uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Verilerinizin düzeltilmesini veya silinmesini talep etme</li>
              <li>Verilerinizin aktarıldığı kişileri öğrenme</li>
              <li>İşlemeye itiraz etme hakkı</li>
            </ul>
            <p className="text-slate-400 mt-3">
              Talepleriniz için: <span className="text-indigo-400">karmo2931@gmail.com</span>
            </p>
          </section>

          {/* Contact */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">8. İletişim</h2>
            <p className="text-slate-400">
              Bu politikayla ilgili sorularınız için bize ulaşın:<br />
              📧 karmo2931@gmail.com<br />
              📱 +90 536 016 76 64 (WhatsApp)
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
