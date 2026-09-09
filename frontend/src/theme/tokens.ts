/**
 * Single source of truth for every visual value used in the app.
 * GATES 1.4 greps `src` for raw hex outside this file — add new colors here,
 * never inline. Values are copied 1:1 from the design handoff
 * (`Kanban para tarefas e metas/design_handoff_kanban/README.md`).
 */

export const color = {
  bg: {
    base: '#101117',
    headerGradient:
      'radial-gradient(1200px 600px at 15% -10%, #1B2030 0%, #101117 60%)',
  },
  surface: {
    column: '#15171E',
    panel: '#16181F',
    modal: '#171A22',
    card: '#1B1E26',
    cardHover: '#1F232C',
    chipDefault: '#1C1F27',
    field: '#14161C',
  },
  border: {
    subtle: '#21242D',
    column: '#22252E',
    header: '#23262F',
    goalCard: '#262A34',
    goalColumn: '#2B303C',
    card: '#272B36',
    cardHover: '#3A4050',
    dashed: '#2C3040',
    field: '#2F3441',
    fieldFocus: '#3C4250',
    checkboxIdle: '#3D4453',
    subtaskDivider: '#262A34',
  },
  text: {
    title: '#F4F5F8',
    body: '#E8E9EF',
    card: '#DFE1E8',
    subtask: '#C2C5CF',
    sectionLabel: '#9AA0B0',
    muted: '#8B909F',
    label: '#7D818F',
    counter: '#6D7180',
    faint: '#5F6472',
    icon: '#565B6A',
    iconMuted: '#4D525F',
  },
  lime: {
    text: '#C8F169',
    textStrong: '#8FD13F',
    textMuted: '#93A86A',
    onLime: '#16200A',
    surfaceDone: '#1A2013',
    surfaceGoalHover: '#222A15',
    surfaceLevelPanel: '#232D14',
    trackBg: '#23281A',
    border: '#2F3A1E',
    gradient: 'linear-gradient(90deg, #8FD13F, #C8F169)',
    barToday: 'linear-gradient(180deg, #C8F169, #8FD13F)',
    personalBorder: '#3A4A20',
    personalSurface: '#232D14',
  },
  amber: {
    text: '#F2C14E',
    textHover: '#FFD47A',
    label: '#D8A45C',
    surface: '#241D12',
    track: '#2A2418',
    border: '#3A2F1E',
    borderActive: '#4D3F1C',
    buttonBorder: '#3A3F4D',
  },
  violet: {
    text: '#B98CFF',
    label: '#9F86D6',
    surface: '#1C1730',
    surfaceTag: '#241D38',
    border: '#3D3060',
  },
  coral: {
    text: '#FF7A5C',
    textStrong: '#FF9F6C',
    surface: '#2E1D15',
    border: '#33262A',
    borderTag: '#4D3122',
  },
  blue: {
    text: '#7FC0FF',
    surface: '#16283B',
    border: '#24405E',
  },
  neutral: {
    priorityLow: '#4A505F',
    barTrack: '#2D3342',
    barTrackAlt: '#1E2129',
  },
  panelGradient: {
    focus: 'linear-gradient(140deg, #241D12 0%, #16181F 70%)',
    level: 'linear-gradient(140deg, #1C2314 0%, #16181F 70%)',
  },
} as const;

export const font = {
  heading: "'Space Grotesk', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
} as const;

export const fontSize = {
  xxxl: 40,
  xxl: 26,
  xl: 24,
  lg21: 21,
  lg: 20,
  md17: 17,
  md16: 16,
  md15: 15,
  md14_5: 14.5,
  md: 14,
  sm13: 13,
  sm12_5: 12.5,
  sm: 12,
  xs11_5: 11.5,
  xs: 11,
  xs10_5: 10.5,
  xxs: 8,
} as const;

export const space = {
  three: 3,
  xxs: 4,
  xs1: 6,
  xs2: 7,
  xs3: 8,
  xs4: 9,
  sm1: 10,
  sm2: 12,
  eleven: 11,
  thirteen: 13,
  sm3: 14,
  md1: 16,
  md2: 18,
  md3: 20,
  lg1: 24,
  lg2: 26,
  twentyTwo: 22,
  lg3: 28,
  xl1: 32,
  xl2: 36,
  xl3: 40,
  xl4: 44,
  xl5: 48,
  xxl: 64,
} as const;

export const radius = {
  xs: 4,
  sm1: 5,
  sm2: 6,
  sm3: 8,
  sm4: 9,
  sm5: 10,
  md1: 12,
  lg1: 16,
  lg2: 18,
  pill: 20,
  circle: '50%',
} as const;

export const shadow = {
  modal: '0 30px 80px rgba(0,0,0,.55)',
} as const;

export const transition = {
  xpBar: 'width 420ms ease',
} as const;

export const zIndex = {
  modal: 1000,
} as const;
