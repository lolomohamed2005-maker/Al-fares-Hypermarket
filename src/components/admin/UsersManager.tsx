import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Lock,
  CheckCircle2,
  XCircle,
  KeyRound,
  Edit2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Role, User } from '../../types';

export const UsersManager: React.FC = () => {
  const { employees, addEmployee, switchUserRole, currentUser } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('cashier');
  const [password, setPassword] = useState('123456');

  const ROLE_DEFINITIONS: {
    role: Role;
    title: string;
    badge: string;
    description: string;
    permissions: string[];
  }[] = [
    {
      role: 'owner',
      title: 'المالك (Owner)',
      badge: 'bg-neutral-900 text-amber-300',
      description: 'كافة الصلاحيات المطلقة لإدارة وتشغيل الهايبر ماركت بالكامل.',
      permissions: [
        'رؤية كافة التقارير المالية وصافي الأرباح',
        'إدارة المصروفات وسلف وعهد الموظفين',
        'إدارة كتالوج المنتجات والمخزون والباركود',
        'إدارة المستخدمين والصلاحيات وحسابات الموردين',
      ],
    },
    {
      role: 'manager',
      title: 'المدير العام (Manager)',
      badge: 'bg-emerald-800 text-white',
      description: 'إدارة العمليات اليومية للمنتجات والطلبات والعمالة والموردين.',
      permissions: [
        'إضافة وتعديل وحذف المنتجات واستيراد Excel',
        'إدارة المخزون وحركات الجرد وتنبيهات النواقص',
        'متابعة وتحديث مسار طلبات العملاء وتوصيلها',
        'عرض تقارير المبيعات والأصناف الأكثر طلباً',
      ],
    },
    {
      role: 'cashier',
      title: 'الكاشير (Cashier)',
      badge: 'bg-amber-600 text-white',
      description: 'مخصص لنقطة البيع POS وتسجيل فواتير العملاء السريعة.',
      permissions: [
        'استخدام ماسح الباركود السريع ونظام POS',
        'إصدار وطباعة فواتير البيع بالصالة',
        'محجوب عنه الأرباح والمصروفات والتقارير الحساسة',
      ],
    },
    {
      role: 'employee',
      title: 'موظف مخزن / تجهيز (Employee)',
      badge: 'bg-blue-600 text-white',
      description: 'فحص المخزون الفعلي، تجهيز طلبيات التوصيل، ورص البضائع.',
      permissions: [
        'عرض رصيد المخزن ومساعدة الكاشير',
        'متابعة تجهيز الطلبيات للتوصيل',
        'صلاحيات محددة بدون صلاحيات مالية',
      ],
    },
  ];

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addEmployee({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role,
      password,
      address: 'فرع الهايبر الرئيسي',
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setRole('cashier');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">
            إدارة المستخدمين وصلاحيات الأدوار (RBAC)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            التحكم في وصول المالك، المديرين، الكاشير، وموظفي المخزن لحماية البيانات
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف / مستخدم جديد</span>
        </button>
      </div>

      {/* Role Matrix Cards (Requested specifically in prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_DEFINITIONS.map((rDef) => {
          const count = employees.filter((e) => e.role === rDef.role).length;
          const isCurrentActive = currentUser?.role === rDef.role;

          return (
            <div
              key={rDef.role}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-neutral-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${rDef.badge}`}>
                    {rDef.title}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-bold">{count} مستخدم</span>
                </div>

                <p className="text-xs text-neutral-600 mt-2 mb-3 leading-relaxed">
                  {rDef.description}
                </p>

                <div className="space-y-1.5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-600">
                  {rDef.permissions.map((perm, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-neutral-100">
                <button
                  onClick={() => switchUserRole(rDef.role)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    isCurrentActive
                      ? 'bg-emerald-700 text-white font-black'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  {isCurrentActive ? '✓ الصلاحية النشطة حالياً' : `التبديل إلى دور ${rDef.title.split(' ')[0]}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users & Staff Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800">
            فريق العمل والموظفين المسجلين بالنظام ({employees.length} حساب)
          </span>
          <span className="text-neutral-500 font-medium">
            يتم تسجيل نشاط كل موظف في فواتير المبيعات وسجل المخزون
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 pr-5">اسم الموظف</th>
                <th className="py-3.5">الدور والصلاحية</th>
                <th className="py-3.5">رقم الهاتف</th>
                <th className="py-3.5">البريد الإلكتروني</th>
                <th className="py-3.5">تاريخ الانضمام</th>
                <th className="py-3.5 pl-5 text-center">التبديل السريع للحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-neutral-50">
                  <td className="py-3 pr-5 font-bold text-neutral-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <span>{emp.name}</span>
                  </td>

                  <td className="py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        emp.role === 'owner'
                          ? 'bg-neutral-900 text-amber-300'
                          : emp.role === 'manager'
                          ? 'bg-emerald-800 text-white'
                          : emp.role === 'cashier'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {emp.role === 'owner'
                        ? 'المالك'
                        : emp.role === 'manager'
                        ? 'مدير عام'
                        : emp.role === 'cashier'
                        ? 'كاشير'
                        : 'موظف مخزن'}
                    </span>
                  </td>

                  <td className="py-3 font-mono text-neutral-600">{emp.phone}</td>
                  <td className="py-3 text-neutral-500">{emp.email || '—'}</td>
                  <td className="py-3 text-[11px] text-neutral-400 font-mono">
                    {emp.createdAt.split('T')[0]}
                  </td>

                  <td className="py-3 pl-5 text-center">
                    <button
                      onClick={() => switchUserRole(emp.role)}
                      className="px-3 py-1 bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 font-bold rounded-lg border border-neutral-200 transition-colors"
                    >
                      تجربة صلاحيته
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-neutral-900 text-base">إضافة مستخدم جديد لطاقم العمل</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: حسام إبراهيم"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">الدور والصلاحية *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold"
                >
                  <option value="owner">المالك (Owner) - كافة الصلاحيات</option>
                  <option value="manager">المدير (Manager) - المنتجات والمخزون والطلبات</option>
                  <option value="cashier">الكاشير (Cashier) - تسجيل المبيعات فقط POS</option>
                  <option value="employee">موظف مخزن (Employee) - حركة البضائع</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alfares.com"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">كلمة المرور المؤقتة *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                />
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
                  إنشاء حساب الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
