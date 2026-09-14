import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/api';
import { color } from '../../theme/tokens';
import { useAuth } from './AuthContext';

type FormValues = { email: string; password: string };

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: FormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: color.bg.base, color: color.text.body }}>
      <div style={{ maxWidth: 360, margin: '0 auto', padding: '80px 16px 0' }}>
        <Typography.Title level={3} style={{ color: color.text.body }}>
          Entrar
        </Typography.Title>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} disabled={submitting}>
          <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Entrar
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text style={{ color: color.text.body }}>
          Não tem conta? <Link to="/registrar">Criar conta com convite</Link>
        </Typography.Text>
      </div>
    </div>
  );
}
