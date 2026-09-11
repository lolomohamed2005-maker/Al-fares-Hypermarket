import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Boxes,
  Printer,
  Calendar,
  WalletCards,
  AlertTriangle,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ReportsManager: React.FC = () => {
  const {
    orders,
    products,
    expenses,
    categories,
    lowStockProducts,
    totalOutstandingLoans,
  } = useStore();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Multiplier or simulated factor based on timeframe
  const periodFactor = timeframe === 'daily' ? 0.05 : timeframe === 'weekly' ? 0.3 : 1;

  // Completed delivered orders
  const validOrders = orders.filter((o) => o.status !== 'cancelled');

  // Total Sales
  const rawSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSales = Math.round(rawSales * periodFactor);

  // Cost of Goods Sold (COGS)
  const rawCogs = validOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((iSum, item) => {
        const cost = item.costPrice || item.price * 0.75;
        return iSum + cost * item.quantity;
      }, 0)
    );
  }, 0);
  const totalCogs = Math.round(rawCogs * periodFactor);

  // Operating Expenses
  const rawExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = Math.round(rawExpenses * periodFactor);

  // Purchases
  const purchasesTotal = Math.round(
    expenses
      .filter((e) => e.category === 'goods_purchase')
      .reduce((sum, e) => sum + e.amount, 0) * periodFactor
  );

  // Net Profit = Sales - COGS - Expenses
  const grossProfit = totalSales - totalCogs;
  const netProfit = grossProfit - (totalExpenses - purchasesTotal); // Avoid double deducting purchase expense if COGS used

  // Orders count
  const ordersCount = Math.max(1, Math.round(validOrders.length * periodFactor));

  // Best & Least Sellers
  const sortedBySales = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  const topSellers = sortedBySales.slice(0, 5);
  const leastSellers = [...sortedBySales].reverse().slice(0, 5);

  // Profits by Category
  const categoryProfits = categories.map((cat) => {
    const catProducts = products.filter((p) => p.categoryId === cat.id);
    const catSales = catProducts.reduce(
      (sum, p) => sum + (p.salesCount || 0) * (p.discountPrice ?? p.sellingPrice),
      0
    );
    const catCost = catProducts.reduce(
      (sum, p) => sum + (p.salesCount || 0) * p.purchasePrice,
      0
    );
    const catProfit = catSales - catCost;

    return {
      category: cat.name,
      sales: Math.round(catSales * periodFactor),
      profit: Math.round(catProfit * periodFactor),
      productsCount: catProducts.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selectors & Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">
            التقارير المالية وحسابات الأرباح
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            تحليل دقيق لصافي الأرباح، المصروفات، حركة الأصناف، وتقييم الفئات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === 'daily'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              يومي
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === 'weekly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              أسبوعي
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === 'monthly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              شهري شامل
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Financial Matrix (Sales, Purchases, Expenses, Net Profit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {totalSales.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            عدد الطلبات المنفذة: {ordersCount} طلب
          </p>
        </div>

        {/* 2. Total Purchases */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">إجمالي المشتريات وتكلفة البضاعة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">
            {totalCogs.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">تكلفة المواد المباعة بالجملة</p>
        </div>

        {/* 3. Operational Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-500">المصروفات التشغيلية</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {totalExpenses.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-500">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">كهرباء، رواتب، إيجار، وصيانة</p>
        </div>

        {/* 4. NET PROFIT */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-3xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-200">صافي الربح الحقيقي</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-700/80 text-amber-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {netProfit.toLocaleString()} <span className="text-xs font-bold text-white">ج.م</span>
            </div>
            <p className="text-[11px] text-emerald-200 mt-1">
              هامش الربح: {totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Row: Employee advances & Re-order items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 block mb-1">
              الأموال الموجودة مع الموظفين (سلف وعهد لم تسدد)
            </span>
            <span className="text-xl font-black text-rose-700 font-mono">
              {totalOutstandingLoans.toLocaleString()} ج.م
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              موزعة على موظفي الكاشير والمخزن
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <WalletCards className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 block mb-1">
              منتجات تحتاج لإعادة طلب فورية من الموردين
            </span>
            <span className="text-xl font-black text-orange-700 font-mono">
              {lowStockProducts.length} صنف بالمخزن
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              أوشكت على النفاد وتحت خط الأمان
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Profits by Category (الأرباح حسب القسم) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <h3 className="font-black text-neutral-900 text-sm sm:text-base mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>تحليل المبيعات والأرباح حسب كل قسم بالهايبر</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3 pr-4">القسم</th>
                <th className="py-3">عدد الأصناف</th>
                <th className="py-3">إجمالي المبيعات</th>
                <th className="py-3">صافي ربح القسم</th>
                <th className="py-3 pl-4">نسبة المساهمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categoryProfits.map((cat, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="py-3 pr-4 font-bold text-neutral-900">{cat.category}</td>
                  <td className="py-3 text-neutral-600 font-mono">{cat.productsCount} صنف</td>
                  <td className="py-3 font-mono font-bold text-neutral-800">
                    {cat.sales.toLocaleString()} ج.م
                  </td>
                  <td className="py-3 font-mono font-black text-emerald-800">
                    {cat.profit.toLocaleString()} ج.م
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{
                            width: `${
                              totalSales > 0 ? Math.min(100, Math.round((cat.sales / totalSales) * 100)) : 10
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        {totalSales > 0 ? Math.round((cat.sales / totalSales) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Sellers vs Least Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
          <h4 className="font-black text-neutral-900 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>أكثر 5 منتجات مبيعاً (الأعلى إقبالاً)</span>
          </h4>
          <div className="divide-y divide-neutral-100">
            {topSellers.map((prod, i) => (
              <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center font-black text-emerald-700">{i + 1}</span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-8 h-8 rounded-lg object-cover border border-neutral-200"
                  />
                  <div>
                    <p className="font-bold text-neutral-800">{prod.name}</p>
                    <span className="text-[10px] text-neutral-400">{prod.unit}</span>
                  </div>
                </div>
                <div className="text-left font-black text-emerald-800">
                  {prod.salesCount || 0} مبيعة
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Sellers */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
          <h4 className="font-black text-neutral-900 text-sm mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>أقل المنتجات مبيعاً (بحاجة لعروض ترويجية)</span>
          </h4>
          <div className="divide-y divide-neutral-100">
            {leastSellers.map((prod, i) => (
              <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center font-black text-neutral-400">{i + 1}</span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-8 h-8 rounded-lg object-cover border border-neutral-200"
                  />
                  <div>
                    <p className="font-bold text-neutral-800">{prod.name}</p>
                    <span className="text-[10px] text-neutral-400">
                      السعر: {prod.discountPrice ?? prod.sellingPrice} ج.م
                    </span>
                  </div>
                </div>
                <div className="text-left font-bold text-neutral-500">
                  {prod.salesCount || 0} مبيعة
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
