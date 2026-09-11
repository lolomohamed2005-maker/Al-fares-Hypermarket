import React, { useState } from 'react';
import {
  Plus,
  FileSpreadsheet,
  ScanBarcode,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Barcode,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { AddProductModal } from './AddProductModal';
import { BulkImportModal } from './BulkImportModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const ProductsManager: React.FC = () => {
  const { products, categories, deleteProduct, toggleProductStatus, updateProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newBarcodePrefill, setNewBarcodePrefill] = useState('');

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0) ||
      (stockFilter === 'out' && p.stockQuantity <= 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setNewBarcodePrefill('');
    setIsAddModalOpen(true);
  };

  const handleAddNewWithBarcode = (code: string) => {
    setEditingProduct(null);
    setNewBarcodePrefill(code);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${name}"؟ لن يمكن التراجع.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and 3 Add Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">إدارة كتالوج المنتجات</h2>
          <p className="text-xs text-neutral-500 mt-1">
            إجمالي المنتجات المسجلة: {products.length} صنف عبر {categories.length} أقسام
          </p>
        </div>

        {/* 3 Add Product Methods Requested */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Method 1: Manual Add */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج يدوي</span>
          </button>

          {/* Method 2: Bulk Import (Excel / CSV) */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>استيراد Excel / CSV</span>
          </button>

          {/* Method 3: Barcode Scanner */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-xl text-xs font-black transition-all shadow-xs"
          >
            <ScanBarcode className="w-4 h-4 text-emerald-950" />
            <span>مسح بالباركود</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الباركود، أو المورد..."
            className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">جميع الأقسام ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock state filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">حالة المخزون (الكل)</option>
            <option value="low">قاربت على النفاد</option>
            <option value="out">نفدت بالكامل (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">المنتج والوصف</th>
                <th className="py-3.5">القسم والباركود</th>
                <th className="py-3.5">سعر التكلفة</th>
                <th className="py-3.5">سعر البيع / العرض</th>
                <th className="py-3.5">الكمية بالمخزن</th>
                <th className="py-3.5">المورد</th>
                <th className="py-3.5 text-center">ظهور بالمتجر</th>
                <th className="py-3.5 pl-5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Plus className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-black text-neutral-900">
                        قائمة المنتجات فارغة (جاهزة لإضافة بضاعتك)
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        تم تصفير وتفريغ كافة البيانات الوهمية بنجاح للبدء من الصفر. اضغط على الزر أدناه لإدخال أول صنف وسعره الحقيقي وصورته.
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs shadow-xs inline-flex items-center gap-2 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة أول منتج للمتجر الآن</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    لم يتم العثور على منتجات مطابقة لخيارات البحث
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  const isLow = product.stockQuantity <= product.minStockAlert && product.stockQuantity > 0;
                  const isOut = product.stockQuantity <= 0;
                  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 pr-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 text-xs truncate max-w-xs">
                              {product.name}
                            </p>
                            <span className="text-[11px] text-neutral-400 font-medium">
                              الوحدة: {product.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Barcode */}
                      <td className="py-3">
                        <span className="inline-block bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1">
                          {category?.name || 'عام'}
                        </span>
                        <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{product.barcode}</span>
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 font-semibold text-neutral-600">
                        {product.purchasePrice} ج.م
                      </td>

                      {/* Selling / Discount Price */}
                      <td className="py-3">
                        <div className="font-black text-emerald-800 text-sm">
                          {product.discountPrice ?? product.sellingPrice} ج.م
                        </div>
                        {hasDiscount && (
                          <div className="text-[10px] text-neutral-400 line-through">
                            {product.sellingPrice} ج.م
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-amber-700 font-bold" title="قارب على النفاد">
                              ⚠️ منخفض
                            </span>
                          )}
                          {isOut && (
                            <span className="text-[10px] text-rose-700 font-bold" title="نفد من المخزن">
                              ❌ نفد
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 text-[11px] text-neutral-600">
                        {product.supplierName || '—'}
                      </td>

                      {/* Active Toggle (إيقاف ظهور منتج من المتجر مؤقتاً) */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                          }`}
                          title={product.isActive ? 'ظاهر للعملاء - اضغط للإخفاء' : 'مخفي - اضغط للظهور'}
                        >
                          {product.isActive ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>ظاهر</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-500" />
                              <span>مخفي</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        productToEdit={editingProduct}
        initialBarcode={newBarcodePrefill}
      />

      <BulkImportModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />

      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onAddNewWithBarcode={handleAddNewWithBarcode}
      />
    </div>
  );
};
