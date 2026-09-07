import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectMonitoring from './pages/ProjectMonitoring';
import AnomalyDetection from './pages/AnomalyDetection';
import Alerts from './pages/Alerts';
import FraudRisk from './pages/FraudRisk';
import FinancialAnalytics from './pages/FinancialAnalytics';
import GeographicMap from './pages/GeographicMap';
import Reports from './pages/Reports';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import RiskPredictor from './pages/RiskPredictor';
import ProjectProfile from './pages/ProjectProfile';

function Guard({ children }: { children: ReactNode }) {
  if (!localStorage.getItem('mplad_auth')) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard><AppShell /></Guard>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectMonitoring />} />
          <Route path="/anomaly-detection" element={<AnomalyDetection />} />
          <Route path="/fraud-risk" element={<FraudRisk />} />
          <Route path="/financial" element={<FinancialAnalytics />} />
          <Route path="/geographic-map" element={<GeographicMap />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/risk-predictor" element={<RiskPredictor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/project-profile/:id" element={<ProjectProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
