import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV_DATA = `اسم المنتج,القسم,الباركود,سعر الشراء,سعر البيع,سعر العرض,الكمية,اسم المورد,الوحدة
سكر أبيض ناعم الأسرة 1 كجم,مواد غذائية,622100999001,25,32,29,50,شركة الدلتا للسكر,كيس 1 كجم
شاي كيني حبيبات الكابوس 200 جم,مشروبات,622100999002,38,48,45,40,شركة شاي الكابوس,علبة 200 جم
جبنة رومي مصري قديم فاخر,ألبان وجبن,622100999003,260,340,,15,مزارع دينا للأجبان,كجم
بسكويت لوتس بالكراميل 150 جم,حلويات,622100999004,35,48,42,60,شركة حلويات بلجيكا,باكيت
منظف أرضيات ديتول بالصنوبر 1 لتر,منظفات,622100999005,65,85,,25,شركة ريكيت بنكيزر,زجاجة 1 لتر`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { bulkAddProducts, categories, suppliers } = useStore();

  const [rawText, setRawText] = useState(SAMPLE_CSV_DATA);
  const [parsedItems, setParsedItems] = useState<Array<Omit<Product, 'id' | 'createdAt' | 'salesCount'>>>([]);
  const [parseError, setParseError] = useState('');
  const [isParsed, setIsParsed] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    try {
      setParseError('');
      const lines = rawText.trim().split('\n');
      if (lines.length <= 1) {
        setParseError('الملف لا يحتوي على بيانات كافية للاستيراد');
        return;
      }

      const defaultCategory = categories[0]?.id || 'cat-1';
      const items: Array<Omit<Product, 'id' | 'createdAt' | 'salesCount'>> = [];

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma
        const cols = line.split(',').map((c) => c.trim());
        if (cols.length < 5) continue;

        const [name, catName, barcode, pPrice, sPrice, dPrice, qty, supplier, unitVal] = cols;

        // Match category by name or use default
        const matchedCat = categories.find((c) => c.name.includes(catName) || catName.includes(c.name));

        items.push({
          name: name || `منتج استيراد #${i}`,
          categoryId: matchedCat ? matchedCat.id : defaultCategory,
          description: `منتج مستورد عبر إكسيل لقسم ${catName || 'عام'}`,
          barcode: barcode || `622${Date.now()}${i}`,
          purchasePrice: parseFloat(pPrice) || 0,
          sellingPrice: parseFloat(sPrice) || 0,
          discountPrice: dPrice ? parseFloat(dPrice) : undefined,
          stockQuantity: parseInt(qty, 10) || 10,
          minStockAlert: 5,
          supplierName: supplier || suppliers[0]?.name || 'مورد عام',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
          unit: unitVal || 'قطعة',
          isActive: true,
        });
      }

      if (items.length === 0) {
        setParseError('لم يتم العثور على أسطر صالحة للاستيراد. تأكد من تنسيق الأعمدة.');
        return;
      }

      setParsedItems(items);
      setIsParsed(true);
    } catch {
      setParseError('حدث خطأ أثناء معالجة البيانات، تأكد من صحة التنسيق.');
    }
  };

  const handleImport = () => {
    if (parsedItems.length === 0) return;
    const count = bulkAddProducts(parsedItems);
    alert(`تم استيراد ${count} منتج بنجاح وإضافتها للمخزن والهايبر ماركت!`);
    onClose();
  };

  const handleDownloadSample = () => {
    const blob = new Blob([`\uFEFF${SAMPLE_CSV_DATA}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'نموذج_استيراد_منتجات_الفارس_هايبر.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setIsParsed(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900">استيراد منتجات مجمّعة (Excel / CSV)</h3>
              <p className="text-xs text-neutral-500">إضافة مئات المنتجات دفعة واحدة إلى المخزن والكتالوج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Instructions & Template Download */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-emerald-950">تنسيق الأعمدة المطلوبة بالترتيب:</p>
              <p className="text-emerald-800 text-[11px] mt-0.5 font-mono">
                اسم المنتج, القسم, الباركود, سعر الشراء, سعر البيع, سعر العرض, الكمية, المورد, الوحدة
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-xl font-bold shadow-2xs hover:bg-emerald-100 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النموذج التجريبي (CSV)</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-neutral-50/60">
            <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-800 mb-1">
              اسحب وأفلت ملف CSV أو Excel هنا، أو اضغط للاختيار من جهازك
            </p>
            <p className="text-[11px] text-neutral-400 mb-4">يدعم ملفات .csv المرمزة بـ UTF-8</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors">
              <span>اختر ملف من جهازك</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Raw Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-neutral-700">محتوى ملف البيانات (أو الصق مباشرة):</label>
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_CSV_DATA);
                  setIsParsed(false);
                }}
                className="text-[11px] text-emerald-700 font-bold hover:underline"
              >
                استعادة النموذج النموذجي
              </button>
            </div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setIsParsed(false);
              }}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-left focus:bg-white focus:outline-none focus:border-emerald-600"
              dir="ltr"
            />
          </div>

          {/* Parse Button */}
          <div>
            <button
              onClick={handleParse}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>فحص ومعاينة البيانات قبل الاستيراد</span>
            </button>
          </div>

          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {isParsed && (
            <div className="border border-neutral-200 rounded-2xl overflow-hidden animate-in fade-in">
              <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  معاينة المنتجات الجاهزة للاستيراد ({parsedItems.length} منتج):
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  تم الفحص بنجاح
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100 text-[11px]">
                    <tr>
                      <th className="p-2 pr-3">اسم المنتج</th>
                      <th className="p-2">الباركود</th>
                      <th className="p-2">سعر الشراء</th>
                      <th className="p-2">سعر البيع</th>
                      <th className="p-2">الكمية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="p-2 pr-3 font-bold text-neutral-800">{item.name}</td>
                        <td className="p-2 font-mono text-neutral-500">{item.barcode}</td>
                        <td className="p-2 font-bold text-neutral-600">{item.purchasePrice} ج.م</td>
                        <td className="p-2 font-black text-emerald-800">
                          {item.discountPrice ?? item.sellingPrice} ج.م
                        </td>
                        <td className="p-2 font-bold text-neutral-900">{item.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={!isParsed || parsedItems.length === 0}
              onClick={handleImport}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-800/15 transition-all disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد استيراد {parsedItems.length} منتج للمخزن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
