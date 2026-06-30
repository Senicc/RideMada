import { BrowserRouter, Navigate, Route, Routes, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getToken, setToken } from './api/client';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import DriversPage from './pages/DriversPage';
import RidesPage from './pages/RidesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';

function Layout() {
  const navigate = useNavigate();
  const logout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>RideMada</h1>
        <nav>
          <NavLink to="/" end>Tableau de bord</NavLink>
          <NavLink to="/users">Utilisateurs</NavLink>
          <NavLink to="/drivers">Chauffeurs</NavLink>
          <NavLink to="/rides">Courses</NavLink>
          <NavLink to="/payments">Paiements</NavLink>
          <NavLink to="/reports">Réclamations</NavLink>
        </nav>
        <button className="btn btn-ghost" style={{ marginTop: 24, width: '100%' }} onClick={logout}>
          Déconnexion
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="rides" element={<RidesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
