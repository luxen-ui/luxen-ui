// The showcase themes' behavior, shared by the head script in config.js (which
// re-applies the saved theme before first paint) and ThemePicker.vue (which
// renders the menu). Each theme's CSS lives next to this file.

export const STORAGE_KEY = 'luxen-docs-theme';

// Google Fonts families each theme needs beyond the site's own (Inter,
// JetBrains Mono). Loaded only once a visitor picks that theme.
export const THEME_FONTS = {
  brutalist: 'family=Space+Grotesk:wght@400..700',
  coral: 'family=DM+Sans:opsz,wght@9..40,400..700',
  midnight: '',
  editorial: 'family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1',
};

export const fontHref = (families) => `https://fonts.googleapis.com/css2?${families}&display=swap`;

// Pages that document token defaults: a showcase theme would contradict them.
export const UNTHEMED_PATH = /\/overview\/design-tokens(?:\.html)?$/;

export const isTheme = (value) => Object.hasOwn(THEME_FONTS, value);

// Inlined in <head>. Kept to plain ES5 so it runs before anything else loads.
export const headScript = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)}),f=${JSON.stringify(
  Object.fromEntries(
    Object.entries(THEME_FONTS).map(([name, families]) => [name, families && fontHref(families)]),
  ),
)};if(Object.prototype.hasOwnProperty.call(f,t)&&!${UNTHEMED_PATH}.test(location.pathname)){document.documentElement.dataset.theme=t;if(f[t]){var l=document.createElement('link');l.rel='stylesheet';l.href=f[t];document.head.append(l)}}}catch(e){}`;
