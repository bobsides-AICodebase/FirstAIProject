import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppHome } from './pages/AppHome'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      {
        path: 'app',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <AppHome /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
