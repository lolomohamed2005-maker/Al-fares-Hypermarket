import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  Category,
  Branch,
  CartItem,
  Order,
  OrderStatus,
  StockMovement,
  EmployeeLoanTransaction,
  EmployeeLoanSummary,
  Expense,
  Supplier,
  User,
  Role,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_EMPLOYEE_LOANS,
  INITIAL_EXPENSES,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_STOCK_MOVEMENTS,
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-main',
    name: 'الفرع الرئيسي (بورصة الأسماك)',
    address: 'كفرالشيخ أمام بورصة الأسماك',
    phone: '01010574689',
    isActive: true,
    isMain: true,
  },
  {
    id: 'branch-city',
    name: 'فرع وسط المدينة',
    address: 'كفرالشيخ - شارع النبوي المهندس',
    phone: '01055753006',
    isActive: true,
    isMain: false,
  },
];

interface StoreContextType {
  // Navigation & UI
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  trackedOrderId: string | null;
  setTrackedOrderId: (id: string | null) => void;

  // Supabase Connection Status
  isSupabaseConnected: boolean;
  supabaseTableStatus: 'connected' | 'needs_schema' | 'checking' | 'not_configured';
  isLoadingData: boolean;
  syncCatalogToSupabase: () => Promise<{ success: boolean; message: string }>;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number, reason: string, performedBy?: string) => Promise<void>;
  adjustStock: (id: string, newStock: number, reason: string, performedBy?: string) => Promise<void>;
  bulkAddProducts: (newProducts: Array<Omit<Product, 'id' | 'createdAt' | 'salesCount'>>) => Promise<number>;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Branches
  branches: Branch[];
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<Branch>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Stock Movements & Alerts
  stockMovements: StockMovement[];
  inventoryLogs: StockMovement[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  nearExpiryProducts: Product[];

  // Employee Loans
  loanTransactions: EmployeeLoanTransaction[];
  addLoanTransaction: (data: Omit<EmployeeLoanTransaction, 'id' | 'createdAt'>) => void;
  employeeSummaries: EmployeeLoanSummary[];
  totalOutstandingLoans: number;

  // Expenses & Purchases
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  totalExpenses: number;
  totalPurchases: number;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  recordSupplierPayment: (id: string, amount: number, notes?: string) => void;
  deleteSupplier: (id: string) => void;

  // Users & Auth
  users: User[];
  employees: User[];
  currentUser: User | null;
  login: (phoneOrEmail: string, password?: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'role' | 'createdAt'>) => User;
  logout: () => void;
  switchUserRole: (role: Role) => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  addEmployee: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Admin & Clean Slate
  isAdminAuthOpen: boolean;
  setIsAdminAuthOpen: (open: boolean) => void;
  adminCredentials: { phone: string; password: string; name: string };
  updateAdminCredentials: (creds: { phone: string; password: string; name?: string }) => void;
  adminLogin: (phoneOrEmail: string, password: string) => Promise<boolean>;
  clearAllOrders: () => void;
  clearAllProducts: () => void;
  resetToFreshStore: () => void;

  // Email OTP
  lastGeneratedOtp: { email: string; code: string } | null;
  sendEmailOtp: (email: string) => string;
  verifyEmailOtp: (email: string, code: string, name?: string) => boolean;

  // Reset
  resetToDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`alfares_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`alfares_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Helpers to map between Supabase Snake_case and React CamelCase
function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id || '',
    description: row.description || '',
    barcode: row.barcode || '',
    purchasePrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
    stockQuantity: Number(row.stock_quantity) || 0,
    minStockAlert: Number(row.min_stock_alert) || 5,
    supplierName: row.supplier_name || '',
    expiryDate: row.expiry_date || undefined,
    image: row.image || '',
    unit: row.unit || 'قطعة',
    isActive: row.is_active ?? true,
    salesCount: Number(row.sales_count) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapProductToDb(p: Partial<Product>): any {
  const dbObj: any = {};
  if (p.id !== undefined) dbObj.id = p.id;
  if (p.name !== undefined) dbObj.name = p.name;
  if (p.categoryId !== undefined) dbObj.category_id = p.categoryId;
  if (p.description !== undefined) dbObj.description = p.description;
  if (p.barcode !== undefined) dbObj.barcode = p.barcode;
  if (p.purchasePrice !== undefined) dbObj.purchase_price = p.purchasePrice;
  if (p.sellingPrice !== undefined) dbObj.selling_price = p.sellingPrice;
  if (p.discountPrice !== undefined) dbObj.discount_price = p.discountPrice;
  if (p.stockQuantity !== undefined) dbObj.stock_quantity = p.stockQuantity;
  if (p.minStockAlert !== undefined) dbObj.min_stock_alert = p.minStockAlert;
  if (p.supplierName !== undefined) dbObj.supplier_name = p.supplierName;
  if (p.expiryDate !== undefined) dbObj.expiry_date = p.expiryDate;
  if (p.image !== undefined) dbObj.image = p.image;
  if (p.unit !== undefined) dbObj.unit = p.unit;
  if (p.isActive !== undefined) dbObj.is_active = p.isActive;
  if (p.salesCount !== undefined) dbObj.sales_count = p.salesCount;
  return dbObj;
}

function mapDbCategoryToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || 'ShoppingBasket',
    image: row.image,
    description: row.description,
    isActive: row.is_active ?? true,
  };
}

