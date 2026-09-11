import React, { useState } from 'react';
import { X, ShoppingCart, Barcode, Calendar, ShieldCheck, Truck, Plus, Minus, Tag } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, categories } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);
  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-900 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative bg-neutral-100 min-h-[280px] md:min-h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 right-4 bg-amber-500 text-emerald-950 font-black text-xs px-3 py-1 rounded-lg shadow-sm">
                عرض خاص
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Unit */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {category?.name || 'قسم عام'}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {product.unit}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-neutral-900 leading-snug mb-3">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-emerald-800">
                  {product.discountPrice ?? product.sellingPrice}
                </span>
                <span className="text-sm font-bold text-neutral-500">جنيه مصري</span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through mr-2 font-medium">
                    {product.sellingPrice} ج.م
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                {product.description || 'منتج طازج ومضمون من الفارس هايبر ماركت.'}
              </p>

              {/* Metadata Badges */}
              <div className="space-y-2 border-t border-neutral-100 pt-4 mb-6 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-neutral-400" />
                  <span className="font-semibold text-neutral-500">الباركود الدولي:</span>
                  <span className="font-mono text-neutral-800 font-bold">{product.barcode}</span>
                </div>

                {product.supplierName && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-500">المورد:</span>
                    <span className="text-neutral-800">{product.supplierName}</span>
                  </div>
                )}

                {product.expiryDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-500">تاريخ الصلاحية:</span>
                    <span className="text-neutral-800">{product.expiryDate}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">متاح للتوصيل السريع خلال 45 دقيقة</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              {isOutOfStock ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold text-center">
                  هذا المنتج غير متوفر بالمخزون حالياً
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700">حدد الكمية:</span>
                    <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-white text-neutral-700 hover:bg-neutral-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-black text-sm text-neutral-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="w-8 h-8 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-800/20 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>أضف {quantity} للسلة ({(product.discountPrice ?? product.sellingPrice) * quantity} ج.م)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
