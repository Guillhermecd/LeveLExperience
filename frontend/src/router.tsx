import { createBrowserRouter } from 'react-router-dom';
import { BoardPage } from './pages/Board';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { RequireAuth } from './pages/Auth/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <BoardPage />
      </RequireAuth>
    ),
  },
  { path: '/entrar', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
]);
