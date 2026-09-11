import React, { useState } from 'react';
import {
  X,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  ReceiptText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';

interface OrdersTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STEPS: { status: OrderStatus; title: string; desc: string }[] = [
  { status: 'received', title: 'تم استلام الطلب', desc: 'تم تسجيل طلبك بنجاح في نظام الهايبر' },
  { status: 'preparing', title: 'جاري تجهيز الطلب', desc: 'فريق التعبئة يجمع ويفرز منتجاتك الطازجة' },
  { status: 'ready_for_delivery', title: 'جاهز للتوصيل', desc: 'تم تغليف الطلب بالكامل ومطابقة الفاتورة' },
  { status: 'out_for_delivery', title: 'خرج للتوصيل', desc: 'مندوب التوصيل في طريقه إليك الآن' },
  { status: 'delivered', title: 'تم التسليم', desc: 'تم تسليم الطلب للعميل بنجاح' },
];

export const OrdersTrackingModal: React.FC<OrdersTrackingModalProps> = ({ isOpen, onClose }) => {
  const { orders, trackedOrderId, setTrackedOrderId, cancelOrder, currentUser } = useStore();
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  // Filter orders: by tracked id, by current logged-in user, or by search input
  const relevantOrders = orders.filter((o) => {
    if (searchFilter.trim()) {
      return (
        o.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        o.customerPhone.includes(searchFilter) ||
        o.customerName.includes(searchFilter)
      );
    }
    if (trackedOrderId) {
      return o.id === trackedOrderId;
    }
    if (currentUser?.phone) {
      return o.customerPhone === currentUser.phone || o.customerId === currentUser.id;
    }
    return true;
  });

  const selectedOrder = trackedOrderId
    ? orders.find((o) => o.id === trackedOrderId) || relevantOrders[0]
    : relevantOrders[0];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900">متابعة حالة الطلبات</h3>
              <p className="text-xs text-neutral-500">تتبع مسار طلبك لحظة بلحظة من التجهيز حتى باب المنزل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search bar for order lookup */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setTrackedOrderId(null);
              }}
              placeholder="ابحث برقم الطلب (مثال: ORD-1001) أو رقم الهاتف..."
              className="w-full pl-4 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* If there are multiple orders, show order selector pills */}
          {relevantOrders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
              {relevantOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setTrackedOrderId(ord.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    (selectedOrder?.id === ord.id)
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>طلب #{ord.id}</span>
                  <span className="mr-1.5 opacity-70">({ord.total} ج.م)</span>
                </button>
              ))}
            </div>
          )}

          {!selectedOrder ? (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-700">لم يتم العثور على طلبات مطابقة</p>
              <p className="text-xs text-neutral-400 mt-1">تأكد من إدخال رقم الطلب الصحيح أو رقم هاتفك</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-emerald-950">
                      طلب #{selectedOrder.id}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">| {selectedOrder.createdAt}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    العميل: <span className="font-bold text-neutral-800">{selectedOrder.customerName}</span> (
                    {selectedOrder.customerPhone})
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  {selectedOrder.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      تم الإلغاء
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      {ORDER_STEPS.find((s) => s.status === selectedOrder.status)?.title || selectedOrder.status}
                    </span>
                  )}
                </div>
              </div>

              {/* 6-State Visual Progression Tracker */}
              {selectedOrder.status === 'cancelled' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    تم إلغاء هذا الطلب
                  </div>
                  <p>{selectedOrder.notes || 'تم إلغاء الطلب بناء على طلب العميل أو بسبب نفاد الكمية وتم إرجاع الأصناف للمخزون.'}</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="relative">
                    {/* Stepper connecting line */}
                    <div className="hidden sm:block absolute top-5 right-6 left-6 h-1 bg-neutral-200 -z-0">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${(getStepIndex(selectedOrder.status) / (ORDER_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Stepper Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {ORDER_STEPS.map((step, idx) => {
                        const currentIndex = getStepIndex(selectedOrder.status);
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                          <div key={step.status} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-md scale-110'
                                  : isCompleted
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <div>
                              <p
                                className={`text-xs font-black ${
                                  isCurrent
                                    ? 'text-emerald-800'
                                    : isCompleted
                                    ? 'text-neutral-800'
                                    : 'text-neutral-400'
                                }`}
                              >
                                {step.title}
                              </p>
                              <p className="text-[10px] text-neutral-500 hidden sm:block mt-0.5 leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items & Breakdown */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-emerald-600" />
                  <span>تفاصيل المنتجات المطلوبة ({selectedOrder.items.length} أصناف)</span>
                </div>
                <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto p-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-neutral-100"
                        />
                        <div>
                          <p className="font-bold text-neutral-800">{item.productName}</p>
                          <p className="text-[11px] text-neutral-400">
                            الكمية: {item.quantity} × {item.price} ج.م ({item.unit})
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-neutral-900">{item.price * item.quantity} ج.م</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>المجموع الفرعي:</span>
                    <span>{selectedOrder.subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>التوصيل:</span>
                    <span>{selectedOrder.deliveryFee === 0 ? 'مجاناً' : `${selectedOrder.deliveryFee} ج.م`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                    <span>الإجمالي الكلي المدفوع:</span>
                    <span className="text-emerald-800 text-base">{selectedOrder.total} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-500 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    عنوان الاستلام والتوصيل:
                  </span>
                  <p className="text-neutral-800 font-medium">{selectedOrder.deliveryAddress}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-500 block mb-1">طريقة الدفع:</span>
                  <p className="text-neutral-800 font-medium">
                    {selectedOrder.paymentMethod === 'cash_on_delivery'
                      ? 'الدفع عند الاستلام (كاش)'
                      : selectedOrder.paymentMethod === 'card'
                      ? 'بطاقة بنكية / فيزا'
                      : 'المحفظة الإلكترونية'}
                  </p>
                </div>
              </div>

              {/* Cancel Button (if allowed) */}
              {selectedOrder.status === 'received' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) {
                        cancelOrder(selectedOrder.id);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    إلغاء الطلب
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
