import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import TrainingManagement from './components/TrainingManagement';
import ContractManagement from './components/ContractManagement';
import PaymentManagement from './components/PaymentManagement';
import InnovationTracking from './components/InnovationTracking';
import Certificates from './components/Certificate';
import WarrantyManagement from './components/WarrantyManagement';


// import Certificates from './components/Certificate';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="training" element={<TrainingManagement />} />
              <Route path="contracts" element={<ContractManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="innovations" element={<InnovationTracking />} />
              <Route path="warranties" element={<WarrantyManagement />} />
              <Route path="certificates" element={<Certificates />} />
              {/* <Route path="payments" element={<div className="p-8"><h1 className="text-2xl font-bold">Payment Management</h1><p>Coming soon...</p></div>} /> */}
              {/* <Route path="innovations" element={<div className="p-8"><h1 className="text-2xl font-bold">Innovation Tracking</h1><p>Coming soon...</p></div>} /> */}
              {/* <Route path="warranties" element={<div className="p-8"><h1 className="text-2xl font-bold">Warranty Management</h1><p>Coming soon...</p></div>} /> */}
              <Route path="courses" element={<div className="p-8"><h1 className="text-2xl font-bold">Training Courses</h1><p>Coming soon...</p></div>} />
            </Route>
            
            {/* Unauthorized Route */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Unauthorized Access
                    </h1>
                    <p className="text-gray-600 mb-4">
                      You don't have permission to access this page.
                    </p>
                    <button 
                      onClick={() => window.history.back()}
                      className="text-primary hover:text-primary/80"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-4">
                      The page you're looking for doesn't exist.
                    </p>
                    <button 
                      onClick={() => window.history.back()}
                      className="text-primary hover:text-primary/80"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

