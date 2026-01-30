import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppHome } from './pages/AppHome'
import { ForgotPassword } from './pages/ForgotPassword'
import { Home } from './pages/marketing/Home'
import { HowItWorks } from './pages/marketing/HowItWorks'
import { WhatIs } from './pages/marketing/WhatIs'
import { WhoItsFor } from './pages/marketing/WhoItsFor'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ResetPassword } from './pages/ResetPassword'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'what-is-cognify', element: <WhatIs /> },
      { path: 'who-its-for', element: <WhoItsFor /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      {
        path: 'app',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <AppHome /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
