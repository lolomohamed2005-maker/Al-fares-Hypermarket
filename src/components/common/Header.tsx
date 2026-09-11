import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  Truck,
  LayoutDashboard,
  Store,
  PhoneCall,
  Clock,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  Share2,
  Check,
  Lock,
  MapPin,
  Code,
  FolderArchive,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ShareLinksModal } from './ShareLinksModal';
import { AllCodeModal } from './AllCodeModal';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    cartTotal,
    setIsCartOpen,
    currentUser,
    setIsAuthOpen,
    setIsAdminAuthOpen,
    logout,
    setIsOrderTrackingOpen,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    branches,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShareLinksOpen, setIsShareLinksOpen] = useState(false);
  const [isAllCodeOpen, setIsAllCodeOpen] = useState(false);

  const handleDownloadZip = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/al-fares-hypermarket.zip');
      if (!res.ok) throw new Error('Failed to fetch');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'al-fares-hypermarket.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open('/al-fares-hypermarket.zip', '_blank');
    }
  };

  const handleAdminButtonClick = () => {
    if (currentView === 'store') {
      // Check if user is already logged in as admin/owner/manager
      if (currentUser?.role === 'owner' || currentUser?.role === 'manager') {
        setCurrentView('admin');
      } else {
        // Open the Admin Phone & Password Login Modal
        setIsAdminAuthOpen(true);
      }
    } else {
      setCurrentView('store');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      {/* Top Notification & Branch Contact Bar */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-1.5 px-3 sm:px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {branches.find((b) => b.isMain)?.name || 'الفرع الرئيسي'}: {branches.find((b) => b.isMain)?.address || 'كفرالشيخ أمام بورصة الأسماك'}
            </span>
            <span className="hidden md:inline-block text-emerald-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-emerald-200 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              خدمة التوصيل السريع يومياً من 8 ص حتى 2 صباحاً
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold">
            <span className="text-emerald-200 hidden xs:inline">هاتف الطلبات:</span>
            <a
              href="tel:01010574689"
              className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white transition-colors bg-emerald-800/80 px-2 py-0.5 rounded-md"
              dir="ltr"
              title="اتصل بالرقم الأول"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              01010574689
            </a>
            <span className="text-emerald-500 font-normal">|</span>
            <a
              href="tel:01055753006"
              className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white transition-colors bg-emerald-800/80 px-2 py-0.5 rounded-md"
              dir="ltr"
              title="اتصل بالرقم الثاني"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              01055753006
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Name */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => {
              setCurrentView('store');
              setSelectedCategory(null);
              setSearchQuery('');
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <div className="relative flex items-center justify-center">
                <Store className="w-7 h-7 text-amber-300" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-amber-400 text-emerald-950 px-1 rounded-sm">
                  F
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 leading-none">
                  الفارس
                </h1>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  هايبر ماركت
                </span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-500 tracking-wider">
                AL FARES HYPER MARKET
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج، قسم، أو امسح باركود (مثال: أرز، حليب، شيبسي)..."
                className="w-full pl-10 pr-12 py-2.5 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-neutral-300 focus:border-emerald-600 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-400"
              />
              <Search className="w-5 h-5 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 px-1.5 py-0.5 rounded-full hover:bg-neutral-200"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Download Full Project ZIP Button */}
            <a
              id="btn-download-zip-header"
              href="/al-fares-hypermarket.zip"
              download="al-fares-hypermarket.zip"
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 text-xs font-black px-2.5 sm:px-3 py-2 rounded-xl transition-all shadow-xs border bg-amber-400 hover:bg-amber-300 text-neutral-950 border-amber-500/50"
              title="تحميل فولدر المشروع بالكامل في ملف مضغوط (.zip)"
            >
              <FolderArchive className="w-3.5 h-3.5 text-neutral-950" />
              <span className="hidden sm:inline">تحميل فولدر المشروع (.zip)</span>
              <span className="sm:hidden">الفولدر (zip)</span>
            </a>

            {/* Copy All Project Code Button */}
            <button
              id="btn-all-codes"
              onClick={() => setIsAllCodeOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-2.5 sm:px-3 py-2 rounded-xl transition-all shadow-xs border bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600"
              title="نسخ وتحميل جميع أكواد المشروع مجمعة معاً"
            >
              <Code className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">كل الأكواد</span>
              <span className="sm:hidden">الأكواد</span>
            </button>

            {/* Share Store & Admin Links Button */}
            <button
              id="btn-share-store-link"
              onClick={() => setIsShareLinksOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-2.5 sm:px-3 py-2 rounded-xl transition-all shadow-xs border bg-amber-400 hover:bg-amber-300 text-neutral-950 border-amber-500/40"
              title="عرض ونسخ روابط المتجر ولوحة الإدارة"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-950" />
              <span className="hidden sm:inline">روابط الموقع</span>
              <span className="sm:hidden">الروابط</span>
            </button>

            {/* View Switcher: Store vs Admin */}
            {currentView === 'store' ? (
              <button
                id="btn-switch-to-admin"
                onClick={handleAdminButtonClick}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-md"
                title="تسجيل دخول الإدارة برقم الهاتف والباسورد"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">لوحة الإدارة</span>
                <span className="sm:hidden">الإدارة</span>
              </button>
            ) : (
              <button
                id="btn-switch-to-store"
                onClick={handleAdminButtonClick}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs"
                title="الرجوع لمتجر العملاء"
              >
                <Store className="w-4 h-4 text-amber-300" />
                <span>متجر العملاء</span>
              </button>
            )}

            {/* Track Orders Button */}
            <button
              id="btn-track-orders"
              onClick={() => setIsOrderTrackingOpen(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 sm:px-3 py-2 rounded-xl border border-neutral-200 transition-colors"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">متابعة طلباتي</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-emerald-950 font-black text-[11px] rounded-full flex items-center justify-center shadow-xs animate-scale">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">السلة</span>
              {cartTotal > 0 && (
                <span className="hidden md:inline font-black text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded-md text-xs">
                  {cartTotal} ج.م
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    id="btn-user-menu"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="text-right hidden xl:block">
                      <div className="text-xs font-bold text-neutral-800 leading-tight">
                        {currentUser.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium">
                        {currentUser.role === 'owner'
                          ? 'المالك'
                          : currentUser.role === 'manager'
                          ? 'مدير'
                          : currentUser.role === 'cashier'
                          ? 'كاشير'
                          : currentUser.role === 'employee'
                          ? 'موظف'
                          : 'عميل'}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs text-neutral-500">تم تسجيل الدخول كـ</p>
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {currentUser.name}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                          {currentUser.role === 'owner'
                            ? 'مالك الهايبر'
                            : currentUser.role === 'manager'
                            ? 'مدير النظام'
                            : currentUser.role === 'cashier'
                            ? 'كاشير'
                            : currentUser.role === 'employee'
                            ? 'موظف'
                            : 'حساب عميل'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsOrderTrackingOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 text-right"
                      >
                        <Truck className="w-4 h-4 text-neutral-400" />
                        طلباتي ومشترياتي
                      </button>

                      {['owner', 'manager', 'cashier', 'employee'].includes(currentUser.role) && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setCurrentView('admin');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 text-right font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          الدخول للوحة التحكم
                        </button>
                      )}

                      <div className="border-t border-neutral-100 my-1"></div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-right"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-open-auth"
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-800 hover:text-emerald-700 bg-neutral-100 hover:bg-neutral-200/80 px-3 py-2 rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتجات، خضار، جبن، منظفات..."
              className="w-full pl-9 pr-10 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-700"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Links Modal (Store URL + Admin URL) */}
      <ShareLinksModal
        isOpen={isShareLinksOpen}
        onClose={() => setIsShareLinksOpen(false)}
      />

      {/* All Project Code Modal */}
      <AllCodeModal
        isOpen={isAllCodeOpen}
        onClose={() => setIsAllCodeOpen(false)}
      />
    </header>
  );
};
