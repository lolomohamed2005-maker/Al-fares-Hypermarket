import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  PieChart,
  Tag,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ExpenseCategory } from '../../types';

const CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  goods_purchase: 'شراء بضاعة ومخزون',
  electricity: 'كهرباء ومرافق',
  rent: 'إيجار المحل / المخزن',
  salaries: 'رواتب موظفين',
  transport: 'مواصلات وبنزين نقل',
  maintenance: 'صيانة ومعدات',
  other: 'مصروفات تشغيلية أخرى',
};

export const ExpensesManager: React.FC = () => {
  const { expenses, addExpense, currentUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState<number>(100);
  const [paidBy, setPaidBy] = useState(currentUser?.name || 'المالك');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for percentage breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const filteredExpenses = expenses.filter((e) => {
    const titleText = e.title || e.notes || '';
    const matchesSearch =
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      paidBy: paidBy.trim() || 'المدير',
      notes: notes.trim() || undefined,
      receiptUrl: receiptUrl.trim() || undefined,
    });

    setShowAddModal(false);
    setTitle('');
    setAmount(100);
    setNotes('');
    setReceiptUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">المصروفات ومشتريات الهايبر</h2>
          <p className="text-xs text-neutral-500 mt-1">
            توثيق دقيق لكافة المصاريف التشغيلية (كهرباء، إيجار، رواتب، شراء بضائع، وصيانة)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل سند صرف جديد</span>
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {(Object.keys(CATEGORY_NAMES) as ExpenseCategory[]).map((catKey) => {
          const totalInCat = categoryTotals[catKey] || 0;
          const percentage = totalExpenses > 0 ? Math.round((totalInCat / totalExpenses) * 100) : 0;

          return (
            <div
              key={catKey}
              onClick={() => setSelectedCategoryFilter(catKey === selectedCategoryFilter ? 'all' : catKey)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedCategoryFilter === catKey
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span className="text-[11px] font-bold text-neutral-500 block truncate">
                {CATEGORY_NAMES[catKey]}
              </span>
              <span className="text-base font-black text-neutral-900 mt-1 block">
                {totalInCat.toLocaleString()} <span className="text-[10px] text-neutral-400">ج.م</span>
              </span>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">{percentage}% من الإجمالي</span>
            </div>
          );
        })}
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث ببيان المصروف أو اسم القائم بالصرف..."
              className="w-full pl-3.5 pr-10 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">
              إجمالي المصروفات: <span className="text-emerald-800 font-black">{totalExpenses.toLocaleString()} ج.م</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">بيان المصروف</th>
                <th className="py-3.5">النوع والتصنيف</th>
                <th className="py-3.5">المبلغ</th>
                <th className="py-3.5">التاريخ</th>
                <th className="py-3.5">القائم بالصرف</th>
                <th className="py-3.5">الملاحظات</th>
                <th className="py-3.5 pl-5 text-center">المستند / الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-neutral-50">
                  <td className="py-3 pr-5 font-bold text-neutral-900">{exp.title || exp.notes || 'مصروف تشغيلي'}</td>
                  <td className="py-3">
                    <span className="inline-block bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {CATEGORY_NAMES[exp.category] || exp.category}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-black text-rose-700 text-sm">
                    {exp.amount.toLocaleString()} ج.م
                  </td>
                  <td className="py-3 text-[11px] text-neutral-500 font-mono">{exp.date}</td>
                  <td className="py-3 text-neutral-700 font-semibold">{exp.paidBy}</td>
                  <td className="py-3 text-[11px] text-neutral-500 max-w-xs truncate">
                    {exp.notes || '—'}
                  </td>
                  <td className="py-3 pl-5 text-center">
                    {exp.receiptUrl ? (
                      <a
                        href={exp.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>عرض الفاتورة</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-neutral-400">بدون مرفق</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">تسجيل سند صرف جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فاتورة كهرباء شهر سبتمبر أو صيانة الثلاجة"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">نوع المصروف *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                  >
                    {(Object.keys(CATEGORY_NAMES) as ExpenseCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_NAMES[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">المبلغ المدفوع (ج.م) *</label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">الشخص القائم بالدفع *</label>
                <input
                  type="text"
                  required
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="اسم المسؤول أو الكاشير"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رابط صورة الفاتورة (اختياري)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">ملاحظات وتفاصيل</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="رقم الإيصال أو أي شروحات إضافية..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
