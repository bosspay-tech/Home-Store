import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Landing from "./pages/Landing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import OrderSuccess from "./pages/OrderSuccess";
import Checkout from "./pages/Checkout";
import { ProtectedRoute } from "./components/ProtectedRotue";
import MyOrders from "./pages/MyOrders";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsRefundsPolicy from "./pages/ReturnsRefundsPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactPage from "./pages/ContactPage";
import AuthCallback from "./pages/AuthCallback";
import { isSupabaseConfigured } from "./lib/supabase";
import { AdminRoute } from "./components/AdminRoute";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      {!isSupabaseConfigured ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
          Supabase is not configured. Copy <code>.env.example</code> to{" "}
          <code>.env</code>, add your keys, then restart the dev server.
        </div>
      ) : null}
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/shipping" element={<ShippingPolicy />} />
        <Route path="/returns" element={<ReturnsRefundsPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
