import React from 'react';
import { FileText } from 'lucide-react';

const DistanceSalesPage: React.FC = () => {
  const today = new Date().toLocaleDateString('tr-TR');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mesafeli Satış Sözleşmesi</h1>
            <p className="text-slate-500 text-sm mt-0.5">6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında hazırlanmıştır.</p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">

          {/* Parties */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-4">MADDE 1 – TARAFLAR</h2>
            <div className="space-y-4">
              <div>
                <p className="text-indigo-400 font-semibold mb-1">SATICI:</p>
                <ul className="space-y-1 text-slate-400">
                  <li><span className="text-slate-300">Unvan:</span> ABDULKERIM ĞAREZ</li>
                  <li><span className="text-slate-300">Vergi No:</span> 4541721451</li>
                  <li><span className="text-slate-300">E-posta:</span> karmo2931@gmail.com</li>
                  <li><span className="text-slate-300">Telefon:</span> +90 536 016 76 64</li>
                  <li><span className="text-slate-300">Platform:</span> Gamestore Pro — gamestore-pro-u1v1.onrender.com</li>
                </ul>
              </div>
              <div>
                <p className="text-emerald-400 font-semibold mb-1">ALICI:</p>
                <p className="text-slate-400">Siteye üye olan veya sipariş veren gerçek/tüzel kişi (bundan böyle "Alıcı" olarak anılacaktır).</p>
              </div>
            </div>
          </section>

          {/* Subject */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 2 – SÖZLEŞMENİN KONUSU</h2>
            <p className="text-slate-400">
              Bu sözleşme, Alıcı'nın Gamestore Pro web sitesi üzerinden elektronik ortamda sipariş verdiği
              dijital ürünlerin (oyun kodu, gift card, oyun içi para birimi, dijital pin vb.) satışı ve
              teslimatına ilişkin karşılıklı hak ve yükümlülükleri düzenlemektedir.
            </p>
          </section>

          {/* Products */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 3 – ÜRÜN BİLGİLERİ VE FİYATLAR</h2>
            <p className="text-slate-400">
              Satışa sunulan ürünlerin özellikleri, fiyatları ve açıklamaları site üzerinde ilgili ürün
              sayfasında yer almaktadır. Tüm fiyatlara KDV dahildir. Satıcı, fiyatları önceden
              bildirmeksizin güncelleme hakkını saklı tutar; ancak sipariş anındaki fiyat geçerlidir.
            </p>
          </section>

          {/* Payment */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 4 – ÖDEME</h2>
            <p className="text-slate-400">
              Ödemeler güvenli ödeme altyapısı üzerinden kredi kartı, banka kartı veya diğer desteklenen
              yöntemlerle gerçekleştirilir. Ödeme bilgileri Satıcı tarafından saklanmaz;
              PCI-DSS uyumlu ödeme işlemcisi tarafından işlenir.
            </p>
          </section>

          {/* Delivery */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 5 – TESLİMAT</h2>
            <p className="text-slate-400">
              Dijital ürünler, ödemenin onaylanmasının ardından{' '}
              <span className="text-white font-semibold">anında ve otomatik olarak</span> Alıcı'nın
              kayıtlı e-posta adresine veya hesap paneline iletilir. Teslimat süresi en fazla 24 saattir;
              teknik aksaklık halinde Alıcı bilgilendirilir.
            </p>
          </section>

          {/* Cancellation */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 border-l-2 border-l-red-500">
            <h2 className="text-white font-bold text-base mb-3">MADDE 6 – İPTAL VE İADE HAKKI</h2>
            <div className="bg-red-950/30 rounded-xl p-4 border border-red-900/50 mb-3">
              <p className="text-red-300 font-semibold text-xs uppercase tracking-wider mb-2">⚠️ Önemli Uyarı</p>
              <p className="text-slate-300">
                Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, elektronik ortamda anında
                teslim edilen dijital içerikler (oyun kodu, aktivasyon anahtarı, gift card vb.) teslim
                edildikten sonra{' '}
                <span className="text-red-400 font-bold">iade ve iptal kapsamı dışındadır.</span>
              </p>
            </div>
            <p className="text-slate-400">
              Ürün teslim edilmeden önce sipariş iptali talep edilebilir. Teslim edilen ve/veya
              görüntülenen dijital ürünler için cayma hakkı kullanılamaz.
            </p>
          </section>

          {/* Seller responsibilities */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 7 – SATICI'NIN YÜKÜMLÜLÜKLERİ</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Ürünlerin doğru ve eksiksiz teslim edilmesi</li>
              <li>Ödeme güvenliğinin sağlanması</li>
              <li>Müşteri şikayetlerinin makul sürede yanıtlanması</li>
              <li>Kişisel verilerin KVKK kapsamında korunması</li>
            </ul>
          </section>

          {/* Buyer responsibilities */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 8 – ALICI'NIN YÜKÜMLÜLÜKLERİ</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Doğru ve güncel kişisel bilgi sağlamak</li>
              <li>Ürün açıklamalarını satın almadan önce okumak</li>
              <li>Ödeme işlemlerini yetkili kartla gerçekleştirmek</li>
              <li>Dijital ürünleri başkasıyla paylaşmamak (lisans ihlali)</li>
            </ul>
          </section>

          {/* Disputes */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">MADDE 9 – UYUŞMAZLIK ÇÖZÜMÜ</h2>
            <p className="text-slate-400">
              Bu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri ve Tüketici Hakem
              Heyetleri yetkilidir. Tüketici şikayetleri için{' '}
              <a
                href="https://www.tuketicisikayetleri.gov.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                tüketici şikayetleri portalı
              </a>{' '}
              kullanılabilir.
            </p>
          </section>

          {/* Date */}
          <div className="text-center text-slate-600 text-xs pt-4">
            Bu sözleşme {today} tarihinde yürürlüğe girmiştir. © Gamestore Pro — ABDULKERIM ĞAREZ
          </div>

        </div>
      </div>
    </div>
  );
};

export default DistanceSalesPage;
