import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Truck,
  ShieldCheck,
  RotateCcw,
  Percent,
  Mail,
  LogIn,
  PackagePlus,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from './HeroBanner';
import { CategoryList } from './CategoryList';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

interface StorefrontProps {
  onOpenProductModal: (product: Product) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onOpenProductModal }) => {
  const {
    products,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    currentUser,
    setIsAuthOpen,
    setIsAdminAuthOpen,
  } = useStore();

  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc' | 'sales'>('featured');

  // Filter products based on search, category, and offers
  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;

    // Search query filter
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    // Category filter
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;

    // Only offers filter
    const matchesOffers = !onlyOffers || (p.discountPrice && p.discountPrice < p.sellingPrice);

    return matchesSearch && matchesCategory && matchesOffers;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice ?? a.sellingPrice;
    const priceB = b.discountPrice ?? b.sellingPrice;

    if (sortBy === 'priceAsc') return priceA - priceB;
    if (sortBy === 'priceDesc') return priceB - priceA;
    if (sortBy === 'sales') return (b.salesCount || 0) - (a.salesCount || 0);
    return 0; // featured default
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Customer Registration & Email Code Prompt Banner */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-4 sm:p-5 rounded-3xl shadow-sm border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black">
                  تسجيل العملاء
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  سجل الآن بالبريد الإلكتروني أو كود التحقق السريع
                </h3>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                أنشئ حسابك لمتابعة وتتبع طلباتك لحظة بلحظة واستمتع بالتوصيل الفوري إلى باب بيتك.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول / كود البريد</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Promotional Banner */}
      {!searchQuery && <HeroBanner />}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900">توصيل سريع لباب بيتك</h4>
            <p className="text-[10px] text-neutral-500">خلال 30 إلى 60 دقيقة فقط</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900">عروض وخصومات يومية</h4>
            <p className="text-[10px] text-neutral-500">وفر في ميزانية بيتك الأسبوعية</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900">جودة وطزاجة 100%</h4>
            <p className="text-[10px] text-neutral-500">خضار، فاكهة، ولحوم معتمدة</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900">استرجاع وتبديل سهل</h4>
            <p className="text-[10px] text-neutral-500">فحص فوري عند الاستلام والدفع</p>
          </div>
        </div>
      </div>

      {/* Hypermarket Department Selector */}
      <CategoryList />

      {/* Product Section Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-200/80">
        <div>
          <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <span>المنتجات المتاحة للتسوق</span>
            <span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full">
              {sortedProducts.length} صنف
            </span>
          </h3>
          {searchQuery && (
            <p className="text-xs text-neutral-500 mt-1">
              نتائج البحث عن: <span className="font-bold text-emerald-800">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offers Toggle */}
          <button
            onClick={() => setOnlyOffers(!onlyOffers)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              onlyOffers
                ? 'bg-amber-400 text-emerald-950 border-amber-400 font-black shadow-xs'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyOffers ? 'text-rose-600' : 'text-amber-500'}`} />
            <span>عروض وتخفيضات الفارس فقط</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="featured">المميز لدينا</option>
              <option value="sales">الأكثر مبيعاً</option>
              <option value="priceAsc">السعر: من الأقل للأعلى</option>
              <option value="priceDesc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-10 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <PackagePlus className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-black text-neutral-900 mb-1">المتجر جديد وبداية انطلاق حقيقية!</h4>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6">
            لا توجد منتجات مسجلة حالياً. يمكن للأدمن تسجيل الدخول برقم الهاتف وكلمة المرور الخاصة به لإضافة المنتجات فوراً وتحديد أسعارها الحقيقية.
          </p>
          <button
            onClick={() => setIsAdminAuthOpen(true)}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition-colors shadow-md inline-flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>تسجيل دخول الأدمن لإضافة المنتجات</span>
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Search className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-neutral-900 mb-1">لم نتمكن من العثور على أي منتج</h4>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6">
            جرب البحث بكلمات أخرى أو قم بإلغاء الفلتر المحدد لتصفح جميع أقسام الهايبر ماركت.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setOnlyOffers(false);
            }}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            عرض كافة المنتجات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProductModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
