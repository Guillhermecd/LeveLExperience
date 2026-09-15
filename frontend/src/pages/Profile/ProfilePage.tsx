import { Alert, Button, Form, Input, Switch, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/api';
import { color } from '../../theme/tokens';
import { useAuth } from '../Auth/AuthContext';

type FormValues = { name?: string; showGoals: boolean };

export function ProfilePage() {
  const { user, updatePreferences } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: FormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await updatePreferences({ name: values.name?.trim() || null, showGoals: values.showGoals });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: color.bg.base, color: color.text.body }}>
      <div style={{ maxWidth: 360, margin: '0 auto', padding: '80px 16px 0' }}>
        <Typography.Title level={3} style={{ color: color.text.body }}>
          Perfil
        </Typography.Title>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
          initialValues={{ name: user?.name ?? '', showGoals: user?.showGoals ?? true }}
        >
          <Form.Item name="name" label="Nome" rules={[{ max: 255 }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item name="showGoals" label="Mostrar metas no quadro" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Salvar
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text style={{ color: color.text.body }}>
          <Link to="/">Voltar ao quadro</Link>
        </Typography.Text>
      </div>
    </div>
  );
}
