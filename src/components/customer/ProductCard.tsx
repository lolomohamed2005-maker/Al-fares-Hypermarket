import React from 'react';
import { Plus, Minus, ShoppingCart, AlertCircle, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { cart, addToCart, updateCartQuantity, categories } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  const category = categories.find((c) => c.id === product.categoryId);

  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.sellingPrice - (product.discountPrice || 0)) / product.sellingPrice) * 100)
    : 0;

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200/80 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Media Area */}
      <div className="relative pt-[85%] overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => onOpenDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-amber-500 text-emerald-950 text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            خصم {discountPercent}%
          </span>
        )}

        {/* Out of stock overlay badge */}
        {isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-neutral-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            نفد من المخزون
          </span>
        )}

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="معاينة التفاصيل"
        >
          <Eye className="w-4 h-4 text-neutral-700" />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Unit */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {category?.name || 'عام'}
            </span>
            <span className="text-neutral-500 font-medium">{product.unit}</span>
          </div>

          {/* Product Title */}
          <h4
            onClick={() => onOpenDetails(product)}
            className="font-bold text-neutral-800 text-sm leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Low Stock Warning */}
          {product.stockQuantity > 0 && product.stockQuantity <= product.minStockAlert && (
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              متبقي {product.stockQuantity} قطع فقط!
            </p>
          )}
        </div>

        {/* Price & Action Area */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-800">
                {product.discountPrice ?? product.sellingPrice}
              </span>
              <span className="text-xs font-bold text-neutral-500">ج.م</span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through mr-1 font-medium">
                  {product.sellingPrice} ج.م
                </span>
              )}
            </div>
          </div>

          {/* Add / Quantity Controller */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-bold cursor-not-allowed text-center"
            >
              غير متوفر حالياً
            </button>
          ) : currentQuantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1">
              <button
                onClick={() => updateCartQuantity(product.id, currentQuantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-white text-emerald-900 hover:bg-emerald-100 flex items-center justify-center font-bold transition-colors shadow-2xs"
                title="تقليل الكمية"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="font-black text-sm text-emerald-900 px-2">
                {currentQuantityInCart}
              </span>

              <button
                onClick={() => addToCart(product, 1)}
                className="w-7 h-7 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold transition-colors shadow-2xs"
                title="زيادة الكمية"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>أضف للسلة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
