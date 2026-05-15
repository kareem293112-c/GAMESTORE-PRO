import React from 'react';
import { RefreshCw } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">İptal ve İade Koşulları</h1>
            <p className="text-slate-500 text-sm mt-0.5">Cancellation &amp; Return Policy</p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">

          {/* Important Notice */}
          <section className="bg-amber-950/30 rounded-2xl p-6 border border-amber-800/50">
            <h2 className="text-amber-300 font-bold text-base mb-3">⚠️ Dijital Ürünler Hakkında</h2>
            <p className="text-slate-300">
              Gamestore Pro'da satılan tüm ürünler{' '}
              <strong className="text-white">dijital niteliktedir</strong>{' '}
              (oyun kodu, gift card, aktivasyon anahtarı, oyun içi para birimi vb.).
              Mesafeli Sözleşmeler Yönetmeliği Madde 15/ğ uyarınca, elektronik ortamda anında teslim
              edilen dijital içerikler tüketicinin onayıyla teslim edildiğinden{' '}
              <strong className="text-amber-400">cayma hakkı kapsamı dışındadır.</strong>
            </p>
          </section>

          {/* When cancellation IS possible */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">✅ İptal Mümkün Olan Durumlar</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Ürün henüz teslim edilmemişse (kod/pin gönderilmeden önce)</li>
              <li>Sipariş teknik hata nedeniyle çift işlendiyse</li>
              <li>Yanlış ürün teslim edildiyse (farklı bölge kodu, yanlış platform vb.)</li>
              <li>Ürün hiç çalışmıyorsa ve 24 saat içinde bildirilmişse</li>
            </ul>
          </section>

          {/* When cancellation is NOT possible */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 border-l-2 border-l-red-500">
            <h2 className="text-white font-bold text-base mb-3">❌ İptal / İade Mümkün Olmayan Durumlar</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Ürün kodu görüntülendi veya kopyalandı</li>
              <li>Aktivasyon gerçekleştirildi</li>
              <li>Gift card bakiyesi kullanıldı</li>
              <li>Oyun içi para birimi hesaba yüklendi</li>
              <li>"Beğenmedim" veya "başkasına aldım" gibi kişisel nedenler</li>
              <li>Bölge uyumsuzluğu (ürün açıklamasında belirtilmişse)</li>
            </ul>
          </section>

          {/* How to request */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">📩 İade / İptal Talebi Nasıl Yapılır?</h2>
            <p className="text-slate-400 mb-3">İptal veya iade talebiniz için:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-400">
              <li>
                Sipariş numaranızla{' '}
                <span className="text-indigo-400">karmo2931@gmail.com</span> adresine e-posta gönderin
              </li>
              <li>
                Veya{' '}
                <span className="text-indigo-400">+90 536 016 76 64</span> numaralı WhatsApp hattımızdan
                ulaşın
              </li>
              <li>
                Talebiniz <strong className="text-white">24-48 saat</strong> içinde değerlendirilecektir
              </li>
            </ol>
          </section>

          {/* Refund process */}
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-white font-bold text-base mb-3">💳 Onaylanan İadelerde Geri Ödeme</h2>
            <p className="text-slate-400">
              İade talebiniz onaylanması halinde, ödeme iade süreci kullanılan ödeme yöntemine göre{' '}
              <strong className="text-white">3-10 iş günü</strong> içinde tamamlanır.
              Banka işlem süreleri Gamestore Pro'nun kontrolü dışındadır.
            </p>
          </section>

          {/* Footer note */}
          <div className="text-center text-slate-600 text-xs pt-4">
            © {new Date().getFullYear()} Gamestore Pro — ABDULKERIM ĞAREZ — Vergi No: 4541721451
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
