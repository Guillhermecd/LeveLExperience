import { Alert, Button, Divider, Form, Input, Popconfirm, Switch, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/api';
import { color } from '../../theme/tokens';
import { useAuth } from '../Auth/AuthContext';

type PreferencesFormValues = { name?: string; showGoals: boolean };
type PasswordFormValues = { currentPassword: string; newPassword: string; confirmPassword: string };

function apiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function ProfilePage() {
  const { user, updatePreferences, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onSavePreferences(values: PreferencesFormValues) {
    setPreferencesError(null);
    setSavingPreferences(true);
    try {
      await updatePreferences({ name: values.name?.trim() || null, showGoals: values.showGoals });
      navigate('/', { replace: true });
    } catch (err) {
      setPreferencesError(apiErrorMessage(err, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setSavingPreferences(false);
    }
  }

  async function onChangePassword(values: PasswordFormValues) {
    setPasswordError(null);
    setChangingPassword(true);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      navigate('/entrar', { replace: true });
    } catch (err) {
      setPasswordError(apiErrorMessage(err, 'Não foi possível trocar a senha. Tente novamente.'));
    } finally {
      setChangingPassword(false);
    }
  }

  async function onDeleteAccount() {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/entrar', { replace: true });
    } catch (err) {
      setDeleteError(apiErrorMessage(err, 'Não foi possível excluir a conta. Tente novamente.'));
      setDeleting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: color.bg.base, color: color.text.body }}>
      <div style={{ maxWidth: 360, margin: '0 auto', padding: '80px 16px 0' }}>
        <Typography.Title level={3} style={{ color: color.text.body }}>
          Perfil
        </Typography.Title>

        {preferencesError && <Alert type="error" message={preferencesError} showIcon style={{ marginBottom: 16 }} />}
        <Form
          layout="vertical"
          onFinish={onSavePreferences}
          disabled={savingPreferences}
          initialValues={{ name: user?.name ?? '', showGoals: user?.showGoals ?? true }}
        >
          <Form.Item name="name" label="Nome" rules={[{ max: 255 }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item name="showGoals" label="Mostrar metas no quadro" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={savingPreferences} block>
              Salvar
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Typography.Title level={4} style={{ color: color.text.body }}>
          Trocar senha
        </Typography.Title>
        {passwordError && <Alert type="error" message={passwordError} showIcon style={{ marginBottom: 16 }} />}
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onChangePassword}
          disabled={changingPassword}
        >
          <Form.Item name="currentPassword" label="Senha atual" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="newPassword" label="Nova senha" rules={[{ required: true }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirmar nova senha"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value === getFieldValue('newPassword')) return Promise.resolve();
                  return Promise.reject(new Error('As senhas não coincidem.'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={changingPassword} block>
              Trocar senha
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Typography.Title level={4} style={{ color: color.coral.text }}>
          Excluir conta
        </Typography.Title>
        {deleteError && <Alert type="error" message={deleteError} showIcon style={{ marginBottom: 16 }} />}
        <Typography.Paragraph style={{ color: color.text.faint }}>
          Remove sua conta e todos os dados do quadro. Não pode ser desfeito.
        </Typography.Paragraph>
        <Popconfirm
          title="Excluir conta?"
          description="Essa ação não pode ser desfeita."
          okText="Excluir"
          okButtonProps={{ danger: true }}
          cancelText="Cancelar"
          onConfirm={onDeleteAccount}
        >
          <Button danger loading={deleting} block>
            Excluir minha conta
          </Button>
        </Popconfirm>

        <Divider />

        <Typography.Text style={{ color: color.text.body }}>
          <Link to="/">Voltar ao quadro</Link>
        </Typography.Text>
      </div>
    </div>
  );
}
