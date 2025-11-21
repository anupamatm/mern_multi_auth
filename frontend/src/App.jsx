import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardSeller from "./pages/DashboardSeller";
import DashboardCustomer from "./pages/DashboardCustomer";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <nav className="p-3 bg-light">
          <Link to="/" className="me-3">
            Home
          </Link>
          <Link to="/login" className="me-3">
            Login
          </Link>
          <Link to="/register">Register</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="container mt-5">
                <h1>Welcome</h1>
              </div>
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
               
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller"
            element={
              <ProtectedRoute roles={["seller"]}>
                <DashboardSeller />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={["customer"]}>
                <DashboardCustomer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
