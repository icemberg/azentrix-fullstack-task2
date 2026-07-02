import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import Board from '../pages/Board';
import Admin from '../pages/Admin';
import Teams from '../pages/Teams';
import Invite from '../pages/Invite';
import Settings from '../pages/Settings';
import MyTasks from '../pages/MyTasks';
import { useAuthStore } from '../store/auth.store';
import AppLayout from '../components/layout/AppLayout';
import PublicLayout from '../components/layout/PublicLayout';
import NotFound from '../pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/invite/:token',
        element: <Invite />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/board/:id',
        element: <Board />,
      },
      {
        path: '/admin',
        element: <Admin />,
      },
      {
        path: '/teams',
        element: <Teams />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/tasks',
        element: <MyTasks />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
