import { MenuOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState, type ReactNode } from 'react';
import { useAppShellStyles } from './AppShell.styles';
import { SidebarNav } from './SidebarNav';

/**
 * Additive wrapper around the authenticated pages: it renders the page
 * untouched and adds a floating hamburger that opens the navigation drawer.
 * Deliberately not a fixed desktop rail — the board needs its full width.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { styles } = useAppShellStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={styles.trigger}
        icon={<MenuOutlined />}
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      />
      <SidebarNav open={open} onClose={() => setOpen(false)} />
      {children}
    </>
  );
}
