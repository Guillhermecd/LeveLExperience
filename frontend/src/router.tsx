import { createBrowserRouter } from 'react-router-dom';
import { BoardPage } from './pages/Board';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BoardPage />,
  },
]);
