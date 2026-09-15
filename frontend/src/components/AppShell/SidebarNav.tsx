import { AppstoreOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Drawer, Grid, Menu } from 'antd';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { zIndex } from '../../theme/tokens';
import { useAppShellStyles } from './AppShell.styles';

type NavItem = { key: string; label: string; icon: ReactNode };

const items: NavItem[] = [
  { key: '/', label: 'Quadro', icon: <AppstoreOutlined /> },
  { key: '/calendario', label: 'Calendário', icon: <CalendarOutlined /> },
  { key: '/perfil', label: 'Perfil', icon: <UserOutlined /> },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SidebarNav({ open, onClose }: Props) {
  const { styles } = useAppShellStyles();
  const screens = Grid.useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  function handleSelect(key: string) {
    if (key !== location.pathname) {
      navigate(key);
    }
    onClose();
  }

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      title="Navegação"
      // On a phone the drawer is the screen; on a desktop a fixed 280px keeps
      // the page behind it readable.
      width={screens.xs ? '85%' : 280}
      zIndex={zIndex.drawer}
      styles={{ body: { padding: 0 } }}
    >
      <Menu
        className={styles.menu}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => handleSelect(key)}
      />
    </Drawer>
  );
}