function mapCategoryToDb(c: Partial<Category>): any {
  const dbObj: any = {};
  if (c.id !== undefined) dbObj.id = c.id;
  if (c.name !== undefined) dbObj.name = c.name;
  if (c.icon !== undefined) dbObj.icon = c.icon;
  if (c.image !== undefined) dbObj.image = c.image;
  if (c.description !== undefined) dbObj.description = c.description;
  if (c.isActive !== undefined) dbObj.is_active = c.isActive;
  return dbObj;
}

function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    status: row.status,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbBranchToBranch(row: any): Branch {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    isActive: row.is_active ?? true,
    isMain: row.is_main ?? false,
    createdAt: row.created_at,
  };
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & UI
  const [currentView, setCurrentViewInternal] = useState<'store' | 'admin'>('store');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  const [isSupabaseConnected] = useState<boolean>(isSupabaseConfigured);
  const [supabaseTableStatus, setSupabaseTableStatus] = useState<'connected' | 'needs_schema' | 'checking' | 'not_configured'>(
    () => (isSupabaseConfigured ? 'checking' : 'not_configured')
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Admin Credentials fallback
  const [adminCredentials, setAdminCredentials] = useState<{ phone: string; password: string; name: string }>(() =>
    loadFromStorage('admin_credentials', {
      phone: '01010574689',
      password: '123456@',
      name: 'أدمن هايبر ماركت الفارس (المالك)',
    })
  );

  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<{ email: string; code: string } | null>(null);

  // Core Data States
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage('categories', INITIAL_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', [])
  );
  const [branches, setBranches] = useState<Branch[]>(() =>
    loadFromStorage('branches', INITIAL_BRANCHES)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage('cart', [])
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadFromStorage('stock_movements', [])
  );
  const [loanTransactions, setLoanTransactions] = useState<EmployeeLoanTransaction[]>(() =>
    loadFromStorage('employee_loans', [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage('expenses', [])
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadFromStorage('suppliers', INITIAL_SUPPLIERS)
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage('current_user', null)
  );

  // Function to sync and seed default hypermarket catalog to Supabase
  const syncCatalogToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'بيانات اعتماد Supabase غير مهيأة بعد' };
    }
    try {
      setIsLoadingData(true);

      // 1. Categories
      const dbCats = INITIAL_CATEGORIES.map(mapCategoryToDb);
      const { error: catErr } = await supabase.from('categories').upsert(dbCats, { onConflict: 'id' });
      if (catErr) throw catErr;

      // 2. Branches
      const dbBranches = INITIAL_BRANCHES.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        is_active: b.isActive,
        is_main: b.isMain,
      }));
      await supabase.from('branches').upsert(dbBranches, { onConflict: 'id' });

      // 3. Products
      const dbProds = INITIAL_PRODUCTS.map(mapProductToDb);
      const { error: prodErr } = await supabase.from('products').upsert(dbProds, { onConflict: 'id' });
      if (prodErr) throw prodErr;

      // 4. Reload from Supabase
      const { data: freshCats } = await supabase.from('categories').select('*').order('name');
      if (freshCats && freshCats.length > 0) setCategories(freshCats.map(mapDbCategoryToCategory));

      const { data: freshProds } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (freshProds && freshProds.length > 0) setProducts(freshProds.map(mapDbProductToProduct));

      setSupabaseTableStatus('connected');
      return { success: true, message: 'تم بنجاح رفع وتزامن كافة الأصناف والتصنيفات إلى Supabase' };
    } catch (err: any) {
      console.error('Error syncing catalog to Supabase:', err);
      if (err?.code === 'PGRST205' || err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.message?.includes('does not exist')) {
        setSupabaseTableStatus('needs_schema');
      }
      return {
        success: false,
        message: err?.message || 'فشلت المزامنة. يرجى التأكد من تشغيل ملف supabase/schema.sql في لوحة تحكم Supabase أولاً',
      };
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch from Supabase on Mount
  useEffect(() => {
    let isMounted = true;

    async function fetchFromSupabase() {
      if (!isSupabaseConfigured) {
        setIsLoadingData(false);
        setSupabaseTableStatus('not_configured');
        return;
      }

      try {
        setIsLoadingData(true);

        // 1. Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // 2. Fetch Products
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        // 3. Fetch Orders
        const { data: ordData, error: ordError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        // 4. Fetch Branches
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .order('created_at');

        // Check if database tables need to be created first (PGRST205)
        const isMissingTable =
          catError?.code === 'PGRST205' ||
          prodError?.code === 'PGRST205' ||
          catError?.message?.includes('Could not find the table') ||
          prodError?.message?.includes('Could not find the table') ||
          catError?.message?.includes('relation') ||
          prodError?.message?.includes('relation');

        if (isMissingTable) {
          if (isMounted) {
            setSupabaseTableStatus('needs_schema');
          }
          return;
        }

        if (isMounted) {
          setSupabaseTableStatus('connected');
        }

        // Apply categories from Supabase
        if (!catError && catData && catData.length > 0 && isMounted) {
          setCategories(catData.map(mapDbCategoryToCategory));
        }

        // Apply products from Supabase
        if (!prodError && prodData && isMounted) {
          if (prodData.length > 0) {
            setProducts(prodData.map(mapDbProductToProduct));
          } else {
            // Tables exist in Supabase but are empty, seed initial data automatically
            syncCatalogToSupabase();
          }
        }

        // Apply orders from Supabase
        if (!ordError && ordData && isMounted) {
          setOrders(ordData.map(mapDbOrderToOrder));
        }

        // Apply branches from Supabase
        if (!branchError && branchData && branchData.length > 0 && isMounted) {
          setBranches(branchData.map(mapDbBranchToBranch));
        }
      } catch (err: any) {
        console.error('Error loading data from Supabase:', err);
        if (
          err?.code === 'PGRST205' ||
          err?.message?.includes('Could not find the table') ||
          err?.message?.includes('relation')
        ) {
          if (isMounted) setSupabaseTableStatus('needs_schema');
        }
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    fetchFromSupabase();

    // Supabase Realtime Subscriptions
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newProd = mapDbProductToProduct(payload.new);
              setProducts((prev) => {
                if (prev.some((p) => p.id === newProd.id)) return prev;
                return [newProd, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedProd = mapDbProductToProduct(payload.new);
              setProducts((prev) =>
                prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
              );
            } else if (payload.eventType === 'DELETE') {
              setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newOrder = mapDbOrderToOrder(payload.new);
              setOrders((prev) => {
                if (prev.some((o) => o.id === newOrder.id)) return prev;
                return [newOrder, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedOrder = mapDbOrderToOrder(payload.new);
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
              );
            } else if (payload.eventType === 'DELETE') {
              setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newCat = mapDbCategoryToCategory(payload.new);
              setCategories((prev) => {
                if (prev.some((c) => c.id === newCat.id)) return prev;
                return [...prev, newCat];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedCat = mapDbCategoryToCategory(payload.new);
              setCategories((prev) =>
                prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
              );
            } else if (payload.eventType === 'DELETE') {
              setCategories((prev) => prev.filter((c) => c.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'branches' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updatedBranch = mapDbBranchToBranch(payload.new);
              setBranches((prev) => {
                const exists = prev.some((b) => b.id === updatedBranch.id);
                if (exists) {
                  return prev.map((b) => (b.id === updatedBranch.id ? updatedBranch : b));
                }
                return [...prev, updatedBranch];
              });
            } else if (payload.eventType === 'DELETE') {
              setBranches((prev) => prev.filter((b) => b.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Handle URL navigation & ?view=admin direct link routing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (
      params.get('view') === 'admin' ||
      params.get('admin') === 'true' ||
      hash === '#admin' ||
      pathname.endsWith('/admin')
    ) {
      setCurrentViewInternal('admin');
      const savedUser = loadFromStorage<User | null>('current_user', null);
      if (!savedUser || (savedUser.role !== 'owner' && savedUser.role !== 'manager')) {
        setIsAdminAuthOpen(true);
      }
    }
  }, []);

  const setCurrentView = (view: 'store' | 'admin') => {
    setCurrentViewInternal(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'admin') {
        url.searchParams.set('view', 'admin');
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Sync to localStorage as client cache
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('branches', branches), [branches]);
  useEffect(() => saveToStorage('cart', cart), [cart]);
  useEffect(() => saveToStorage('stock_movements', stockMovements), [stockMovements]);
  useEffect(() => saveToStorage('employee_loans', loanTransactions), [loanTransactions]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('suppliers', suppliers), [suppliers]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);

  // Product Operations (Persisted in Supabase)
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'salesCount'>): Promise<Product> => {
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: tempId,
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Optimistic UI update
    setProducts((prev) => [newProduct, ...prev]);

    // Save to Supabase
    if (isSupabaseConfigured) {
      try {
        const dbPayload = mapProductToDb(newProduct);
        const { data: inserted, error } = await supabase
          .from('products')
          .insert([dbPayload])
          .select()
          .single();

        if (error) {
          console.error('Supabase add product error:', error);
        } else if (inserted) {
          const mapped = mapDbProductToProduct(inserted);
          setProducts((prev) => prev.map((p) => (p.id === tempId ? mapped : p)));
          return mapped;
        }
      } catch (err) {
        console.error('Supabase add product failure:', err);
      }
    }

    // Stock Movement Log
    if (data.stockQuantity > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantityChanged: data.stockQuantity,
        previousQuantity: 0,
        newQuantity: data.stockQuantity,
        reason: 'إضافة منتج جديد ورصيد أولي',
        performedBy: currentUser?.name || 'مدير النظام',
        createdAt: new Date().toLocaleString('ar-EG'),
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (updates.stockQuantity !== undefined && updates.stockQuantity !== item.stockQuantity) {
            const diff = updates.stockQuantity - item.stockQuantity;
            const movement: StockMovement = {
              id: `mov-${Date.now()}`,
              productId: item.id,
              productName: item.name,
              type: diff > 0 ? 'in' : 'adjustment',
              quantityChanged: diff,
              previousQuantity: item.stockQuantity,
              newQuantity: updates.stockQuantity,
              reason: 'تعديل مباشر لبيانات المنتج',
              performedBy: currentUser?.name || 'مدير النظام',
              createdAt: new Date().toLocaleString('ar-EG'),
            };
            setStockMovements((mPrev) => [movement, ...mPrev]);
          }
          return { ...item, ...updates };
        }
        return item;
      })
    );

    if (isSupabaseConfigured) {
      try {
        const dbUpdates = mapProductToDb(updates);
        dbUpdates.updated_at = new Date().toISOString();
        const { error } = await supabase
          .from('products')
          .update(dbUpdates)
          .eq('id', id);
        if (error) console.error('Supabase update product error:', error);
      } catch (err) {
        console.error('Supabase update product error:', err);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.error('Supabase delete product error:', error);
      } catch (err) {
        console.error('Supabase delete product error:', err);
      }
    }
  };

  const toggleProductActive = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    await updateProduct(id, { isActive: !current.isActive });
  };

  const toggleProductStatus = toggleProductActive;

  const updateStock = async (id: string, newStock: number, reason: string, performedBy?: string) => {
    await updateProduct(id, { stockQuantity: newStock });
  };

  const adjustStock = updateStock;

  const bulkAddProducts = async (newItems: Array<Omit<Product, 'id' | 'createdAt' | 'salesCount'>>): Promise<number> => {
    const formatted: Product[] = newItems.map((item, index) => ({
      ...item,
      id: `prod-${Date.now()}-${index}`,
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }));

    setProducts((prev) => [...formatted, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const dbPayloads = formatted.map(mapProductToDb);
        await supabase.from('products').insert(dbPayloads);
      } catch (err) {
        console.error('Supabase bulk insert error:', err);
      }
    }

    return formatted.length;
  };

  // Category Operations (Supabase Persisted)
  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const tempId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id: tempId,
      isActive: true,
    };
    setCategories((prev) => [...prev, newCat]);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([
            {
              name: newCat.name,
              icon: newCat.icon || 'ShoppingBasket',
              image: newCat.image,
              description: newCat.description,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbCategoryToCategory(data);
          setCategories((prev) => prev.map((c) => (c.id === tempId ? mapped : c)));
          return mapped;
        }
      } catch (err) {
        console.error('Supabase add category error:', err);
      }
    }

    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('categories')
          .update({
            name: updates.name,
            icon: updates.icon,
            image: updates.image,
            description: updates.description,
            is_active: updates.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase update category error:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete category error:', err);
      }
    }
  };

  // Branches Operations (Supabase Persisted)
  const addBranch = async (branchData: Omit<Branch, 'id'>): Promise<Branch> => {
    const tempId = `branch-${Date.now()}`;
    const newBranch: Branch = {
      ...branchData,
      id: tempId,
    };
    setBranches((prev) => [...prev, newBranch]);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('branches')
          .insert([
            {
              name: newBranch.name,
              address: newBranch.address,
              phone: newBranch.phone,
              is_active: newBranch.isActive,
              is_main: newBranch.isMain || false,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbBranchToBranch(data);
          setBranches((prev) => prev.map((b) => (b.id === tempId ? mapped : b)));
          return mapped;
        }
      } catch (err) {
        console.error('Supabase add branch error:', err);
      }
    }

    return newBranch;
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('branches')
          .update({
            name: updates.name,
            address: updates.address,
            phone: updates.phone,
            is_active: updates.isActive,
            is_main: updates.isMain,
          })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase update branch error:', err);
      }
    }
  };

  const deleteBranch = async (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('branches').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete branch error:', err);
      }
    }
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.sellingPrice;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Order Operations (Supabase Persisted)
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const formattedDate = new Date().toLocaleString('ar-EG');
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: formattedDate,
      updatedAt: formattedDate,
    };

    // 1. Optimistic Add Order
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Decrement stock
    newOrder.items.forEach((item) => {
      const currentProd = products.find((p) => p.id === item.productId);
      if (currentProd) {
        const newQty = Math.max(0, currentProd.stockQuantity - item.quantity);
        updateProduct(item.productId, {
          stockQuantity: newQty,
          salesCount: (currentProd.salesCount || 0) + item.quantity,
        });
      }
    });

    // 3. Clear cart & open tracking
    clearCart();
    setTrackedOrderId(newOrder.id);
    setIsOrderTrackingOpen(true);

    // 4. Save to Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              id: newOrder.id,
              customer_id: newOrder.customerId,
              customer_name: newOrder.customerName,
              customer_phone: newOrder.customerPhone,
              customer_email: newOrder.customerEmail,
              delivery_type: newOrder.deliveryType,
              delivery_address: newOrder.deliveryAddress,
              payment_method: newOrder.paymentMethod,
              status: newOrder.status,
              items: newOrder.items,
              subtotal: newOrder.subtotal,
              delivery_fee: newOrder.deliveryFee,
              discount: newOrder.discount,
              total: newOrder.total,
              notes: newOrder.notes,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbOrderToOrder(data);
          setOrders((prev) => prev.map((o) => (o.id === orderId ? mapped : o)));
          setTrackedOrderId(mapped.id);
          return mapped;
        }
      } catch (err) {
        console.error('Supabase create order error:', err);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const timestamp = new Date().toLocaleString('ar-EG');
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus, updatedAt: timestamp };
        }
        return order;
      })
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase update order status error:', err);
      }
    }
  };

  const cancelOrder = async (orderId: string, reason = 'إلغاء بناء على طلب العميل') => {
    await updateOrderStatus(orderId, 'cancelled');
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, notes: order.notes ? `${order.notes} | سبب الإلغاء: ${reason}` : reason } : order
      )
    );
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) console.error('Supabase delete order error:', error);
      } catch (err) {
        console.error('Supabase delete order error:', err);
      }
    }
  };

  // Stock Alerts
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stockQuantity === 0);
  }, [products]);

  const nearExpiryProducts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 45);

    return products.filter((p) => {
      if (!p.expiryDate) return false;
      const expiry = new Date(p.expiryDate);
      return expiry <= thirtyDaysFromNow;
    });
  }, [products]);

  // Employee Loans
  const addLoanTransaction = (data: Omit<EmployeeLoanTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: EmployeeLoanTransaction = {
      ...data,
      id: `loan-${Date.now()}`,
      createdAt: `${data.date} ${data.time}`,
    };
    setLoanTransactions((prev) => [newTransaction, ...prev]);
  };

  const employeeSummaries = useMemo<EmployeeLoanSummary[]>(() => {
    const map = new Map<string, { borrowed: number; returned: number; lastDate: string }>();

    loanTransactions.forEach((txn) => {
      const name = txn.personName.trim();
      const current = map.get(name) || { borrowed: 0, returned: 0, lastDate: txn.date };

      if (txn.type === 'borrow') {
        current.borrowed += txn.amount;
      } else {
        current.returned += txn.amount;
      }

      current.lastDate = txn.date;
      map.set(name, current);
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      personName: name,
      totalBorrowed: data.borrowed,
      totalReturned: data.returned,
      remainingDebt: Math.max(0, data.borrowed - data.returned),
      lastActivityDate: data.lastDate,
    }));
  }, [loanTransactions]);

  const totalOutstandingLoans = useMemo(() => {
    return employeeSummaries.reduce((sum, s) => sum + s.remainingDebt, 0);
  }, [employeeSummaries]);

  // Expenses
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalPurchases = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'goods_purchase')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Suppliers
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const recordSupplierPayment = (id: string, amount: number, notes?: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentPaid = s.amountPaid || s.paidAmount || 0;
          const currentRemaining = s.remainingBalance || s.remainingAmount || 0;
          const newPaid = currentPaid + amount;
          const newRemaining = Math.max(0, currentRemaining - amount);

          return {
            ...s,
            amountPaid: newPaid,
            paidAmount: newPaid,
            remainingBalance: newRemaining,
            remainingAmount: newRemaining,
            notes: notes ? `${s.notes || ''} | ${notes}` : s.notes,
          };
        }
        return s;
      })
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // Users & Auth
  const employees = useMemo(() => {
    return users.filter((u) => u.role !== 'customer');
  }, [users]);

  const login = async (phoneOrEmail: string, password?: string): Promise<boolean> => {
    // 1. Try Supabase Auth first if configured and email format
    if (isSupabaseConfigured && phoneOrEmail.includes('@') && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: phoneOrEmail.trim(),
          password: password.trim(),
        });

        if (!error && data.user) {
          const authUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'المدير',
            phone: data.user.phone || phoneOrEmail,
            email: data.user.email,
            role: 'owner',
            address: 'المقر الرئيسي للإدارة',
            createdAt: new Date().toISOString().split('T')[0],
          };
          setCurrentUser(authUser);
          return true;
        }
      } catch (authErr) {
        console.warn('Supabase auth sign in error, fallback to credential check:', authErr);
      }
    }

    // 2. Admin Phone & Password check
    const cleanInput = phoneOrEmail.trim();
    if (
      cleanInput === adminCredentials.phone &&
      password?.trim() === adminCredentials.password
    ) {
      const adminUser: User = {
        id: 'admin-owner-session',
        name: adminCredentials.name,
        phone: adminCredentials.phone,
        role: 'owner',
        address: 'المقر الرئيسي للإدارة',
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      return true;
    }

    // 3. Check regular user directory
    const foundUser = users.find(
      (u) => (u.phone === cleanInput || u.email === cleanInput) && (!password || u.password === password)
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }

    return false;
  };

  const register = (userData: Omit<User, 'id' | 'role' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    setCurrentUser(null);
    setCurrentView('store');
  };

  const switchUserRole = (role: Role) => {
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const mockUser: User = {
        id: `user-${role}-${Date.now()}`,
        name: `مستخدم (${role})`,
        phone: '01010574689',
        address: 'الفارس هايبر ماركت',
        role,
        createdAt: '2026-01-01',
      };
      setUsers((prev) => [...prev, mockUser]);
      setCurrentUser(mockUser);
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const addEmployee = addUser;

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateAdminCredentials = (creds: { phone: string; password: string; name?: string }) => {
    setAdminCredentials((prev) => {
      const updated = {
        phone: creds.phone.trim(),
        password: creds.password.trim(),
        name: creds.name ? creds.name.trim() : prev.name,
      };
      saveToStorage('admin_credentials', updated);
      return updated;
    });
  };

  const adminLogin = async (phoneOrEmail: string, password: string): Promise<boolean> => {
    const success = await login(phoneOrEmail, password);
    if (success) {
      setCurrentView('admin');
      setIsAdminAuthOpen(false);
      return true;
    }
    return false;
  };

  const clearAllOrders = () => setOrders([]);
  const clearAllProducts = () => setProducts([]);
  const resetToFreshStore = () => {
    setProducts([]);
    setOrders([]);
    setCart([]);
    setStockMovements([]);
    setExpenses([]);
    setLoanTransactions([]);
  };

  // Email OTP
  const sendEmailOtp = (email: string): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setLastGeneratedOtp({ email, code });
    return code;
  };

  const verifyEmailOtp = (email: string, code: string, name?: string): boolean => {
    if (!lastGeneratedOtp) return false;
    if (lastGeneratedOtp.email === email && lastGeneratedOtp.code === code) {
      const verifiedUser: User = {
        id: `user-otp-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        phone: '',
        address: 'عميل مسجل عبر البريد الإلكتروني',
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, verifiedUser]);
      setCurrentUser(verifiedUser);
      setLastGeneratedOtp(null);
      return true;
    }
    return false;
  };

  const resetToDemoData = () => {
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setUsers(INITIAL_USERS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setExpenses(INITIAL_EXPENSES);
    setLoanTransactions(INITIAL_EMPLOYEE_LOANS);
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeAdminTab,
        setActiveAdminTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthOpen,
        setIsAuthOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        trackedOrderId,
        setTrackedOrderId,

        isSupabaseConnected,
        supabaseTableStatus,
        isLoadingData,
        syncCatalogToSupabase,

        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        toggleProductStatus,
        updateStock,
        adjustStock,
        bulkAddProducts,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,

        branches,
        addBranch,
        updateBranch,
        deleteBranch,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,

        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        deleteOrder,

        stockMovements,
        inventoryLogs: stockMovements,
        lowStockProducts,
        outOfStockProducts,
        nearExpiryProducts,

        loanTransactions,
        addLoanTransaction,
        employeeSummaries,
        totalOutstandingLoans,

        expenses,
        addExpense,
        deleteExpense,
        totalExpenses,
        totalPurchases,

        suppliers,
        addSupplier,
        updateSupplier,
        recordSupplierPayment,
        deleteSupplier,

        users,
        employees,
        currentUser,
        login,
        register,
        logout,
        switchUserRole,
        addUser,
        addEmployee,
        updateUser,
        deleteUser,

        isAdminAuthOpen,
        setIsAdminAuthOpen,
        adminCredentials,
        updateAdminCredentials,
        adminLogin,
        clearAllOrders,
        clearAllProducts,
        resetToFreshStore,

        lastGeneratedOtp,
        sendEmailOtp,
        verifyEmailOtp,

        resetToDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
