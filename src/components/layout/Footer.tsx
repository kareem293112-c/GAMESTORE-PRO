        {/* Column 4: Contact & Social */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">{t('footer.follow')}</h4>
          <div className="flex gap-3 mb-8">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
              <button key={idx} className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all">
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>karmo2931@gmail.com</span>
            </div>
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <MessageCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <div>
                 <p className="font-bold text-slate-200" dir="ltr">+90 536 016 76 64</p>
                 <p className="text-xs">{language === 'ar' ? 'متجر: Gamestore Pro' : 'Store: Gamestore Pro'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-slate-500 text-sm text-center md:text-start px-2">
          © {new Date().getFullYear()} Gamestore Pro. All rights reserved.
        </p>
        
        {/* روابط صور رسمية ومباشرة متناسقة ومجربة لشاشات الـ Dark Mode */}
        <div className="flex items-center gap-6 justify-center flex-wrap">
          {/* 3D Secure */}
          <div className="border border-slate-700/60 rounded-xl px-3 py-1.5 text-[10px] text-slate-400 font-black flex items-center gap-1.5 bg-slate-950/40 tracking-wider">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            3D SECURE
          </div>

          {/* TROY - رابط شعار رسمي أبيض شفاف عالي الجودة */}
          <img 
            src="https://githubusercontent.com" 
            alt="Troy" 
            className="h-5 w-auto" 
            referrerPolicy="no-referrer" 
          />

          {/* MasterCard - رابط الشعار الأصلي الملون الشفاف من خوادم ويكيميديا المستقرة */}
          <img 
            src="https://wikimedia.org" 
            alt="Mastercard" 
            className="h-6 w-auto" 
            referrerPolicy="no-referrer" 
          />

          {/* VISA - رابط الشعار الاحترافي الأبيض الشفاف الخاص بالخلفيات الداكنة */}
          <img 
            src="https://githubusercontent.com" 
            alt="Visa" 
            className="h-5 w-auto" 
            referrerPolicy="no-referrer" 
          />
        </div>
      </div>
    </footer>
  );
