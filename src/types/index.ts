export type Role = 'owner' | 'manager' | 'cashier' | 'employee' | 'customer';

export type OrderStatus =
  | 'received'          // 1. تم استلام الطلب
  | 'preparing'         // 2. جاري تجهيز الطلب
  | 'ready_for_delivery'// 3. جاهز للتوصيل
  | 'out_for_delivery'  // 4. خرج للتوصيل
  | 'delivered'         // 5. تم التسليم
  | 'cancelled';        // 6. تم الإلغاء

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address: string;
  role: Role;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  isMain?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  icon?: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  barcode: string;
  purchasePrice: number;    // سعر الشراء
  sellingPrice: number;     // سعر البيع
  discountPrice?: number;   // سعر العرض أو الخصم إن وجد
  stockQuantity: number;    // الكمية الموجودة في المخزون
  minStockAlert: number;    // الحد الأدنى للكمية
  supplierName: string;     // اسم المورد
  expiryDate?: string;      // تاريخ الصلاحية
  image: string;
  unit: string;             // كجم، علبة، لتر، قطعة
  isActive: boolean;        // إظهار أو إخفاء من المتجر
  salesCount: number;       // عدد مرات البيع
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  paymentMethod: 'cash_on_delivery' | 'card' | 'wallet';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'damage';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export type LoanTransactionType = 'borrow' | 'return';

export interface EmployeeLoanTransaction {
  id: string;
  personName: string;
  type: LoanTransactionType;
  amount: number;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface EmployeeLoanSummary {
  personName: string;
  totalBorrowed: number;
  totalReturned: number;
  remainingDebt: number;
  lastActivityDate: string;
}

export interface EmployeeLoan {
  id: string;
  employeeName: string;
  amount: number;
  returnedAmount: number;
  remainingAmount: number;
  reason: string;
  date: string;
  time: string;
  status: 'pending' | 'partial' | 'returned';
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'goods_purchase'
  | 'electricity'
  | 'rent'
  | 'salaries'
  | 'transport'
  | 'maintenance'
  | 'other';

export interface Expense {
  id: string;
  title?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  productsSupplied?: string;
  suppliedProducts?: string[];
  totalDemanded?: number;
  totalOwed?: number;
  amountPaid?: number;
  paidAmount?: number;
  remainingBalance?: number;
  remainingAmount?: number;
  notes?: string;
  createdAt: string;
}
