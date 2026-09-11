import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart, clearCart, cartTotal } =
    useStore();

  if (!isCartOpen) return null;

  const FREE_DELIVERY_THRESHOLD = 300;
  const isFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal);
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : 15;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-neutral-900 text-base">سلة التسوق</h3>
                <p className="text-xs text-neutral-500">{cart.length} أصناف في السلة</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold px-2 py-1 rounded-md hover:bg-rose-50"
                  title="إفراغ السلة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إفراغ</span>
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="bg-emerald-50/80 p-3.5 border-b border-emerald-100 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  {isFreeDelivery
                    ? 'مبروك! لقد حصلت على توصيل مجاني 🚚'
                    : `أضف بـ ${remainingForFree} ج.م إضافية للشحن المجاني!`}
                </span>
                <span>{FREE_DELIVERY_THRESHOLD} ج.م</span>
              </div>
              <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (cartTotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-neutral-800 text-base mb-1">سلتك فارغة حالياً</h4>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  استكشف عروض الفارس هايبر ماركت المميزة وأضف منتجاتك المفضلة لتصلك حتى باب البيت
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.sellingPrice;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.product.id} className="py-3.5 flex gap-3.5 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-800 text-xs truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {item.product.unit} | {itemPrice} ج.م
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-white text-neutral-700 hover:bg-neutral-200 flex items-center justify-center shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-black text-xs text-emerald-800 mr-auto">
                          {itemTotal} ج.م
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-md"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>المجموع الفرعي للطلب:</span>
                  <span className="font-bold">{cartTotal} ج.م</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>رسوم التوصيل:</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-black">مجاناً</span>
                    ) : (
                      `${deliveryFee} ج.م`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-emerald-800 text-base">{grandTotal} ج.م</span>
                </div>
              </div>

              <button
                id="btn-proceed-checkout"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-800/20 transition-all active:scale-[0.99]"
              >
                <span>متابعة الشراء وإتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
