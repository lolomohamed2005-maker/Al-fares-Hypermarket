import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Storefront } from './components/customer/Storefront';
import { ProductModal } from './components/customer/ProductModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrdersTrackingModal } from './components/customer/OrdersTrackingModal';
import { AuthModal } from './components/customer/AuthModal';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PosCashier } from './components/admin/PosCashier';
import { ProductsManager } from './components/admin/ProductsManager';
import { InventoryManager } from './components/admin/InventoryManager';
import { OrdersManager } from './components/admin/OrdersManager';
import { EmployeeLoansManager } from './components/admin/EmployeeLoansManager';
import { ExpensesManager } from './components/admin/ExpensesManager';
import { SuppliersManager } from './components/admin/SuppliersManager';
import { CategoriesManager } from './components/admin/CategoriesManager';
import { BranchesManager } from './components/admin/BranchesManager';
import { ReportsManager } from './components/admin/ReportsManager';
import { UsersManager } from './components/admin/UsersManager';
import { BarcodeScannerModal } from './components/admin/BarcodeScannerModal';
import { AddProductModal } from './components/admin/AddProductModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

import { Product } from './types';

const MainApplication: React.FC = () => {
  const {
    currentView,
    activeAdminTab,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    isAuthOpen,
    setIsAuthOpen,
    isAdminAuthOpen,
    setIsAdminAuthOpen,
    products,
  } = useStore();

  // Customer Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Global Admin Barcode Quick Action
  const [isGlobalBarcodeOpen, setIsGlobalBarcodeOpen] = useState(false);
  const [isAddProductFromBarcodeOpen, setIsAddProductFromBarcodeOpen] = useState(false);
  const [barcodePrefill, setBarcodePrefill] = useState('');
  const [editingProductFromBarcode, setEditingProductFromBarcode] = useState<Product | null>(null);

  const handleBarcodeFound = (product: Product) => {
    setEditingProductFromBarcode(product);
    setIsAddProductFromBarcodeOpen(true);
  };

  const handleBarcodeNotFound = (scannedCode: string) => {
    setEditingProductFromBarcode(null);
    setBarcodePrefill(scannedCode);
    setIsAddProductFromBarcodeOpen(true);
  };

  // Render Admin Active Tab
  const renderAdminTab = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'pos':
        return <PosCashier />;
      case 'products':
        return <ProductsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'orders':
        return <OrdersManager />;
      case 'employee_loans':
        return <EmployeeLoansManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'suppliers':
        return <SuppliersManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'branches':
        return <BranchesManager />;
      case 'reports':
        return <ReportsManager />;
      case 'users':
        return <UsersManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-emerald-600 selection:text-white">
      {currentView === 'store' ? (
        /* Customer Storefront View */
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <Storefront
              onOpenProductModal={(product) => setSelectedProductForModal(product)}
            />
          </main>
          <Footer />

          {/* Customer Modals */}
          {selectedProductForModal && (
            <ProductModal
              product={selectedProductForModal}
              onClose={() => setSelectedProductForModal(null)}
            />
          )}

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
          />

          <OrdersTrackingModal
            isOpen={isOrderTrackingOpen}
            onClose={() => setIsOrderTrackingOpen(false)}
          />

          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />
        </div>
      ) : (
        /* Admin Management Dashboard View */
        <AdminLayout onOpenBarcodeScanner={() => setIsGlobalBarcodeOpen(true)}>
          {renderAdminTab()}

          {/* Barcode Quick Scanner Modal from Top Header */}
          <BarcodeScannerModal
            isOpen={isGlobalBarcodeOpen}
            onClose={() => setIsGlobalBarcodeOpen(false)}
            onProductFound={handleBarcodeFound}
            onProductNotFound={handleBarcodeNotFound}
          />

          {/* Quick Add/Edit from Barcode Scanner */}
          <AddProductModal
            isOpen={isAddProductFromBarcodeOpen}
            onClose={() => {
              setIsAddProductFromBarcodeOpen(false);
              setEditingProductFromBarcode(null);
            }}
            initialProduct={editingProductFromBarcode}
            prefilledBarcode={barcodePrefill}
          />
        </AdminLayout>
      )}

      {/* Global Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApplication />
    </StoreProvider>
  );
}
