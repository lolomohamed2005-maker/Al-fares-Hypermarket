import React, { useState, useRef, useEffect } from 'react';
import {
  ScanBarcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  CreditCard,
  Banknote,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderItem } from '../../types';
import confetti from 'canvas-confetti';

export const PosCashier: React.FC = () => {
  const { products, createOrder, categories } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posCart, setPosCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [paidCash, setPaidCash] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto focus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products for quick POS grid selection
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToPosCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert('هذا المنتج غير متوفر بالمخزون حالياً!');
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert('وصلت للحد الأقصى المتوفر بالمخزن');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const found = products.find((p) => p.barcode === code);
    if (found) {
      addToPosCart(found);
      setBarcodeInput('');
    } else {
      alert(`الباركود ${code} غير مسجل بالنظام`);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setPosCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
      );
    }
  };

  const cartSubtotal = posCart.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.sellingPrice) * item.quantity,
    0
  );

  const cashChange = paidCash ? Math.max(0, parseFloat(paidCash) - cartSubtotal) : 0;

  const handleCheckoutPos = () => {
    if (posCart.length === 0) return;

    const items: OrderItem[] = posCart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.discountPrice ?? item.product.sellingPrice,
      costPrice: item.product.purchasePrice,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
    }));

    const orderId = `POS-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    // Create in store context (automatically decrements inventory & logs)
    createOrder({
      customerName: 'عميل نقطة البيع (كاشير مباشر)',
      customerPhone: '0000000000',
      deliveryType: 'pickup',
      deliveryAddress: 'مبيعات الكاشير المباشرة - الصالة',
      paymentMethod: paymentMethod === 'cash' ? 'cash_on_delivery' : 'card',
      status: 'delivered', // Immediate pickup
      items,
      subtotal: cartSubtotal,
      deliveryFee: 0,
      discount: 0,
      total: cartSubtotal,
      notes: `فاتورة نقطة بيع مباشرة رقم ${orderId}`,
    });

    setLastReceipt({
      id: orderId,
      time: now.toLocaleTimeString('ar-EG'),
      date: now.toLocaleDateString('ar-EG'),
      items: [...posCart],
      total: cartSubtotal,
      paid: paidCash ? parseFloat(paidCash) : cartSubtotal,
      change: cashChange,
      paymentMethod,
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setPosCart([]);
    setPaidCash('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">نقطة البيع السريع (الكاشير POS)</h2>
          <p className="text-xs text-neutral-500 mt-1">
            إصدار فواتير فورية لعملاء الصالة ومزامنة حركة المخزون آلياً
          </p>
        </div>

        {/* Rapid Barcode Input Form */}
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative w-64">
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="امسح بالباركود واضغط Enter..."
              className="w-full pl-3 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <ScanBarcode className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs"
          >
            إضافة
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (Products Selection Grid) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الباركود..."
                className="w-full pl-3 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">جميع الأقسام</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const price = product.discountPrice ?? product.sellingPrice;
              const isOutOfStock = product.stockQuantity <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToPosCart(product)}
                  className={`bg-white p-3 rounded-2xl border transition-all text-right select-none flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed border-neutral-200'
                      : 'cursor-pointer hover:border-emerald-400 hover:shadow-xs border-neutral-200 active:scale-95'
                  }`}
                >
                  <div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-24 rounded-xl object-cover mb-2 border border-neutral-100"
                    />
                    <h4 className="font-bold text-neutral-900 text-xs line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      {product.barcode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                    <span className="text-xs font-black text-emerald-800">{price} ج.م</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">
                      متبقي: {product.stockQuantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (Active Ticket / Invoice) - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col h-full overflow-hidden">
            {/* Ticket Header */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <span className="font-black text-sm text-neutral-900">فاتورة بيع حالية</span>
              </div>
              {posCart.length > 0 && (
                <button
                  onClick={() => setPosCart([])}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إلغاء الفاتورة</span>
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[260px] max-h-[320px] divide-y divide-neutral-100">
              {posCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                  <ShoppingCart className="w-12 h-12 mb-2 text-neutral-300" />
                  <p className="text-xs font-bold text-neutral-700">الفاتورة فارغة</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    امسح بالباركود أو اضغط على أي منتج من القائمة للإضافة
                  </p>
                </div>
              ) : (
                posCart.map((item) => {
                  const price = item.product.discountPrice ?? item.product.sellingPrice;
                  const itemTotal = price * item.quantity;

                  return (
                    <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-neutral-900 text-xs truncate">{item.product.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {price} ج.م × {item.quantity} = {itemTotal} ج.م
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateQuantity(item.product.id, 0)}
                          className="w-6 h-6 rounded-md text-neutral-400 hover:text-rose-600 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations & Checkout */}
            {posCart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50/80 space-y-3">
                {/* Total */}
                <div className="flex justify-between items-center text-sm font-black text-neutral-900">
                  <span>إجمالي الفاتورة:</span>
                  <span className="text-xl text-emerald-800 font-mono">{cartSubtotal} ج.م</span>
                </div>

                {/* Payment Selection */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>نقداً (كاش)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>بطاقة بنكية</span>
                  </button>
                </div>

                {/* Cash Calculator if cash */}
                {paymentMethod === 'cash' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={cartSubtotal}
                        value={paidCash}
                        onChange={(e) => setPaidCash(e.target.value)}
                        placeholder="المبلغ المدفوع من العميل (ج.م)..."
                        className="flex-1 p-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold focus:border-emerald-600"
                      />
                      <span className="text-xs font-bold text-neutral-600">
                        الباقي:{' '}
                        <span className="text-emerald-700 font-mono font-black">{cashChange} ج.م</span>
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckoutPos}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>إتمام البيع وطباعة الفاتورة ({cartSubtotal} ج.م)</span>
                </button>
              </div>
            )}
          </div>

          {/* Last Printed Receipt Preview */}
          {lastReceipt && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-700" />
                  آخر إيصال صادر: #{lastReceipt.id}
                </span>
                <span className="text-[10px] text-amber-800 font-mono">{lastReceipt.time}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>المبلغ الكلي: {lastReceipt.total} ج.م</span>
                <span>طريقة الدفع: {lastReceipt.paymentMethod === 'cash' ? 'كاش' : 'بطاقة'}</span>
              </div>
              {lastReceipt.paymentMethod === 'cash' && (
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>المدفوع: {lastReceipt.paid} ج.م</span>
                  <span className="font-bold text-emerald-700">الباقي للعميل: {lastReceipt.change} ج.م</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
