import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import StakeholderDashboard from './pages/StakeholderDashboard';
import EvidenceView from './pages/EvidenceView';
import MLAnalytics from './pages/MLAnalytics';
import RegressionsList from './pages/RegressionsList';
import DatasetExplorer from './pages/DatasetExplorer';
import Rollback from './pages/Rollback';
import LegacyWorkflow from './pages/LegacyWorkflow';
import BaselineAnalysis from './pages/BaselineAnalysis';
import Reports from './pages/Reports';
import PlanComparison from './pages/PlanComparison';
import ReleaseHistory from './pages/ReleaseHistory';
import SchemaComparison from './pages/SchemaComparison';
import IndexAnalysis from './pages/IndexAnalysis';
import StatisticsAnalysis from './pages/StatisticsAnalysis';
import SystemAlerts from './pages/SystemAlerts';
import TestSuite from './pages/TestSuite';
import UserValidation from './pages/UserValidation';
import SystemSettings from './pages/SystemSettings';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/profile" element={<Profile />} />

              {/* ADMIN ONLY ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="/rollback" element={<Rollback />} />
              </Route>

              {/* DB ENGINEER & ADMIN ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Database Engineer']} />}>
                <Route path="/engineer" element={<EngineerDashboard />} />
                <Route path="/dataset" element={<DatasetExplorer />} />
                <Route path="/regressions" element={<RegressionsList />} />
                <Route path="/plan-comparison" element={<PlanComparison />} />
                <Route path="/plan-comparison/:queryIndex" element={<PlanComparison />} />
                <Route path="/evidence/:queryIndex" element={<EvidenceView />} />
                <Route path="/ml-analytics" element={<MLAnalytics />} />
                <Route path="/baseline" element={<BaselineAnalysis />} />
                <Route path="/schema-comparison" element={<SchemaComparison />} />
                <Route path="/index-analysis" element={<IndexAnalysis />} />
                <Route path="/statistics-analysis" element={<StatisticsAnalysis />} />
                <Route path="/legacy-workflow" element={<LegacyWorkflow />} />
                <Route path="/testing" element={<TestSuite />} />
              </Route>

              {/* STAKEHOLDER & ALL ROLES ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Stakeholder']} />}>
                <Route path="/stakeholder" element={<StakeholderDashboard />} />
              </Route>

              {/* COMMON SHARED ROUTES FOR ALL AUTHENTICATED USERS */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Database Engineer', 'Stakeholder']} />}>
                <Route path="/release-history" element={<ReleaseHistory />} />
                <Route path="/alerts" element={<SystemAlerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/validation" element={<UserValidation />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
