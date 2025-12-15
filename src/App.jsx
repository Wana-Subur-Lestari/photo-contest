import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import HomePage from './pages/HomePage.jsx';
import RankPage from './pages/RankPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { getContestStatus } from './services/api.js';

//check contest status 
const CheckContestStatus = ({ children }) => {

  const res = getContestStatus();
  if (res.is_active) {
    return children;
  } else {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-4xl font-bold mb-4">Ditutup!</h1>
        <p className="text-gray-600 text-lg">
          Masa voting telah berakhir dan pemenang akan diumumkan tanggal 15 Desember 2025. Terima kasih atas partisipasi Anda!
        </p>
      </div>
    );
  }
}

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <CheckContestStatus>
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                </CheckContestStatus>
              }
            />
            <Route
              path="/"
              element={
                <CheckContestStatus>
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                </CheckContestStatus>
              }
            />
            <Route
              path="/rank"
              element={
                <CheckContestStatus>
                  <ProtectedRoute>
                    <RankPage />
                  </ProtectedRoute>
                </CheckContestStatus>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute adminOnly>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;