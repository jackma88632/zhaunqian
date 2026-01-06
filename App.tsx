
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './app/page';
import BossDashboard from './app/dashboard/page';
import L1TransferPage from './app/l1/transfers/page';
import L2ReportPage from './app/report/[token]/page';
import AdminRecordsPage from './app/admin/records/page';
import LoginPage from './app/login/page';

/**
 * 权限守护组件
 */
function ProtectedRoute({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) {
  const userStr = sessionStorage.getItem('auth_user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 如果无权访问，返回首页
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* 厂家决策看板：限总办和省理 */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['BOSS', 'PROVINCE_MGR']}>
            <BossDashboard />
          </ProtectedRoute>
        } />
        
        {/* 一网业务后台：限总办和经销商 */}
        <Route path="/l1/transfers" element={
          <ProtectedRoute allowedRoles={['BOSS', 'DEALER_L1']}>
            <L1TransferPage />
          </ProtectedRoute>
        } />
        
        {/* 二网报数：免登录(Token认证) */}
        <Route path="/report/:token" element={<L2ReportPage />} />
        
        {/* 档案管理：限总办和客服人员 [新增客服权限] */}
        <Route path="/admin/records" element={
          <ProtectedRoute allowedRoles={['BOSS', 'CUSTOMER_SERVICE']}>
            <AdminRecordsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
