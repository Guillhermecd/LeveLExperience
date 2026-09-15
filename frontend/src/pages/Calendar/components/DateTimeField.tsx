import { DatePicker, Grid, TimePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useDateTimeFieldStyles } from './DateTimeField.styles';

type Props = {
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
};

/**
 * antd's single `DatePicker showTime` lays out a date panel and a time panel
 * side by side (~400px) — wider than a phone viewport, so the popup opens
 * partly off-screen (e.g. Sunday's column becomes unreachable at 375-390px).
 * Below the `sm` breakpoint this swaps for two stacked pickers, each with a
 * panel narrow enough to fit; both shapes produce the same combined `Dayjs`
 * value, so `Form.Item`'s value/onChange contract doesn't change either way.
 */
export function DateTimeField({ value, onChange }: Props) {
  const { styles } = useDateTimeFieldStyles();
  const screens = Grid.useBreakpoint();

  if (screens.sm) {
    return (
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="DD/MM/YYYY HH:mm"
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
      />
    );
  }

  function withTimeOf(date: Dayjs, reference: Dayjs): Dayjs {
    return date.hour(reference.hour()).minute(reference.minute()).second(0).millisecond(0);
  }

  function handleDateChange(date: Dayjs | null) {
    if (!date) {
      onChange?.(null);
      return;
    }
    onChange?.(withTimeOf(date, value ?? dayjs().hour(9).minute(0)));
  }

  function handleTimeChange(time: Dayjs | null) {
    if (!time) return;
    onChange?.(withTimeOf(value ?? dayjs(), time));
  }

  return (
    <div className={styles.stack}>
      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} value={value} onChange={handleDateChange} />
      <TimePicker format="HH:mm" style={{ width: '100%' }} value={value} onChange={handleTimeChange} />
    </div>
  );
}
