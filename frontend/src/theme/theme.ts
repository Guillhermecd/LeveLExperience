import { theme as antdTheme, type ThemeConfig } from 'antd';
import { color, font, radius } from './tokens';

/**
 * The handoff defines a single dark palette, no light mode — a deliberate
 * deviation from the BIMD template's light/dark pair (see PLAN.md).
 */
export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: color.lime.text,
    colorLink: color.lime.text,
    colorText: color.text.body,
    colorTextSecondary: color.text.label,
    colorBgBase: color.bg.base,
    colorBgContainer: color.surface.panel,
    colorBgElevated: color.surface.modal,
    colorBorder: color.border.column,
    fontFamily: font.body,
    borderRadius: radius.md1,
  },
};
