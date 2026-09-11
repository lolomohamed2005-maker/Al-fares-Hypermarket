import React from 'react';
import { Store, Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategory, categories } = useStore();

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-14 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-800/40 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">توصيل سريع ومضمون</h4>
              <p className="text-xs text-neutral-400 mt-1">توصيل خلال أقل من 45 دقيقة طازج حتى باب منزلك</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-800/40 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">أعلى معايير الجودة</h4>
              <p className="text-xs text-neutral-400 mt-1">منتجات طازجة ومفحوصة يومياً بعناية فائقة</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-800/40 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">سياسة استرجاع مرنة</h4>
              <p className="text-xs text-neutral-400 mt-1">إمكانية فحص الطلب عند الاستلام والاستبدال الفوري</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-800/40 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">خدمة عملاء 24/7</h4>
              <p className="text-xs text-neutral-400 mt-1">فريق جاهز لمساعدتكم والرد على استفساراتكم طوال اليوم</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Store className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-xl font-black text-white">الفارس هايبر ماركت</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              وجهتكم الأولى للتسوق المنزلي والمواد الغذائية الطازجة بأفضل الأسعار وأقوى العروض الحصرية. نسعى دائماً لتقديم تجربة تسوق راقية وسريعة.
            </p>
            <div className="text-xs text-neutral-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-neutral-300 font-medium">الفرع الرئيسي: كفرالشيخ أمام بورصه الأسماك</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex items-center gap-2" dir="ltr">
                  <a href="tel:01010574689" className="text-amber-400 hover:text-amber-300 font-bold">
                    01010574689
                  </a>
                  <span className="text-neutral-500">|</span>
                  <a href="tel:01055753006" className="text-amber-400 hover:text-amber-300 font-bold">
                    01055753006
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@alfares-hypermarket.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">أشهر الأقسام</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setCurrentView('store');
                      setSelectedCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">خدمة العملاء والمساعدة</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><span className="hover:text-emerald-400 cursor-pointer">كيفية الطلب والتوصيل</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">طرق الدفع والتقسيط</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">مناطق التغطية والتوصيل</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">سياسة الخصوصية والشروط</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">شكاوى واقتراحات العملاء</span></li>
            </ul>
          </div>

          {/* Admin & Staff Portal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">بوابة إدارة الهايبر ماركت</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              لوحة التحكم الداخلية المخصصة لصاحب الهايبر ماركت والمديرين وأمناء المخازن والكاشير لمتابعة المبيعات والمخزون والمصروفات.
            </p>
            <button
              onClick={() => setCurrentView('admin')}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>دخول لوحة تحكم الإدارة</span>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
          <p>© 2026 الفارس هايبر ماركت (Al Fares Hyper Market). جميع الحقوق محفوظة.</p>
          <p>نظام تشغيل متكامل لإدارة الهايبر ماركت والتسوق الإلكتروني</p>
        </div>
      </div>
    </footer>
  );
};
