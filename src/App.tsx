import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./lib/toast";
import { AuthProvider } from "./lib/auth";
import { HomePage } from "./pages/HomePage";
import { CustomerRequestPage } from "./pages/CustomerRequestPage";
import { CustomerTrackPage } from "./pages/CustomerTrackPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WorkersPage } from "./pages/WorkersPage";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/request" element={<CustomerRequestPage />} />
          <Route path="/track" element={<CustomerTrackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
