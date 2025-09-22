import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import ResultsListPage from './pages/ResultsListPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import AdminDashboard from './pages/AdminDashboard';
import PEOAnalysisPage from './pages/PEOAnalysisPage';
import AllPEOResponsesPage from './pages/AllPEOResponsesPage';
import AddUserPage from './pages/AddUserPage';
import ViewUsersPage from './pages/ViewUsersPage';
import FinalResultUploadPage from './pages/FinalResultUploadPage';
import FinalResultRecordsPage from './pages/FinalResultRecordsPage';
import FinalResultDetailPage from './pages/FinalResultDetailPage';
import PredictionPage from './pages/PredictionPage';
import BulkPredictionPage from './pages/BulkPredictionPage';

const App = () => {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* All protected routes share AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Index or "/" */}
            <Route index element={<UploadPage />} />

            {/* Admin dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* PLO/PEO */}
            <Route path="/results" element={<ResultsListPage />} />
            <Route path="/results-table" element={<ResultsListPage />} />
            <Route path="/results/:id" element={<ResultPage />} />
            <Route path="/peo-analysis" element={<PEOAnalysisPage />} />
            <Route path="/peo-responses" element={<AllPEOResponsesPage />} />

            {/* User management */}
            <Route path="/users">
              <Route index element={<ViewUsersPage />} />
              <Route path="add" element={<AddUserPage />} />
            </Route>

            {/* Final Result Analysis */}
            <Route path="/final-result-upload" element={<FinalResultUploadPage />} />
            <Route path="/final-result-records" element={<FinalResultRecordsPage />} />
            <Route path="/final-result/:id" element={<FinalResultDetailPage />} />

            {/* ML Predictions */}
            <Route path="/predictions" element={<PredictionPage />} />
            <Route path="/predictions/bulk" element={<BulkPredictionPage />} />

            {/* Catch-all, redirect to home */}
            <Route path="*" element={<UploadPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
