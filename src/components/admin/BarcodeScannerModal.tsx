import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ScanBarcode,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  PackagePlus,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewWithBarcode: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddNewWithBarcode,
}) => {
  const { products, updateProduct } = useStore();
  const [scannedCode, setScannedCode] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [searched, setSearched] = useState(false);

  // Quick edit state for matched product
  const [newStock, setNewStock] = useState<number>(0);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);
  const [newDiscountPrice, setNewDiscountPrice] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setMatchedProduct(null);
      setSearched(false);
      setSaveSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = (codeToSearch?: string) => {
    const code = (codeToSearch ?? scannedCode).trim();
    if (!code) return;

    setSearched(true);
    setSaveSuccess(false);

    const found = products.find((p) => p.barcode === code);
    if (found) {
      setMatchedProduct(found);
      setNewStock(found.stockQuantity);
      setNewSellingPrice(found.sellingPrice);
      setNewDiscountPrice(found.discountPrice ? String(found.discountPrice) : '');
    } else {
      setMatchedProduct(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan();
    }
  };

  const handleQuickSave = () => {
    if (!matchedProduct) return;

    updateProduct(matchedProduct.id, {
      stockQuantity: Number(newStock),
      sellingPrice: Number(newSellingPrice),
      discountPrice: newDiscountPrice ? Number(newDiscountPrice) : undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Sample quick test barcodes
  const sampleExisting = products[0]?.barcode || '6221001001';
  const sampleNewUnseen = '6229988776655';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ScanBarcode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">مسح الباركود (Barcode Scanner)</h3>
              <p className="text-xs text-neutral-400">تحديث فوري للسعر والمخزون أو تسجيل صنف جديد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Scanner Optical Viewport Graphic */}
          <div className="relative bg-neutral-900 rounded-2xl p-6 text-center overflow-hidden border border-neutral-800">
            {/* Red Laser Beam Animation */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <ScanBarcode className="w-16 h-16 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-300 font-bold">
                قارئ الباركود جاهز للاستقبال تلقائياً عبر ماسح الليزر USB أو الإدخال اليدوي
              </p>
            </div>
          </div>

          {/* Barcode Input Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="امسح بالباركود أو اكتب الرقم واضغط Enter..."
                className="w-full pl-3.5 pr-10 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-600 text-neutral-900 shadow-inner"
              />
              <ScanBarcode className="w-5 h-5 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="button"
              onClick={() => handleScan()}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>فحص</span>
            </button>
          </div>

          {/* Quick Click Demo Barcodes */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500 text-[11px] font-semibold">أرقام للتجربة السريعة:</span>
            <button
              type="button"
              onClick={() => {
                setScannedCode(sampleExisting);
                handleScan(sampleExisting);
              }}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200"
            >
              باركود مسجل ({sampleExisting})
            </button>
            <button
              type="button"
              onClick={() => {
                setScannedCode(sampleNewUnseen);
                handleScan(sampleNewUnseen);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200"
            >
              باركود غير مسجل ({sampleNewUnseen})
            </button>
          </div>

          {/* CASE 1: PRODUCT FOUND IN SYSTEM */}
          {searched && matchedProduct && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={matchedProduct.image}
                    alt={matchedProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      المنتج مسجل بالنظام
                    </span>
                    <h4 className="font-black text-sm text-neutral-900 mt-1">{matchedProduct.name}</h4>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      الباركود: {matchedProduct.barcode} | القسم: {matchedProduct.unit}
                    </p>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>تم تحديث السعر والكمية في المخزن والمتجر بنجاح!</span>
                </div>
              )}

              {/* Quick Update Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-100">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">تحديث الكمية بالمخزن</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">سعر البيع (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">سعر العرض (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newDiscountPrice}
                    onChange={(e) => setNewDiscountPrice(e.target.value)}
                    placeholder="بدون عرض"
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-amber-800 focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleQuickSave}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-800/15 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات السريعة</span>
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: PRODUCT NOT FOUND IN SYSTEM */}
          {searched && !matchedProduct && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <PackagePlus className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-black text-amber-950">هذا الباركود غير مسجل في المخزن بعد</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  رقم الباركود الممسوح: <span className="font-mono font-bold">{scannedCode}</span>
                </p>
              </div>

              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                يمكنك الآن إضافة منتج جديد وسيتم وضع هذا الباركود تلقائياً في استمارة الإضافة!
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewWithBarcode(scannedCode);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-800/15 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد بهذا الباركود الآن</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
