import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Receipt,
  WalletCards,
  Users,
  BarChart3,
  Store,
  Menu,
  X,
  ScanBarcode,
  Truck,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  FolderTree,
  DollarSign,
  AlertCircle,
  Calculator,
  Plus,
  Share2,
  Code,
  Building2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Role } from '../../types';
import { ShareLinksModal } from '../common/ShareLinksModal';
import { AllCodeModal } from '../common/AllCodeModal';

interface AdminLayoutProps {
  children: React.ReactNode;
  onOpenBarcodeScanner: () => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
  badge?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onOpenBarcodeScanner }) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentView,
    currentUser,
    switchUserRole,
    logout,
    orders,
    lowStockProducts,
    totalOutstandingLoans,
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareLinksOpen, setIsShareLinksOpen] = useState(false);
  const [isAllCodeOpen, setIsAllCodeOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'received' || o.status === 'preparing').length;

  const currentRole: Role = currentUser?.role || 'owner';

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'الرئيسية (لوحة التحكم)',
      icon: LayoutDashboard,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'pos',
      title: 'نقطة البيع (الكاشير POS)',
      icon: Calculator,
      allowedRoles: ['owner', 'manager', 'cashier'],
    },
    {
      id: 'products',
      title: 'إدارة المنتجات',
      icon: Package,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'inventory',
      title: 'المخزون وحركات الجرد',
      icon: Boxes,
      allowedRoles: ['owner', 'manager', 'employee'],
      badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
    },
    {
      id: 'orders',
      title: 'إدارة الطلبات والمبيعات',
      icon: ShoppingBag,
      allowedRoles: ['owner', 'manager', 'cashier'],
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'employee_loans',
      title: 'سلف وعهد الموظفين',
      icon: WalletCards,
      allowedRoles: ['owner'],
      badge: totalOutstandingLoans > 0 ? 1 : undefined,
    },
    {
      id: 'expenses',
      title: 'المصروفات والمشتريات',
      icon: DollarSign,
      allowedRoles: ['owner'],
    },
    {
      id: 'suppliers',
      title: 'إدارة الموردين',
      icon: Truck,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'categories',
      title: 'أقسام الهايبر ماركت',
      icon: FolderTree,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'branches',
      title: 'إدارة الفروع',
      icon: Building2,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'reports',
      title: 'التقارير والأرباح',
      icon: BarChart3,
      allowedRoles: ['owner', 'manager'],
    },
    {
      id: 'users',
      title: 'المستخدمين والصلاحيات',
      icon: Users,
      allowedRoles: ['owner'],
    },
  ];

  // Filter accessible tabs according to current user's role
  const accessibleItems = navItems.filter((item) => item.allowedRoles.includes(currentRole));

  // If active tab is not accessible, fallback to first accessible tab
  const currentTabAllowed = accessibleItems.some((item) => item.id === activeAdminTab);
  const effectiveTab = currentTabAllowed ? activeAdminTab : accessibleItems[0]?.id || 'dashboard';

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-neutral-900 text-white border-b border-neutral-800 shadow-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Mobile menu toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveAdminTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black shadow-xs">
                F
              </div>
              <div>
                <span className="font-black text-sm text-white tracking-wide">الفارس هايبر ماركت</span>
                <span className="block text-[10px] text-amber-400 font-bold">لوحة التحكم والإدارة الذكية</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Product Button */}
            <button
              onClick={() => setActiveAdminTab('products')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-xs"
              title="إضافة وإدارة المنتجات"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>إضافة منتج</span>
            </button>

            {/* Barcode Scanner Quick Launch */}
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs"
              title="مسح سريع للباركود"
            >
              <ScanBarcode className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">مسح باركود</span>
            </button>

            {/* Switch role on the fly */}
            <div className="hidden md:flex items-center bg-neutral-800 rounded-xl p-1 border border-neutral-700 text-xs">
              <span className="px-2 text-[11px] text-neutral-400 font-semibold">الصلاحية:</span>
              {(['owner', 'manager', 'cashier', 'employee'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchUserRole(r)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    currentRole === r
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {r === 'owner' ? 'المالك' : r === 'manager' ? 'مدير' : r === 'cashier' ? 'كاشير' : 'موظف'}
                </button>
              ))}
            </div>

            {/* Copy All Project Code Button */}
            <button
              id="btn-admin-all-codes"
              onClick={() => setIsAllCodeOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs border border-emerald-500"
              title="نسخ وتحميل جميع أكواد المشروع مجمعة معاً"
            >
              <Code className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">كل الأكواد مجمعة</span>
            </button>

            {/* Share Store & Admin Links */}
            <button
              onClick={() => setIsShareLinksOpen(true)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs"
              title="عرض ونسخ روابط المتجر ولوحة الإدارة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">روابط الموقع</span>
            </button>

            {/* Return to Customer Store */}
            <button
              onClick={() => setCurrentView('store')}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">متجر العملاء</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-20 w-64 bg-white border-l border-neutral-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 pt-16 lg:pt-0 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* User Profile Card */}
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser?.name?.charAt(0) || 'ف'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-neutral-900 truncate">
                  {currentUser?.name || 'صاحب الهايبر'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-700">
                    {currentRole === 'owner'
                      ? 'المالك (كافة الصلاحيات)'
                      : currentRole === 'manager'
                      ? 'المدير العام'
                      : currentRole === 'cashier'
                      ? 'كاشير مبيعات'
                      : 'موظف مخزن'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-neutral-500'}`} />
                    <span>{item.title}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-amber-400 text-emerald-950' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-400 text-center">
            <p className="font-semibold text-neutral-600">الفارس هايبر ماركت v2.5</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">نظام إدارة العمليات والمخزون</p>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Admin Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Share Links Modal */}
      <ShareLinksModal
        isOpen={isShareLinksOpen}
        onClose={() => setIsShareLinksOpen(false)}
      />

      {/* All Project Code Modal */}
      <AllCodeModal
        isOpen={isAllCodeOpen}
        onClose={() => setIsAllCodeOpen(false)}
      />
    </div>
  );
};
