import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CategoryIcon } from '../common/Icons';

export const CategoryList: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  const totalActiveProducts = products.filter((p) => p.isActive).length;

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">أقسام الهايبر ماركت</h3>
          <p className="text-xs text-neutral-500 mt-0.5">تصفح المنتجات حسب الفئات المتخصصة</p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
          >
            عرض جميع المنتجات
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* "All" Category Pill */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
            selectedCategory === null
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/15'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200 shadow-2xs'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>جميع الأقسام</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === null ? 'bg-emerald-700 text-emerald-100' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {totalActiveProducts}
          </span>
        </button>

        {/* Category List */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = products.filter((p) => p.categoryId === cat.id && p.isActive).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/15'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200 shadow-2xs'
              }`}
            >
              <CategoryIcon
                name={cat.iconName}
                className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`}
              />
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
