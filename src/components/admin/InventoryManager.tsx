import React, { useState } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Calendar,
  Search,
  Plus,
  History,
  ShieldAlert,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InventoryManager: React.FC = () => {
  const { products, inventoryLogs, lowStockProducts, adjustStock, currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<'stock' | 'logs' | 'alerts'>('stock');
  const [searchQuery, setSearchQuery] = useState('');

  // Restock modal / quick adjustment
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('استلام توريد جديد من المورد');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Expiring soon products (products with expiryDate within 30 days)
  const expiringProducts = products.filter((p) => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 45;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    adjustStock(
      selectedProductId,
      adjustQuantity,
      adjustReason,
      currentUser?.name || 'المدير المسؤول'
    );

    setShowAdjustModal(false);
    setSelectedProductId('');
    setAdjustQuantity(10);
  };

  const openQuickRestock = (productId: string) => {
    setSelectedProductId(productId);
    setAdjustQuantity(20);
    setAdjustReason('إعادة توريد لتعويض النواقص بالمخزن');
    setShowAdjustModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">إدارة المخزون وحركات الجرد</h2>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة دقيقة لحركة كل صنف داخل الهايبر ماركت وسجل الوارد والمنصرف
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProductId(products[0]?.id || '');
            setShowAdjustModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة / تسوية مخزون</span>
        </button>
      </div>

      {/* 3 Metric Cards for Inventory Health */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي الأصناف بالمخزن</span>
            <Boxes className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{products.length} صنف</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            إجمالي القطع المخزنة:{' '}
            {products.reduce((sum, p) => sum + p.stockQuantity, 0).toLocaleString()} قطعة
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">نواقص تحتاج لإعادة طلب</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{lowStockProducts.length} صنف</div>
          <p className="text-[11px] text-amber-600 font-bold mt-1">أقل من الحد الأدنى للأمان</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">تقترب من انتهاء الصلاحية</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">{expiringProducts.length} صنف</div>
          <p className="text-[11px] text-neutral-400 mt-1">أقل من 45 يومًا على تاريخ الصلاحية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-neutral-200/60 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'stock'
              ? 'bg-white text-emerald-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          أرصدة المخزون الحالية ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-white text-emerald-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>سجل حركات المخزون ({inventoryLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-white text-emerald-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>تنبيهات النواقص والصلاحية ({lowStockProducts.length + expiringProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK BALANCES */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الباركود..."
              className="w-full pl-3.5 pr-10 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 pr-5">المنتج</th>
                  <th className="py-3.5">الباركود</th>
                  <th className="py-3.5">الرصيد الفعلي</th>
                  <th className="py-3.5">حد الأمان</th>
                  <th className="py-3.5">الحالة</th>
                  <th className="py-3.5 pl-5 text-center">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="py-3 pr-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-neutral-200"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block">{p.name}</span>
                            <span className="text-[10px] text-neutral-400">{p.unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-neutral-500">{p.barcode}</td>
                      <td className="py-3 font-mono font-black text-sm text-neutral-900">
                        {p.stockQuantity}
                      </td>
                      <td className="py-3 font-mono text-neutral-500">{p.minStockAlert}</td>
                      <td className="py-3">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            نفد من المخزن
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            منخفض جداً
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            متوفر ومستقر
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-5 text-center">
                        <button
                          onClick={() => openQuickRestock(p.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors"
                        >
                          + توريد سريع
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MOVEMENT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-800">
              سجل تفصيلي لجميع حركات الإضافة والخصم الآلي واليدوي
            </span>
            <span className="text-neutral-500">يتم التوثيق آلياً مع كل عملية</span>
          </div>

          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3 pr-5">التاريخ والوقت</th>
                <th className="py-3">المنتج</th>
                <th className="py-3">نوع الحركة</th>
                <th className="py-3">الكمية</th>
                <th className="py-3">السبب والتفاصيل</th>
                <th className="py-3 pl-5">القائم بالتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {inventoryLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    لا توجد حركات مسجلة بعد
                  </td>
                </tr>
              ) : (
                inventoryLogs.map((log) => {
                  const isPositive = log.quantityChanged > 0;

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-3 pr-5 text-neutral-500 text-[11px] font-mono">
                        {log.createdAt}
                      </td>
                      <td className="py-3 font-bold text-neutral-900">{log.productName}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                              <span>إضافة وارد (+)</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-700" />
                              <span>صرف / مبيعات (-)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td
                        className={`py-3 font-mono font-black ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? `+${log.quantityChanged}` : log.quantityChanged}
                      </td>
                      <td className="py-3 text-neutral-600">{log.reason}</td>
                      <td className="py-3 pl-5 text-neutral-700 font-semibold">{log.performedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ALERTS & EXPIRATION */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-neutral-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>أصناف قاربت على النفاد ({lowStockProducts.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-neutral-100">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{p.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        المورد: {p.supplierName} | الحد: {p.minStockAlert}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      متبقي: {p.stockQuantity}
                    </span>
                    <button
                      onClick={() => openQuickRestock(p.id)}
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                    >
                      طلب توريد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expiry Alerts */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-neutral-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>أصناف تنتهي صلاحيتها قريباً ({expiringProducts.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-neutral-100">
              {expiringProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <span>جميع التواريخ سليمة وممتدة لفترات كافية</span>
                </div>
              ) : (
                expiringProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{p.name}</p>
                        <p className="text-[10px] text-purple-700 font-semibold">
                          تاريخ الانتهاء: {p.expiryDate}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-700">
                      الكمية بالمخزن: {p.stockQuantity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">تسوية وتوريد مخزون</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">اختر المنتج</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (الرصيد الحالي: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  الكمية (أدخل رقم موجب للإضافة، أو سالب للخصم/التالف)
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">سبب التعديل</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="مثال: استلام فاتورة توريد رقم 402"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  تأكيد التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
