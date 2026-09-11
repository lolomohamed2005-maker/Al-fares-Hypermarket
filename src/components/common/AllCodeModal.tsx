import React, { useState } from 'react';
import {
  X,
  Code,
  Copy,
  Check,
  Download,
  FolderArchive,
  FileCode,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../../data/supabaseSqlScript';

interface AllCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AllCodeModal: React.FC<AllCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'combined' | 'files'>('combined');
  const [selectedFile, setSelectedFile] = useState<string>('App.tsx');
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  if (!isOpen) return null;

  // Key unified codes organized by file
  const projectCodeFiles: Record<string, { title: string; path: string; code: string }> = {
    'package.json': {
      title: 'إعدادات الحزم والتبعيات (package.json)',
      path: '/package.json',
      code: `{
  "name": "al-fares-hypermarket",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}`,
    },
    'index.html': {
      title: 'صفحة البداية والخطوط (index.html)',
      path: '/index.html',
      code: `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>الفارس هايبر ماركت | Al Fares Hyper Market</title>
    <meta name="description" content="منصة تسوق متكاملة ولوحة تحكم ذكية لإدارة هايبر ماركت الفارس: تسوق إلكتروني، إدارة المخزون، المبيعات، الموظفين، السلف والمصروفات" />
    <meta property="og:title" content="الفارس هايبر ماركت | Al Fares Hyper Market" />
    <meta property="og:description" content="منصة تسوق متكاملة ولوحة تحكم ذكية لإدارة هايبر ماركت الفارس: تسوق إلكتروني، إدارة المخزون، المبيعات، الموظفين، السلف والمصروفات" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body class="bg-neutral-50 text-neutral-900 antialiased font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
    'types.ts': {
      title: 'الأنواع والنماذج (src/types/index.ts)',
      path: '/src/types/index.ts',
      code: `export type Role = 'owner' | 'manager' | 'cashier' | 'employee' | 'customer';

export type OrderStatus =
  | 'received'          // 1. تم استلام الطلب
  | 'preparing'         // 2. جاري تجهيز الطلب
  | 'ready_for_delivery'// 3. جاهز للتوصيل
  | 'out_for_delivery'  // 4. خرج للتوصيل
  | 'delivered'         // 5. تم التسليم
  | 'cancelled';        // 6. تم الإلغاء

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  icon?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  barcode: string;
  purchasePrice: number;    // سعر الشراء
  sellingPrice: number;     // سعر البيع
  discountPrice?: number;   // سعر الخصم إن وجد
  stockQuantity: number;    // الكمية الموجودة بالمخزون
  minStockAlert: number;    // حد التنبيه للكمية
  supplierName: string;     // المورد
  expiryDate?: string;
  image: string;
  unit: string;
  isActive: boolean;
  salesCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  paymentMethod: 'cash_on_delivery' | 'card' | 'wallet';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'damage';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export type LoanTransactionType = 'borrow' | 'return';

export interface EmployeeLoanTransaction {
  id: string;
  personName: string;
  type: LoanTransactionType;
  amount: number;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface EmployeeLoanSummary {
  personName: string;
  totalBorrowed: number;
  totalReturned: number;
  remainingDebt: number;
  lastActivityDate: string;
}

export type ExpenseCategory =
  | 'goods_purchase'
  | 'electricity'
  | 'rent'
  | 'salaries'
  | 'transport'
  | 'maintenance'
  | 'other';

export interface Expense {
  id: string;
  title?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  productsSupplied?: string;
  suppliedProducts?: string[];
  totalDemanded?: number;
  totalOwed?: number;
  amountPaid?: number;
  paidAmount?: number;
  remainingBalance?: number;
  remainingAmount?: number;
  notes?: string;
  createdAt: string;
}`,
    },
    'main.tsx': {
      title: 'نقطة انطلاق React (src/main.tsx)',
      path: '/src/main.tsx',
      code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
    },
    'index.css': {
      title: 'تنسيق Tailwind CSS (src/index.css)',
      path: '/src/index.css',
      code: `@import "tailwindcss";`,
    },
    'App.tsx': {
      title: 'المكون الرئيسي والتوجيه (src/App.tsx)',
      path: '/src/App.tsx',
      code: `import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Storefront } from './components/customer/Storefront';
import { ProductModal } from './components/customer/ProductModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrdersTrackingModal } from './components/customer/OrdersTrackingModal';
import { AuthModal } from './components/customer/AuthModal';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PosCashier } from './components/admin/PosCashier';
import { ProductsManager } from './components/admin/ProductsManager';
import { InventoryManager } from './components/admin/InventoryManager';
import { OrdersManager } from './components/admin/OrdersManager';
import { EmployeeLoansManager } from './components/admin/EmployeeLoansManager';
import { ExpensesManager } from './components/admin/ExpensesManager';
import { SuppliersManager } from './components/admin/SuppliersManager';
import { CategoriesManager } from './components/admin/CategoriesManager';
import { ReportsManager } from './components/admin/ReportsManager';
import { UsersManager } from './components/admin/UsersManager';
import { BarcodeScannerModal } from './components/admin/BarcodeScannerModal';
import { AddProductModal } from './components/admin/AddProductModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Product } from './types';

const MainApplication: React.FC = () => {
  const {
    currentView,
    activeAdminTab,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    isAuthOpen,
    setIsAuthOpen,
    isAdminAuthOpen,
    setIsAdminAuthOpen,
  } = useStore();

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isGlobalBarcodeOpen, setIsGlobalBarcodeOpen] = useState(false);
  const [isAddProductFromBarcodeOpen, setIsAddProductFromBarcodeOpen] = useState(false);
  const [barcodePrefill, setBarcodePrefill] = useState('');
  const [editingProductFromBarcode, setEditingProductFromBarcode] = useState<Product | null>(null);

  const handleBarcodeFound = (product: Product) => {
    setEditingProductFromBarcode(product);
    setIsAddProductFromBarcodeOpen(true);
  };

  const handleBarcodeNotFound = (scannedCode: string) => {
    setEditingProductFromBarcode(null);
    setBarcodePrefill(scannedCode);
    setIsAddProductFromBarcodeOpen(true);
  };

  const renderAdminTab = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'pos':
        return <PosCashier />;
      case 'products':
        return <ProductsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'orders':
        return <OrdersManager />;
      case 'employee_loans':
        return <EmployeeLoansManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'suppliers':
        return <SuppliersManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'reports':
        return <ReportsManager />;
      case 'users':
        return <UsersManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-emerald-600 selection:text-white">
      {currentView === 'store' ? (
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <Storefront
              onOpenProductModal={(product) => setSelectedProductForModal(product)}
            />
          </main>
          <Footer />

          {selectedProductForModal && (
            <ProductModal
              product={selectedProductForModal}
              onClose={() => setSelectedProductForModal(null)}
            />
          )}

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
          />

          <OrdersTrackingModal
            isOpen={isOrderTrackingOpen}
            onClose={() => setIsOrderTrackingOpen(false)}
          />

          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />
        </div>
      ) : (
        <AdminLayout onOpenBarcodeScanner={() => setIsGlobalBarcodeOpen(true)}>
          {renderAdminTab()}

          <BarcodeScannerModal
            isOpen={isGlobalBarcodeOpen}
            onClose={() => setIsGlobalBarcodeOpen(false)}
            onProductFound={handleBarcodeFound}
            onProductNotFound={handleBarcodeNotFound}
          />

          <AddProductModal
            isOpen={isAddProductFromBarcodeOpen}
            onClose={() => {
              setIsAddProductFromBarcodeOpen(false);
              setEditingProductFromBarcode(null);
            }}
            initialProduct={editingProductFromBarcode}
            prefilledBarcode={barcodePrefill}
          />
        </AdminLayout>
      )}

      <AdminLoginModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApplication />
    </StoreProvider>
  );
}`,
    },
    'vite.config.ts': {
      title: 'إعدادات Vite (vite.config.ts)',
      path: '/vite.config.ts',
      code: `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});`,
    },
    'supabase.ts': {
      title: 'اتصال وتخزين Supabase (src/lib/supabase.ts)',
      path: '/src/lib/supabase.ts',
      code: `import { createClient } from '@supabase/supabase-js';

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  envSupabaseUrl &&
  envSupabaseAnonKey &&
  !envSupabaseUrl.includes('your-project-ref') &&
  envSupabaseUrl.startsWith('https://')
);

