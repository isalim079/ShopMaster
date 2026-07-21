export type ServerTheme = 'LIGHT' | 'DARK';

export type UserSettings = {
  theme: ServerTheme;
};

export type UpdateUserSettingsInput = {
  theme: ServerTheme;
};
