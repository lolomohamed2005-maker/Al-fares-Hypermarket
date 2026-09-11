import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Store,
  ShieldCheck,
  Lock,
  Phone,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinksModal: React.FC<ShareLinksModalProps> = ({ isOpen, onClose }) => {
  const { adminCredentials, setIsAdminAuthOpen } = useStore();
  const [copiedStore, setCopiedStore] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  if (!isOpen) return null;

  // The permanent, public Cloud Run URL that works for anyone without Google AI Studio permissions
  const PUBLIC_APP_URL = 'https://ais-pre-ejyseuumlzvtev67cbee2v-890445309215.europe-west2.run.app';

  // Derive URLs cleanly - never use aistudio.google.com as the shared url
  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isCloudRun = rawOrigin.includes('.run.app');
  const baseOrigin = isCloudRun ? rawOrigin : PUBLIC_APP_URL;

  // Clean store URL without view=admin parameter
  const storeUrl = baseOrigin;
  // Direct admin URL with query parameter
  const adminUrl = `${baseOrigin}/?view=admin`;

  const copyToClipboard = (text: string, type: 'store' | 'admin') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (type === 'store') {
          setCopiedStore(true);
          setTimeout(() => setCopiedStore(false), 2500);
        } else {
          setCopiedAdmin(true);
          setTimeout(() => setCopiedAdmin(false), 2500);
        }
      });
    } else {
      if (type === 'store') {
        setCopiedStore(true);
        setTimeout(() => setCopiedStore(false), 2500);
      } else {
        setCopiedAdmin(true);
        setTimeout(() => setCopiedAdmin(false), 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">روابط المتجر ولوحة الإدارة</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                الروابط المباشرة لمشاركتها مع العملاء أو لدخول الإدارة وإضافة المنتجات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Important Notice regarding 403 error */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-sky-950">توضيح هام بخصوص الروابط والخطأ 403:</h4>
              <p className="text-sky-800 leading-relaxed">
                الرابط المخصص لفتح المتجر أو مشاركته مع أي شخص هو الرابط الذي ينتهي بـ{' '}
                <strong className="font-mono text-sky-900 font-black">.run.app</strong> الموضح بالأسفل.
                تجنب فتح أو نسخ رابط <span className="font-mono text-neutral-600 font-bold">aistudio.google.com</span> لأنه رابط منصة التطوير الداخلية لجوجل ولا يفتح إلا بحساب المبرمج الداخلي ويعطي خطأ 403.
              </p>
            </div>
          </div>

          {/* 1. Customer Store Link */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-neutral-900">1. رابط متجر العملاء (رابط الشراء)</h4>
                  <p className="text-[11px] text-neutral-500">للجمهور والزبائن للتسوق والتسجيل والشراء</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                عام للجميع
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              شارك هذا الرابط مع عملائك على واتساب أو وسائل التواصل؛ يفتح المتجر مباشرة ويطلب منهم التسجيل بالبريد أو كود التحقق.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-700 select-all"
                dir="ltr"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(storeUrl, 'store')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    copiedStore
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {copiedStore ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-300" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="فتح في تبويب جديد"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>فتح</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('تسوق الآن من هايبر ماركت الفارس: ' + storeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>📲 مشاركة الرابط عبر واتساب مباشرة</span>
              </a>
            </div>
          </div>

          {/* 2. Direct Admin Link */}
          <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-neutral-900">2. رابط لوحة الإدارة (خاص بالأدمن)</h4>
                  <p className="text-[11px] text-amber-800">للمالك والأدمن فقط لإضافة وتعديل المنتجات والأسعار</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                سري ومحمي
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              هذا الرابط يفتح لوحة التحكم مباشرة. سيطلب منك كتابة رقم الهاتف والباسورد الخاص بك قبل الدخول.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-700 select-all"
                dir="ltr"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(adminUrl, 'admin')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    copiedAdmin
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black'
                  }`}
                >
                  {copiedAdmin ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="فتح لوحة الإدارة في تبويب جديد"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                  <span>فتح</span>
                </a>
              </div>
            </div>

            {/* Admin Credentials Info */}
            <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-700">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  رقم الأدمن: <strong className="font-mono text-neutral-900">{adminCredentials.phone}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  الباسورد: <strong className="font-mono text-neutral-900">{adminCredentials.password}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsAdminAuthOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:underline self-start sm:self-auto"
              >
                تغيير البيانات
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
