import React, { useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Branch } from '../../types';

export const BranchesManager: React.FC = () => {
  const { branches, addBranch, updateBranch, deleteBranch } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isMain, setIsMain] = useState(false);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setName('');
    setAddress('');
    setPhone('');
    setIsActive(true);
    setIsMain(false);
    setShowModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setPhone(branch.phone);
    setIsActive(branch.isActive);
    setIsMain(branch.isMain || false);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) return;

    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        isActive,
        isMain,
      });
    } else {
      addBranch({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        isActive,
        isMain,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, branchName: string) => {
    if (confirm(`هل أنت متأكد من حذف فرع "${branchName}"؟`)) {
      deleteBranch(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">إدارة فروع الفارس هايبر ماركت</h2>
          <p className="text-xs text-neutral-500 mt-1">
            إدارة شبكة الفروع ونقاط الاستلام وأرقام خدمة التوصيل المباشر
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع جديد</span>
        </button>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className={`bg-white p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
              b.isActive ? 'border-neutral-200/90 shadow-xs' : 'border-neutral-200 opacity-60 bg-neutral-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-neutral-900 flex items-center gap-2">
                      <span>{b.name}</span>
                      {b.isMain && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-300">
                          الفرع الرئيسي
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      {b.isActive ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> متاح ويستقبل الطلبات
                        </span>
                      ) : (
                        <span className="text-neutral-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> مغلق مؤقتاً
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs text-neutral-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold" dir="ltr">{b.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-100">
              <button
                onClick={() => handleOpenEdit(b)}
                className="p-2 rounded-xl text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="تعديل بيانات الفرع"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(b.id, b.name)}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="حذف الفرع"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">
                {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع هايبر ماركت جديد'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فرع كفرالشيخ الرئيسي، أو فرع الرياض"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">عنوان الفرع بالتفصيل *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: كفرالشيخ - أمام بورصة الأسماك"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رقم هاتف الفرع للتواصل *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01010574689"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>فرع مفعّل ويستقبل طلبات</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>الفرع الرئيسي</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                >
                  {editingBranch ? 'تحديث الفرع' : 'حفظ الفرع الجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
