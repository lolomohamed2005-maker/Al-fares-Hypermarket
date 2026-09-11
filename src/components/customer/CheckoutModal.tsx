import React, { useState } from 'react';
import { X, Truck, Store, MapPin, Phone, CreditCard, Banknote, Wallet, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { OrderItem } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, createOrder, currentUser } = useStore();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'wallet'>('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const FREE_DELIVERY_THRESHOLD = 300;
  const isFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = deliveryType === 'pickup' ? 0 : isFreeDelivery ? 0 : 15;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }
    if (!customerPhone.trim()) {
      alert('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('يرجى إدخال عنوان التوصيل بالتفصيل');
      return;
    }

    setIsSubmitting(true);

    const items: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.discountPrice ?? item.product.sellingPrice,
      costPrice: item.product.purchasePrice,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
    }));

    setTimeout(() => {
      createOrder({
        customerId: currentUser?.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: currentUser?.email,
        deliveryType,
        deliveryAddress:
          deliveryType === 'delivery'
            ? deliveryAddress.trim()
            : 'استلام من الفرع الرئيسي: كفرالشيخ أمام بورصه الأسماك',
        paymentMethod,
        status: 'received', // 1. تم استلام الطلب
        items,
        subtotal: cartTotal,
        deliveryFee,
        discount: 0,
        total: grandTotal,
        notes: notes.trim() || undefined,
      });

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div>
            <h3 className="text-lg font-black text-neutral-900">إتمام الطلب وتحديد التوصيل</h3>
            <p className="text-xs text-neutral-500 mt-0.5">خطوة واحدة وتصلك مشترياتك طازجة حتى باب البيت</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
          {/* Step 1: Delivery Option */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">طريقة الاستلام:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    deliveryType === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">توصيل للمنزل</div>
                  <div className="text-[11px] text-neutral-500 font-normal">
                    {deliveryFee === 0 ? 'توصيل مجاني' : 'رسوم توصيل 15 ج.م'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    deliveryType === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">استلام من الهايبر</div>
                  <div className="text-[11px] text-neutral-500 font-normal">
                    جاهز خلال 20 دقيقة (كفرالشيخ أمام بورصه الأسماك)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Info Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: أحمد عبد الله"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">رقم الهاتف للتواصل *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">عنوان التوصيل بالتفصيل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="المدينة، الحي، اسم الشارع، رقم العمارة، الدور، رقم الشقة"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <MapPin className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">ملاحظات إضافية للطلب (اختياري)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرجى ترك الطلب عند الأمن أو الرنين مرتين"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">طريقة الدفع:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px]">كاش عند الاستلام</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px]">بطاقة بنكية / فيزا</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px]">محفظة إلكترونية</span>
              </button>
            </div>
          </div>

          {/* Order Totals Summary */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>إجمالي المنتجات ({cart.length} أصناف):</span>
              <span className="font-bold text-neutral-800">{cartTotal} ج.م</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>تكلفة التوصيل:</span>
              <span className="font-bold">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">مجاناً</span> : `${deliveryFee} ج.م`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
              <span>المبلغ الإجمالي المطلوب:</span>
              <span className="text-emerald-800 text-base">{grandTotal} ج.م</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-800/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'جاري تسجيل الطلب...' : `تأكيد الطلب الآن (${grandTotal} ج.م)`}</span>
            </button>
            <p className="text-[11px] text-neutral-400 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              سيتم تأكيد الطلب فوراً وتجهيزه بأعلى معايير النظافة والجودة
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
