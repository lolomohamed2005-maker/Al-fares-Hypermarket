import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Package, Check, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DynamicIcon } from '../common/Icons';

export const CategoriesManager: React.FC = () => {
  const { categories, products } = useStore();

  const [categoriesList, setCategoriesList] = useState(categories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBasket');

  const ICON_OPTIONS = [
    'ShoppingBasket',
    'Apple',
    'Milk',
    'Wheat',
    'Beef',
    'Sparkles',
    'Coffee',
    'CupSoda',
    'Fish',
    'Candy',
    'Package',
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon,
    };

    setCategoriesList([...categoriesList, newCat]);
    setShowAddModal(false);
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">أقسام الهايبر ماركت</h2>
          <p className="text-xs text-neutral-500 mt-1">
            تصنيف المنتجات يسهل على العملاء التسوق السريع في المتجر وتوزيع الأصناف بالمخازن
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoriesList.map((cat) => {
          const catProductsCount = products.filter((p) => p.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DynamicIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-neutral-900">{cat.name}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{catProductsCount} منتج مرتبط</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">إضافة قسم هايبر ماركت جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">اسم القسم *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثال: مجمدات ومثلجات، أو توابل وعطارة"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">اختر أيقونة معبرة</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCatIcon(iconName)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        newCatIcon === iconName
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <DynamicIcon name={iconName} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
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
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
