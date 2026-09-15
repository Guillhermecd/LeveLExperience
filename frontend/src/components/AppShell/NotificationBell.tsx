import { BellOutlined, CalendarOutlined, CloseOutlined, FlagOutlined } from '@ant-design/icons';
import { Badge, Button, Popover } from 'antd';
import { useNotificationBellStyles } from './NotificationBell.styles';
import { useNotifications } from './useNotifications';
import type { NotificationAlert } from './notifications';

function AlertIcon({ kind }: { kind: NotificationAlert['kind'] }) {
  return kind === 'meeting' ? <CalendarOutlined /> : <FlagOutlined />;
}

export function NotificationBell() {
  const { styles } = useNotificationBellStyles();
  const { alerts, dismiss } = useNotifications();

  const panel = (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>Notificações</div>
      {alerts.length === 0 && <div className={styles.empty}>Nada por aqui no momento.</div>}
      {alerts.map((alert) => (
        <div key={alert.id} className={styles.item}>
          <span className={styles.itemIcon}>
            <AlertIcon kind={alert.kind} />
          </span>
          <span className={styles.itemBody}>
            <span className={styles.itemTitle}>{alert.title}</span>
            <span className={styles.itemDetail}>{alert.detail}</span>
          </span>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            aria-label={`Dispensar ${alert.title}`}
            onClick={() => dismiss(alert.id)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.triggerWrapper}>
      <Popover content={panel} trigger="click" placement="bottomRight" arrow={false}>
        <Badge count={alerts.length} size="small">
          <Button className={styles.trigger} icon={<BellOutlined />} aria-label="Ver notificações" />
        </Badge>
      </Popover>
    </div>
  );
}