const supabaseUrl = isSupabaseConfigured ? envSupabaseUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? envSupabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});`,
    },
    'schema.sql': {
      title: 'مخطط قاعدة بيانات Supabase والجداول والأمان (supabase/schema.sql)',
      path: '/supabase/schema.sql',
      code: SUPABASE_SCHEMA_SQL,
    },
    '.env.example': {
      title: 'متغيرات البيئة للربط (/.env.example)',
      path: '/.env.example',
      code: `VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`,
    },
  };

  // Generate complete combined text of all files
  const combinedAllCode = Object.entries(projectCodeFiles)
    .map(([fileName, data]) => {
      return `/* =========================================================================
   FILE: ${data.path}
   TITLE: ${data.title}
   ========================================================================= */

${data.code}

`;
    })
    .join('\n\n');

  const copyToClipboard = (text: string, isAll: boolean) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (isAll) {
          setCopiedAll(true);
          setTimeout(() => setCopiedAll(false), 3000);
        } else {
          setCopiedCurrent(true);
          setTimeout(() => setCopiedCurrent(false), 2000);
        }
      });
    }
  };

  const downloadAsZipFile = async () => {
    try {
      const res = await fetch('/al-fares-hypermarket.zip');
      if (!res.ok) throw new Error('Failed to fetch zip');
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

  const downloadAsTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([combinedAllCode], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'AlFares_Hypermarket_All_Codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  أكواد المشروع كاملة مجمعة معاً
                </h3>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-bold hidden sm:inline">
                  نسخ بنقرة واحدة
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                يمكنك نسخ كل الأكواد مجمعة في ملف واحد فوراً أو تحميلها بضغطة زر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons & Tabs Bar */}
        <div className="bg-neutral-100 border-b border-neutral-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('combined')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'combined'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              كل الأكواد مجمعة (ملف واحد)
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'files'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              تصفح ملف بملف
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              طريقة التنزيل كـ ZIP
            </button>
          </div>

          {/* Quick Copy & Download Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-download-project-zip"
              onClick={downloadAsZipFile}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm border border-amber-500/50"
              title="تحميل فولدر المشروع بالكامل مضغوطاً (.zip)"
            >
              <FolderArchive className="w-4 h-4 text-neutral-900" />
              <span>تحميل فولدر المشروع (.zip)</span>
            </button>

            <button
              id="btn-copy-all-codes"
              onClick={() => copyToClipboard(combinedAllCode, true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>تم نسخ كل الأكواد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ كل الأكواد</span>
                </>
              )}
            </button>

            <button
              onClick={downloadAsTextFile}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="تحميل كملف نصي يحتوي على جميع الأكواد"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">تحميل كملف (.txt)</span>
              <span className="sm:hidden">ملف</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: Combined All Code */}
          {activeTab === 'combined' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    هذا الكود مدمج بالكامل ويحتوي على كافة ملفات المشروع مع فواصل واضحة لكل ملف. اضغط على زر النسخ بالأعلى لأخذه فوراً!
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-200 font-mono text-xs">
                <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 text-neutral-400">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    AlFares_Hypermarket_Combined_Codebase.ts
                  </span>
                  <button
                    onClick={() => copyToClipboard(combinedAllCode, true)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-sans font-bold"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAll ? 'تم النسخ' : 'نسخ النص كاملاً'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[50vh] text-[11px] leading-relaxed select-all">
                  {combinedAllCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: File by File */}
          {activeTab === 'files' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* File List */}
              <div className="lg:col-span-1 space-y-1 bg-neutral-100 p-2 rounded-2xl border border-neutral-200">
                <p className="text-xs font-bold text-neutral-500 px-2 py-1">قائمة الملفات الأساسية:</p>
                {Object.keys(projectCodeFiles).map((fileKey) => (
                  <button
                    key={fileKey}
                    onClick={() => setSelectedFile(fileKey)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedFile === fileKey
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-200/80'
                    }`}
                  >
                    <span className="truncate">{fileKey}</span>
                    <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>
                ))}
              </div>

              {/* File Code Display */}
              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center justify-between bg-neutral-100 px-4 py-2 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">
                      {projectCodeFiles[selectedFile]?.title}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px] block mt-0.5">
                      {projectCodeFiles[selectedFile]?.path}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(projectCodeFiles[selectedFile]?.code || '', false)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                  >
                    {copiedCurrent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCurrent ? 'تم النسخ' : 'نسخ هذا الملف'}
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-200 font-mono text-xs">
                  <pre className="p-4 overflow-x-auto max-h-[46vh] text-[11px] leading-relaxed select-all">
                    {projectCodeFiles[selectedFile]?.code}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-black">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-amber-950 text-sm">
                    هل تريد تنزيل كل ملفات المشروع كما هي في مجلد مضغوط ZIP؟
                  </h4>
                  <p className="text-amber-900 leading-relaxed text-xs">
                    هذه أفضل وأضمن طريقة للحصول على التطبيق بكل مكوناته (أكثر من 35 ملفاً ومجلداً) دون الحاجة لنسخ ولصق الملفات يدوياً.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h5 className="font-bold text-neutral-900">قائمة الإعدادات</h5>
                  <p className="text-neutral-500 text-xs">
                    في أعلى يمين نافذة AI Studio اضغط على رمز الترس ⚙️ أو زر التصدير (Export).
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h5 className="font-bold text-neutral-900">تنزيل ZIP أو GitHub</h5>
                  <p className="text-neutral-500 text-xs">
                    اختر <b>Download ZIP</b> أو <b>Export to GitHub</b> لحفظ المشروع مباشرة على جهازك.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h5 className="font-bold text-neutral-900">تشغيل المشروع</h5>
                  <p className="text-neutral-500 text-xs">
                    فك الضغط وافتح موجه الأوامر واكتب:
                    <code className="block bg-neutral-900 text-amber-300 p-1.5 rounded-md mt-1 font-mono text-[10px]" dir="ltr">
                      npm install && npm run dev
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500">
            مشروع هايبر ماركت الفارس | كفرالشيخ أمام بورصه الأسماك
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
