import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  UserPlus,
  KeyRound,
  Send,
  Timer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Role } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'otp';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, switchUserRole, sendEmailOtp, verifyEmailOtp, setIsAdminAuthOpen } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(defaultMode);

  // Register Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email OTP Fields
  const [otpEmail, setOtpEmail] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [activeGeneratedCode, setActiveGeneratedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim() || !address.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password.trim(),
      address: address.trim(),
    });
    setErrorMsg('');
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      return;
    }

    const success = login(loginIdentifier.trim(), loginPassword.trim() || undefined);
    if (success) {
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('بيانات الدخول غير صحيحة، أو يمكنك الدخول السريع عبر كود البريد أو التسجيل بحساب جديد');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setErrorMsg('يرجى إدخال عنوان بريد إلكتروني صحيح');
      return;
    }

    setErrorMsg('');
    const code = sendEmailOtp(otpEmail);
    setActiveGeneratedCode(code);
    setOtpSent(true);
    setCountdown(60);
    setSuccessMsg(`تم إرسال كود التحقق بنجاح إلى ${otpEmail.trim()}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('يرجى إدخال كود التحقق المكون من 6 أرقام');
      return;
    }

    const verified = verifyEmailOtp(otpEmail, otpCode, otpName);
    if (verified) {
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('كود التحقق غير صحيح، يرجى التأكد من الكود أو إعادة إرساله');
    }
  };

  const handleOpenAdminLogin = () => {
    onClose();
    setIsAdminAuthOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/90">
          <div className="flex gap-1.5 bg-neutral-200/60 p-1 rounded-xl">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-white text-emerald-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => {
                setMode('otp');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mode === 'otp' ? 'bg-white text-emerald-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>كود البريد</span>
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register' ? 'bg-white text-emerald-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. EMAIL OTP LOGIN */}
          {mode === 'otp' && (
            <div>
              <div className="mb-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-neutral-900">
                  الدخول السريع بكود التحقق
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  سجل دخولك بدون كلمة سر، نرسل لك كود تحقق فوري على بريدك الإلكتروني
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      بريدك الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      اسمك الكريم (اختياري للعملاء الجدد)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={otpName}
                        onChange={(e) => setOtpName(e.target.value)}
                        placeholder="مثال: أحمد محمد"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-800/15 transition-all"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>إرسال كود التحقق للبريد</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Simulated Mail Dispatch Banner */}
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>رسالة بريدية فورية وصلت إلى بريدك:</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      تم توليد كود التحقق للبريد: <strong>{otpEmail}</strong>
                    </p>
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-300">
                      <span className="text-[11px] font-bold text-neutral-600">كود التحقق الخاص بك هو:</span>
                      <span className="font-mono text-base font-black text-emerald-700 tracking-widest">
                        {activeGeneratedCode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      أدخل كود التحقق المكون من 6 أرقام *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="مثال: 123456"
                        className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <KeyRound className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-800/15 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>تأكيد الكود والدخول للمتجر</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => {
                        const code = sendEmailOtp(otpEmail);
                        setActiveGeneratedCode(code);
                        setCountdown(60);
                        setSuccessMsg('تمت إعادة إرسال كود التحقق الجديد!');
                      }}
                      className="font-bold text-emerald-700 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      إعادة إرسال الكود {countdown > 0 && `(${countdown} ثانية)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:underline text-neutral-600"
                    >
                      تغيير البريد
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. EMAIL & PASSWORD LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  البريد الإلكتروني أو رقم الهاتف *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="مثال: name@example.com أو 010XXXXXXXX"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-800/15 transition-all"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>تسجيل الدخول</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('otp')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  نسيت كلمة المرور؟ ادخل عبر كود التحقق على البريد
                </button>
              </div>
            </form>
          )}

          {/* 3. NEW ACCOUNT REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">الاسم بالكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكريم"
                    className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">البريد الإلكتروني *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رقم الهاتف *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">العنوان بالتفصيل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="المدينة، الحي، الشارع للتوصيل"
                    className="w-full pl-3.5 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <MapPin className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-800/15 transition-all mt-3"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>إنشاء الحساب والبدء بالتسوق</span>
              </button>
            </form>
          )}

          {/* Admin Login Shortcut Banner */}
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleOpenAdminLogin}
              className="w-full p-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>هل أنت أدمن أو مدير الهايبر؟</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-300">
                <span>دخول الإدارة</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
