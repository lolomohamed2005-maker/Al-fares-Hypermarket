import React from 'react';
import { Tag, Sparkles, ArrowLeft, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, categories } = useStore();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-xl my-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 max-w-5xl">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 backdrop-blur-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>مهرجان توفير الفارس الأسبوعي - خصومات حصرية تصل إلى 40%</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
          كل احتياجات بيتك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-400">
            طازجة وأوفر بكثير!
          </span>
        </h2>

        <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed mb-8">
          تسوق تشكيلة واسعة من المواد الغذائية، الألبان، الخضار والفاكهة الطازجة، والمنظفات بأفضل الأسعار المعتمدة مع خدمة التوصيل السريع لباب البيت.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const foodCat = categories.find((c) => c.name.includes('غذائية'));
              if (foodCat) setSelectedCategory(foodCat.id);
              window.scrollTo({ top: 550, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm px-6 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>تسوق العروض والتخفيضات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const freshCat = categories.find((c) => c.name.includes('خضار'));
              if (freshCat) setSelectedCategory(freshCat.id);
              window.scrollTo({ top: 550, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl backdrop-blur-xs transition-colors"
          >
            <Tag className="w-4 h-4 text-emerald-300" />
            <span>قسم الطازج والخضار</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-emerald-700/50">
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>توصيل فوري خلال 45 دقيقة</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>خدمة يومية حتى 2 صباحاً</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ضمان الجودة والاستبدال الفوري</span>
          </div>
        </div>
      </div>
    </div>
  );
};
