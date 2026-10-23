import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResourcePage from './pages/ResourcePage';

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="departments" element={<ResourcePage resource="departments" />} />
        <Route path="districts" element={<ResourcePage resource="districts" />} />
        <Route path="blocks" element={<ResourcePage resource="blocks" />} />
        <Route path="offices" element={<ResourcePage resource="offices" />} />
        <Route path="designations" element={<ResourcePage resource="designations" />} />
        <Route path="employees" element={<ResourcePage resource="employees" />} />
        <Route path="admin-users" element={<ResourcePage resource="admin-users" />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider>;
}