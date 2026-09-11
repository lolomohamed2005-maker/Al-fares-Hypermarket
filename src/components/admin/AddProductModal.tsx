import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Save,
  Barcode,
  Calendar,
  DollarSign,
  Package,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  Link2,
  Loader2,
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { uploadProductImage } from '../../lib/supabase';

const PRESET_PRODUCT_IMAGES = [
  { label: 'ألبان وأجبان', icon: '🧀', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80' },
  { label: 'بقالة وزيوت', icon: '🥫', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
  { label: 'خضار وفواكه', icon: '🍎', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
  { label: 'مخبوزات وعيش', icon: '🥖', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { label: 'لحوم ودواجن', icon: '🥩', url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80' },
  { label: 'منظفات وعناية', icon: '🧴', url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80' },
  { label: 'شيبسي ومسليات', icon: '🍫', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80' },
  { label: 'عصائر ومشروبات', icon: '🧃', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80' },
];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  initialProduct?: Product | null;
  initialBarcode?: string;
  prefilledBarcode?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  initialProduct,
  initialBarcode,
  prefilledBarcode,
}) => {
  const { addProduct, updateProduct, categories, suppliers } = useStore();

  const activeProduct = productToEdit || initialProduct;
  const barcodeValue = initialBarcode || prefilledBarcode;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [supplierName, setSupplierName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState('');
  const [unit, setUnit] = useState('قطعة');
  const [isActive, setIsActive] = useState(true);

  // Gallery file upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill on edit or barcode
  useEffect(() => {
    if (activeProduct) {
      setName(activeProduct.name);
      setCategoryId(activeProduct.categoryId);
      setDescription(activeProduct.description);
      setBarcode(activeProduct.barcode);
      setPurchasePrice(activeProduct.purchasePrice);
      setSellingPrice(activeProduct.sellingPrice);
      setDiscountPrice(activeProduct.discountPrice ? String(activeProduct.discountPrice) : '');
      setStockQuantity(activeProduct.stockQuantity);
      setMinStockAlert(activeProduct.minStockAlert);
      setSupplierName(activeProduct.supplierName);
      setExpiryDate(activeProduct.expiryDate || '');
      setImage(activeProduct.image);
      setUnit(activeProduct.unit);
      setIsActive(activeProduct.isActive);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setBarcode(barcodeValue || `${Math.floor(6220000000000 + Math.random() * 999999999)}`);
      setPurchasePrice(20);
      setSellingPrice(28);
      setDiscountPrice('');
      setStockQuantity(25);
      setMinStockAlert(5);
      setSupplierName(suppliers[0]?.name || 'المورد المحلي');
      setExpiryDate('');
      setImage('');
      setUploadError('');
      setShowUrlInput(false);
      setUnit('قطعة');
      setIsActive(true);
    }
  }, [productToEdit, initialBarcode, categories, suppliers, isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح (JPG أو PNG أو WebP)');
      return;
    }
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using HTML5 canvas to keep app fast and localStorage lean
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 750;
        const MAX_HEIGHT = 750;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImage(compressed);
        } else {
          setImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset so choosing same file works again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('يرجى كتابة اسم المنتج');
      return;
    }
    if (!barcode.trim()) {
      alert('يرجى تحديد الباركود');
      return;
    }
    if (sellingPrice <= 0) {
      alert('سعر البيع يجب أن يكون أكبر من الصفر');
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = image.trim();

      // If image is a base64 string, upload it to Supabase Storage
      if (finalImageUrl.startsWith('data:image/')) {
        finalImageUrl = await uploadProductImage(finalImageUrl, barcode.trim() || 'item');
      }

      const payload = {
        name: name.trim(),
        categoryId: categoryId || categories[0]?.id || 'cat-1',
        description: description.trim(),
        barcode: barcode.trim(),
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stockQuantity: Number(stockQuantity) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        supplierName: supplierName.trim() || 'عام',
        expiryDate: expiryDate || undefined,
        image: finalImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        unit: unit.trim() || 'قطعة',
        isActive,
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
      } else {
        await addProduct(payload);
      }

      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('حدث خطأ أثناء حفظ المنتج، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomBarcode = () => {
    setBarcode(`622${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900">
                {productToEdit ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمخزن والمتجر'}
              </h3>
              <p className="text-xs text-neutral-500">
                يتم مزامنة المنتج فوراً مع واجهة العملاء ونظام الجرد والباركود
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">اسم المنتج بالكامل *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أرز مصري الضحى 5 كجم"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-bold text-neutral-900"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">القسم التابع له *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">وحدة البيع (كجم، لتر، علبة...) *</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="مثال: كيس 5 كجم أو علبة"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Barcode with generator button */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">الباركود الدولي (EAN/UPC) *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="622XXXXXXXXXX"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono font-bold"
                />
                <Barcode className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={generateRandomBarcode}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl border border-neutral-200 whitespace-nowrap"
              >
                توليد باركود تلقائي
              </button>
            </div>
          </div>

          {/* Pricing: Purchase Price, Selling Price, Discount Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">سعر الشراء (التكلفة) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold font-mono focus:border-emerald-600"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">ج.م</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">سعر البيع للجمهور *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold font-mono focus:border-emerald-600 text-emerald-800"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">ج.م</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">سعر العرض/الخصم (إن وجد)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="بدون عرض"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold font-mono focus:border-amber-600 text-amber-800"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">ج.م</span>
              </div>
            </div>
          </div>

          {/* Stock Quantities & Low Stock Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">الكمية الموجودة في المخزون *</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">الحد الأدنى لتنبيه النواقص *</label>
              <input
                type="number"
                min="1"
                required
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Supplier Name & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">اسم المورد</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="مثال: شركة جهينة للأغذية"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">تاريخ انتهاء الصلاحية</label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                />
                <Calendar className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Product Image Section (Gallery / Camera / Presets / URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-800">
                صورة المنتج (من المعرض أو الكاميرا) *
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                {showUrlInput ? 'إخفاء خيار الرابط' : 'أو إدخال رابط صورة خارجي'}
              </button>
            </div>

            {/* Hidden File Inputs for Gallery / Local Files and Mobile Camera */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Selected Image Preview State */}
            {image ? (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={image}
                    alt="معاينة صورة المنتج"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-sm bg-white"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white text-[11px] font-bold bg-emerald-600 px-2.5 py-1 rounded-lg shadow-sm hover:bg-emerald-500"
                    >
                      تغيير
                    </button>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-right space-y-1.5 w-full">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم اختيار الصورة بنجاح من المعرض</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    تم تحسين أبعاد الصورة وحجمها تلقائياً لتظهر بأعلى جودة وسرعة فائقة للعملاء.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-800 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تغيير الصورة من المعرض</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-800 text-xs font-bold rounded-xl transition-colors shadow-2xs sm:hidden cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>التقاط بالكاميرا</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* No Image Selected: Friendly Drag & Drop / Click Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                    : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50/80 hover:bg-emerald-50/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-2xs">
                  <ImageIcon className="w-6 h-6" />
                </div>

                <div className="space-y-1 mb-3.5">
                  <p className="text-xs sm:text-sm font-black text-neutral-800">
                    اضغط هنا لاختيار صورة المنتج من المعرض (الألبوم) أو جهازك
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    يدعم صور JPG, PNG, WEBP (يتم الضغط والتحسين التلقائي)
                  </p>
                </div>

                <div
                  className="flex flex-wrap items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>فتح المعرض / ملفات الصور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 text-neutral-700 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>تصوير بالكاميرا</span>
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-600 font-medium">{uploadError}</p>
            )}

            {/* Quick Presets by Department */}
            <div className="pt-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>أو اختر صورة فورية جاهزة من الأقسام:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PRODUCT_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-neutral-100 hover:bg-emerald-100 hover:text-emerald-900 text-neutral-700 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional URL Input if toggled */}
            {showUrlInput && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  أو لصق رابط صورة جاهز (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono text-left"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="px-2.5 text-xs text-neutral-500 hover:text-red-600 cursor-pointer"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">وصف المنتج ومميزاته</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمنتج يظهر للعملاء في المتجر..."
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Active in store toggle (إيقاف ظهور منتج من المتجر مؤقتاً إذا لم يعد متوفراً) */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">حالة العرض في متجر العملاء:</span>
              <span className="text-[11px] text-neutral-500">
                {isActive ? 'المنتج ظاهر ومتاح للشراء أونلاين' : 'تم إخفاء المنتج مؤقتاً من المتجر'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-800/15 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري رفع الصورة والحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{productToEdit ? 'حفظ التعديلات' : 'إضافة المنتج للمخزن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
