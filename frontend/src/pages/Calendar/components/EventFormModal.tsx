import { Button, Form, Input, Radio } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import type { CalendarEvent, CalendarEventColor, CalendarEventInput } from '../../../types/calendar';
import { DateTimeField } from './DateTimeField';
import { eventColorOptions } from '../eventColors';
import { useEventFormModalStyles } from './EventFormModal.styles';

type FormValues = {
  title: string;
  description?: string;
  startsAt: Dayjs;
  endsAt?: Dayjs | null;
  color: CalendarEventColor;
};

type Props = {
  /** Absent means "new event"; present means "edit this one". */
  event?: CalendarEvent | null;
  /** Day the user had selected, used as the default date of a new event. */
  defaultDay: string;
  onSubmit: (input: CalendarEventInput) => Promise<void>;
  onCancel: () => void;
};

export function EventFormModal({ event, defaultDay, onSubmit, onCancel }: Props) {
  const { styles } = useEventFormModalStyles();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const initialValues: FormValues = {
    title: event?.title ?? '',
    description: event?.description ?? undefined,
    startsAt: event ? dayjs(event.startsAt) : dayjs(defaultDay).hour(9).minute(0).second(0),
    endsAt: event?.endsAt ? dayjs(event.endsAt) : null,
    color: event?.color ?? 'lime',
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
    // Re-seeding only when the edited event changes is the point: re-running on
    // every render would fight the user's typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  async function handleFinish(values: FormValues) {
    setSaving(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description?.trim() || null,
        startsAt: values.startsAt.toISOString(),
        endsAt: values.endsAt ? values.endsAt.toISOString() : null,
        color: values.color,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <div>
          <div className={styles.label}>Compromisso</div>
          <div className={styles.title}>{event ? 'Editar compromisso' : 'Novo compromisso'}</div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFinish}
          disabled={saving}
        >
          <Form.Item name="title" label="Título" rules={[{ required: true, max: 255 }]}>
            <Input autoFocus />
          </Form.Item>

          <Form.Item name="description" label="Descrição" rules={[{ max: 2000 }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="startsAt" label="Início" rules={[{ required: true }]}>
            <DateTimeField />
          </Form.Item>

          <Form.Item
            name="endsAt"
            label="Término"
            dependencies={['startsAt']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value: Dayjs | null) {
                  const startsAt = getFieldValue('startsAt') as Dayjs | undefined;
                  if (!value || !startsAt || !value.isBefore(startsAt)) return Promise.resolve();
                  return Promise.reject(new Error('O término não pode ser antes do início.'));
                },
              }),
            ]}
          >
            <DateTimeField />
          </Form.Item>

          <Form.Item name="color" label="Cor">
            <Radio.Group>
              {eventColorOptions.map((option) => (
                <Radio.Button key={option.value} value={option.value}>
                  <span className={styles.colorRow}>
                    <span className={styles.colorDot} style={{ background: option.dot }} />
                    {option.label}
                  </span>
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <div className={styles.footerRow}>
              <Button onClick={onCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Salvar
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
