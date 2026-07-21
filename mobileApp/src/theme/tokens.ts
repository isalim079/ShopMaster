export const colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceDim: '#F1F5F9',
    foreground: '#0F172A',
    muted: '#64748B',
    disabled: '#CBD5E1',
    border: '#E2E8F0',
    divider: '#F1F5F9',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceDim: '#334155',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    disabled: '#475569',
    border: '#334155',
    divider: '#1E293B',
  },
  brand: {
    primary: '#059669',
    primaryLight: '#34D399',
    primaryDark: '#047857',
    primaryContainer: '#D1FAE5',
    secondary: '#0D9488',
    accent: '#65A30D',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',
  },
} as const;

export const spacing = {
  '0.5': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const fontFamily = {
  sans: ['System'],
  'sans-medium': ['System'],
  'sans-semibold': ['System'],
  'sans-bold': ['System'],
} as const;

export const fontSize = {
  'display-lg': ['36px', { lineHeight: '44px' }],
  display: ['32px', { lineHeight: '40px' }],
  'headline-lg': ['28px', { lineHeight: '36px' }],
  headline: ['24px', { lineHeight: '32px' }],
  'title-lg': ['22px', { lineHeight: '28px' }],
  title: ['18px', { lineHeight: '24px' }],
  'body-lg': ['16px', { lineHeight: '24px' }],
  body: ['14px', { lineHeight: '20px' }],
  caption: ['12px', { lineHeight: '16px' }],
  label: ['12px', { lineHeight: '16px' }],
  button: ['14px', { lineHeight: '20px' }],
} as const;
