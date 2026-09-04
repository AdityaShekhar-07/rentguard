import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import LeaseDetail from './pages/LeaseDetail';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home always opens Landing page */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/landlord"
                element={
                  <ProtectedRoute role="LANDLORD">
                    <LandlordDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenant"
                element={
                  <ProtectedRoute role="TENANT">
                    <TenantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lease/:leaseId"
                element={
                  <ProtectedRoute>
                    <LeaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}