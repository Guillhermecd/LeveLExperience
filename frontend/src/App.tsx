import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { darkTheme } from './theme/theme';
import { router } from './router';

function App() {
  return (
    <ConfigProvider theme={darkTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
