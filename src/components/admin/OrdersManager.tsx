import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Printer,
  ChevronDown,
  X,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

export const OrdersManager: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder, deleteOrder } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  const STATUS_OPTIONS: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'received', label: 'تم استلام الطلب', color: 'bg-amber-100 text-amber-800' },
    { id: 'preparing', label: 'جاري تجهيز الطلب', color: 'bg-blue-100 text-blue-800' },
    { id: 'ready_for_delivery', label: 'جاهز للتوصيل', color: 'bg-purple-100 text-purple-800' },
    { id: 'out_for_delivery', label: 'خرج للتوصيل', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'delivered', label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'cancelled', label: 'تم الإلغاء', color: 'bg-rose-100 text-rose-800' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">إدارة ومتابعة طلبات الشراء</h2>
          <p className="text-xs text-neutral-500 mt-1">
            إجمالي الطلبات المسجلة: {orders.length} طلب | قيد التجهيز والتوصيل:{' '}
            {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} طلب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">إجمالي المبيعات المكتملة:</span>
          <span className="text-emerald-800 font-black text-base">
            {orders
              .filter((o) => o.status === 'delivered')
              .reduce((s, o) => s + o.total, 0)
              .toLocaleString()}{' '}
            ج.م
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
            className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            الكل ({orders.length})
          </button>
          {STATUS_OPTIONS.map((opt) => {
            const count = orders.filter((o) => o.status === opt.id).length;
            return (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === opt.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">رقم الطلب والتاريخ</th>
                <th className="py-3.5">العميل والهاتف</th>
                <th className="py-3.5">نوع الاستلام والعنوان</th>
                <th className="py-3.5">طريقة الدفع</th>
                <th className="py-3.5">إجمالي المبلغ</th>
                <th className="py-3.5">حالة الطلب الحالية</th>
                <th className="py-3.5">تحديث مسار الطلب</th>
                <th className="py-3.5 pl-5 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    لا توجد طلبات مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusObj = STATUS_OPTIONS.find((s) => s.id === order.status);

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 pr-5">
                        <span className="font-mono font-black text-neutral-900 block">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {order.createdAt}
                        </span>
                      </td>

                      <td className="py-3">
                        <span className="font-bold text-neutral-900 block">{order.customerName}</span>
                        <span className="text-[11px] font-mono text-neutral-500">{order.customerPhone}</span>
                      </td>

                      <td className="py-3 max-w-xs">
                        <span className="font-bold text-[11px] text-emerald-800 block">
                          {order.deliveryType === 'delivery' ? 'توصيل للمنزل' : 'استلام من الهايبر'}
                        </span>
                        <span className="text-[10px] text-neutral-500 truncate block">
                          {order.deliveryAddress}
                        </span>
                      </td>

                      <td className="py-3 text-[11px] text-neutral-700 font-semibold">
                        {order.paymentMethod === 'cash_on_delivery'
                          ? 'الدفع عند الاستلام'
                          : order.paymentMethod === 'card'
                          ? 'بطاقة بنكية'
                          : 'محفظة إلكترونية'}
                      </td>

                      <td className="py-3 font-black text-emerald-800 text-sm">
                        {order.total} ج.م
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            statusObj?.color || 'bg-neutral-100'
                          }`}
                        >
                          {statusObj?.label || order.status}
                        </span>
                      </td>

                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-neutral-100 border border-neutral-300 rounded-lg text-[11px] font-bold py-1 px-2 focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 pl-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForDetails(order)}
                            className="p-1.5 bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 rounded-lg transition-colors"
                            title="عرض تفاصيل الفاتورة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطلب رقم ${order.id} نهائياً؟`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-700 rounded-lg transition-colors"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <div>
                <h3 className="font-black text-neutral-900 text-base">
                  فاتورة طلب رقم #{selectedOrderForDetails.id}
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {selectedOrderForDetails.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Delivery Data */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-2xl text-xs">
              <div>
                <span className="text-neutral-400 block mb-0.5">العميل:</span>
                <span className="font-bold text-neutral-900">
                  {selectedOrderForDetails.customerName}
                </span>
                <span className="block font-mono text-[11px] text-neutral-500">
                  {selectedOrderForDetails.customerPhone}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-0.5">العنوان والاستلام:</span>
                <span className="font-bold text-neutral-900">
                  {selectedOrderForDetails.deliveryType === 'delivery'
                    ? 'توصيل للمنزل'
                    : 'استلام من الهايبر'}
                </span>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  {selectedOrderForDetails.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 max-h-56 overflow-y-auto">
              {selectedOrderForDetails.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                    />
                    <div>
                      <p className="font-bold text-neutral-900">{item.productName}</p>
                      <span className="text-[10px] text-neutral-400">
                        {item.quantity} × {item.price} ج.م ({item.unit})
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-neutral-900">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-3 bg-neutral-50 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>المجموع الفرعي:</span>
                <span>{selectedOrderForDetails.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>تكلفة التوصيل:</span>
                <span>
                  {selectedOrderForDetails.deliveryFee === 0
                    ? 'مجاناً'
                    : `${selectedOrderForDetails.deliveryFee} ج.م`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                <span>المبلغ الإجمالي:</span>
                <span className="text-emerald-800 text-base">{selectedOrderForDetails.total} ج.م</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {selectedOrderForDetails.status !== 'cancelled' &&
                selectedOrderForDetails.status !== 'delivered' && (
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب وإعادة الكميات للمخزن؟')) {
                        cancelOrder(selectedOrderForDetails.id);
                        setSelectedOrderForDetails(null);
                      }
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    إلغاء هذا الطلب
                  </button>
                )}

              <button
                onClick={() => window.print()}
                className="mr-auto inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
