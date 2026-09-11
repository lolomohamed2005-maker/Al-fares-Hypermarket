import React, { useState } from 'react';
import {
  X,
  Lock,
  Phone,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { adminLogin } = useStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف أو البريد وكلمة المرور السرية');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const success = await adminLogin(phone, password);
      if (success) {
        setErrorMsg('');
        setPassword('');
        onClose();
      } else {
        setErrorMsg('بيانات الدخول غير صحيحة. يرجى التحقق من البيانات المدخلة وكلمة المرور.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dark Green Theme */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                منطقة سرية ومحمية
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                تسجيل دخول الإدارة (أدمن)
              </h3>
            </div>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            أدخلي رقم الهاتف وكلمة المرور الخاصة بك للوصول إلى لوحة تحكم المتجر وإدارة المنتجات
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                رقم هاتف الأدمن *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="أدخلي رقم الهاتف المسجل"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors font-mono"
                  autoFocus
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                كلمة المرور السرية *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار ما تكتبه'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من الحساب...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>دخول لوحة الإدارة</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              منطقة دخول سرية ومحمية
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-800"
            >
              العودة للمتجر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
