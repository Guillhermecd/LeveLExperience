import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { darkTheme } from './theme/theme';
import { router } from './router';
import { AuthProvider } from './pages/Auth/AuthContext';

function App() {
  return (
    <ConfigProvider theme={darkTheme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
