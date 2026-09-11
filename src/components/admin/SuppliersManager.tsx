import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Phone,
  DollarSign,
  Package,
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Supplier } from '../../types';

export const SuppliersManager: React.FC = () => {
  const { suppliers, addSupplier, recordSupplierPayment, products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Add Supplier Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [suppliedProducts, setSuppliedProducts] = useState('');
  const [totalOwed, setTotalOwed] = useState<number>(5000);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Payment Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(1000);
  const [paymentNotes, setPaymentNotes] = useState('سداد دفعة توريد كاش');

  const getRemaining = (s: Supplier) =>
    s.remainingAmount ?? s.remainingBalance ?? Math.max(0, (s.totalOwed ?? s.totalDemanded ?? 0) - (s.paidAmount ?? s.amountPaid ?? 0));
  const getPaid = (s: Supplier) => s.paidAmount ?? s.amountPaid ?? 0;
  const getTotal = (s: Supplier) => s.totalOwed ?? s.totalDemanded ?? 0;
  const getProducts = (s: Supplier): string[] => {
    if (Array.isArray(s.suppliedProducts)) return s.suppliedProducts;
    if (typeof s.productsSupplied === 'string') return s.productsSupplied.split(',').map((p) => p.trim()).filter(Boolean);
    return [];
  };

  const totalOwedAll = suppliers.reduce((sum, s) => sum + getRemaining(s), 0);

  const filteredSuppliers = suppliers.filter((s) => {
    const prods = getProducts(s);
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      prods.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const owed = Number(totalOwed);
    const paid = Number(paidAmount);
    const remaining = Math.max(0, owed - paid);

    addSupplier({
      name: name.trim(),
      phone: phone.trim(),
      productsSupplied: suppliedProducts.trim() || 'بضائع عامة متنوعة',
      suppliedProducts: suppliedProducts
        ? suppliedProducts.split(',').map((p) => p.trim()).filter(Boolean)
        : ['بضائع عامة'],
      totalDemanded: owed,
      totalOwed: owed,
      amountPaid: paid,
      paidAmount: paid,
      remainingBalance: remaining,
      remainingAmount: remaining,
    });

    setShowAddSupplierModal(false);
    setName('');
    setPhone('');
    setSuppliedProducts('');
    setTotalOwed(5000);
    setPaidAmount(0);
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || paymentAmount <= 0) return;

    recordSupplierPayment(selectedSupplierId, Number(paymentAmount), paymentNotes);
    setShowPaymentModal(false);
    setSelectedSupplierId('');
    setPaymentAmount(1000);
  };

  const openPaymentForSupplier = (supplierId: string, remaining: number) => {
    setSelectedSupplierId(supplierId);
    setPaymentAmount(Math.min(remaining, 2000));
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">إدارة الموردين وحسابات التوريد</h2>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة الشركات الموردة، البضائع، الأرصدة المستحقة، وسندات الصرف
          </p>
        </div>

        <button
          onClick={() => setShowAddSupplierModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block mb-1">إجمالي المستحق للموردين</span>
          <div className="text-2xl font-black text-rose-700">
            {totalOwedAll.toLocaleString()} <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">مبالغ مؤجلة ومستحقة السداد</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block mb-1">إجمالي ما تم سداده</span>
          <div className="text-2xl font-black text-emerald-800">
            {suppliers.reduce((sum, s) => sum + getPaid(s), 0).toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">دفعات محولة للموردين</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block mb-1">عدد الموردين المعتمدين</span>
          <div className="text-2xl font-black text-neutral-900">{suppliers.length} مورد</div>
          <p className="text-[11px] text-neutral-400 mt-1">شركات أغذية ومشروبات ومنظفات</p>
        </div>
      </div>

      {/* Suppliers Cards & Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المورد أو الهاتف أو المنتجات..."
              className="w-full pl-3.5 pr-10 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <span className="text-xs text-neutral-500 font-semibold self-start sm:self-auto">
            عرض {filteredSuppliers.length} من أصل {suppliers.length} مورد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">اسم المورد والشركة</th>
                <th className="py-3.5">رقم الهاتف للتواصل</th>
                <th className="py-3.5">المنتجات التي يوردها</th>
                <th className="py-3.5">إجمالي التوريدات</th>
                <th className="py-3.5">المسدد له</th>
                <th className="py-3.5">المتبقي له</th>
                <th className="py-3.5 pl-5 text-center">إجراء سداد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSuppliers.map((sup) => {
                const remaining = getRemaining(sup);
                const paid = getPaid(sup);
                const total = getTotal(sup);
                const prods = getProducts(sup);

                return (
                  <tr key={sup.id} className="hover:bg-neutral-50">
                    <td className="py-3 pr-5 font-bold text-neutral-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-400" />
                      <span>{sup.name}</span>
                    </td>
                    <td className="py-3 font-mono text-neutral-600">{sup.phone}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {prods.map((p, i) => (
                          <span key={i} className="bg-neutral-100 text-neutral-700 text-[10px] px-1.5 py-0.5 rounded-md">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-neutral-800">{total.toLocaleString()} ج.م</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">{paid.toLocaleString()} ج.م</td>
                    <td className="py-3 font-mono font-black text-rose-700 text-sm">
                      {remaining.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 pl-5 text-center">
                      {remaining > 0 ? (
                        <button
                          onClick={() => openPaymentForSupplier(sup.id, remaining)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200 transition-colors"
                        >
                          سداد دفعة
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold">✓ خالص بالكامل</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">إضافة مورد جديد</h3>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">اسم المورد أو الشركة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة المراعي للصناعات الغذائية"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المنتجات التي يوردها (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={suppliedProducts}
                  onChange={(e) => setSuppliedProducts(e.target.value)}
                  placeholder="مثال: ألبان، زبادي، عصائر، جبن"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">إجمالي الفاتورة المطلوبة</label>
                  <input
                    type="number"
                    min="0"
                    value={totalOwed}
                    onChange={(e) => setTotalOwed(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">المبلغ المسدد مقدماً</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Supplier Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">تسجيل دفعة سداد للمورد</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaySupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">المبلغ المراد سداده (ج.م) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">ملاحظات وطريقة السداد</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="مثال: تحويل بنكي أو نقداً إيصال رقم 550"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  تأكيد سداد المبلغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
