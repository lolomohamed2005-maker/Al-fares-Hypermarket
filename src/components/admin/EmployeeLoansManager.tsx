import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const EmployeeLoansManager: React.FC = () => {
  const {
    loanTransactions,
    addLoanTransaction,
    employeeSummaries,
    totalOutstandingLoans,
    employees,
    currentUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Add Loan Form State
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [reason, setReason] = useState('سلفة شخصية على المرتب');
  const [notes, setNotes] = useState('');

  // Return Loan State
  const [selectedPersonForReturn, setSelectedPersonForReturn] = useState('');
  const [returnAmount, setReturnAmount] = useState<number>(200);
  const [returnNotes, setReturnNotes] = useState('سداد دفعة من السلفة نقداً بالخزينة');

  const totalBorrowedAll = loanTransactions
    .filter((t) => t.type === 'borrow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReturnedAll = loanTransactions
    .filter((t) => t.type === 'return')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || amount <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    addLoanTransaction({
      personName: personName.trim(),
      type: 'borrow',
      amount: Number(amount),
      date: dateStr,
      time: timeStr,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      recordedBy: currentUser?.name || 'المدير العام',
    });

    setShowAddLoanModal(false);
    setPersonName('');
    setAmount(500);
    setNotes('');
  };

  const handleReturnLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonForReturn || returnAmount <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    addLoanTransaction({
      personName: selectedPersonForReturn,
      type: 'return',
      amount: Number(returnAmount),
      date: dateStr,
      time: timeStr,
      reason: returnNotes.trim() || 'سداد سلفة نقداً',
      notes: 'تم استلام المبلغ وإيداعه بخزينة الهايبر',
      recordedBy: currentUser?.name || 'المدير العام',
    });

    setShowReturnModal(false);
    setSelectedPersonForReturn('');
    setReturnAmount(0);
  };

  const openReturnForPerson = (name: string, remaining: number) => {
    setSelectedPersonForReturn(name);
    setReturnAmount(remaining);
    setShowReturnModal(true);
  };

  const filteredTransactions = loanTransactions.filter(
    (t) =>
      t.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">
            سلف وعهد الموظفين (تسجيل واسترداد الأموال)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            توثيق دقيق للأموال المصروفة من الخزينة للموظفين ومتابعة المبالغ المستردة والمتبقية
          </p>
        </div>

        <button
          onClick={() => {
            setPersonName(employees[0]?.name || '');
            setShowAddLoanModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل سلفة / عهدة جديدة</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Remaining */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي المتبقي طرف الموظفين</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <WalletCards className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">
            {totalOutstandingLoans.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-rose-600 font-bold mt-1">أموال مستحقة لم يتم إرجاعها بعد</p>
        </div>

        {/* Total Borrowed */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي السلف والعهد المنصرفة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">
            {totalBorrowedAll.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">إجمالي ما أخذه الموظفون من الخزينة</p>
        </div>

        {/* Total Returned */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي الأموال المعادة للخزينة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {totalReturnedAll.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">تمت تسويتها وإرجاعها للخزينة</p>
        </div>
      </div>

      {/* Summary Per Person (Exact requirement: Person name, Total taken, Total returned, Remaining balance) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <h3 className="text-sm font-black text-neutral-900 mb-4">
          كشف حساب إجمالي لكل شخص (إجمالي المأخوذ، المعاد، والمتبقي عليه)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {employeeSummaries.map((emp) => (
            <div
              key={emp.personName}
              className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs">
                    {emp.personName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-black text-neutral-900 block">{emp.personName}</span>
                    <span className="text-[10px] text-neutral-400">آخر حركة: {emp.lastActivityDate}</span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                    emp.remainingDebt === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {emp.remainingDebt === 0 ? 'مسدد بالكامل' : `متبقي ${emp.remainingDebt} ج.م`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs border-t border-neutral-200/80 pt-2 text-neutral-600">
                <div className="flex justify-between">
                  <span>إجمالي ما أخذه:</span>
                  <span className="font-bold text-neutral-900">{emp.totalBorrowed} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي ما أعاده:</span>
                  <span className="font-bold text-emerald-700">{emp.totalReturned} ج.م</span>
                </div>
                <div className="flex justify-between font-black text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>المتبقي عليه:</span>
                  <span className={emp.remainingDebt > 0 ? 'text-rose-700 text-sm' : 'text-emerald-700'}>
                    {emp.remainingDebt} ج.م
                  </span>
                </div>
              </div>

              {emp.remainingDebt > 0 && (
                <button
                  onClick={() => openReturnForPerson(emp.personName, emp.remainingDebt)}
                  className="mt-3 w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  تسجيل رد أموال
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Operations Log Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الشخص أو السبب أو التاريخ..."
              className="w-full pl-3.5 pr-10 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <span className="text-xs text-neutral-500 font-semibold self-start sm:self-auto">
            سجل العمليات التفصيلي ({filteredTransactions.length} حركة مسجلة)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">اسم الموظف / الشخص</th>
                <th className="py-3.5">نوع العملية</th>
                <th className="py-3.5">المبلغ</th>
                <th className="py-3.5">التاريخ والوقت</th>
                <th className="py-3.5">السبب</th>
                <th className="py-3.5">المسؤول عن التوثيق</th>
                <th className="py-3.5 pl-5">الملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.map((txn) => {
                const isBorrow = txn.type === 'borrow';

                return (
                  <tr key={txn.id} className="hover:bg-neutral-50">
                    <td className="py-3 pr-5 font-bold text-neutral-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>{txn.personName}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isBorrow
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isBorrow ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            <span>صرف سلفة / عهدة</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>رد أموال للخزينة</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td
                      className={`py-3 font-mono font-black text-sm ${
                        isBorrow ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {isBorrow ? '-' : '+'}
                      {txn.amount} ج.م
                    </td>
                    <td className="py-3 text-[11px] text-neutral-500 font-mono">
                      <div>{txn.date}</div>
                      <div className="text-[10px] text-neutral-400">{txn.time}</div>
                    </td>
                    <td className="py-3 font-semibold text-neutral-800 max-w-xs">{txn.reason}</td>
                    <td className="py-3 text-neutral-600">{txn.recordedBy}</td>
                    <td className="py-3 pl-5 text-[11px] text-neutral-500 max-w-xs truncate">
                      {txn.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Loan */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">تسجيل سلفة / عهدة جديدة لموظف</h3>
              <button
                onClick={() => setShowAddLoanModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  اسم الشخص / الموظف *
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله (الكاشير)"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المبلغ المصروف من الخزينة (ج.م) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">سبب الصرف *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: سلفة على المرتب، شراء مستلزمات عاجلة، عهدة مصاريف"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تفاصيل أو طريقة الاسترداد المتفق عليها..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  صرف وتوثيق السلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Return Loan */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">تسجيل رد أموال سلفة للخزينة</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">الموظف / الشخص</label>
                <input
                  type="text"
                  readOnly
                  value={selectedPersonForReturn}
                  className="w-full p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المبلغ المعاد للخزينة (ج.م) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={returnAmount}
                  onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">ملاحظات السداد</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="مثال: خصم من الراتب أو سداد كاش باليد"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                >
                  إيداع بالخزينة وتسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
