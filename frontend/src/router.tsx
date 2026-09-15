import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BoardPage } from './pages/Board';
import { CalendarPage } from './pages/Calendar';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { RequireAuth } from './pages/Auth/RequireAuth';
import { ProfilePage } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell>
          <BoardPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/calendario',
    element: (
      <RequireAuth>
        <AppShell>
          <CalendarPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/perfil',
    element: (
      <RequireAuth>
        <AppShell>
          <ProfilePage />
        </AppShell>
      </RequireAuth>
    ),
  },
  // Sign-in and sign-up stay outside the shell: there is nothing to navigate
  // to yet, and a hamburger there would just be a dead control.
  { path: '/entrar', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
]);
