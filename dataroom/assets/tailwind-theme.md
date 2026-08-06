# Tailwind theme (clone) — pakai di `tailwind.config`

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2e7d32', dark: '#1b5e20', light: '#eaf3ea' }, // green 800
        egg: '#FBC02D',        // accent kuning telur
        sidebar: { text: '#244233', border: '#dce5dc' },
        heading: '#15281f',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#166534',
      },
    },
  },
}
```

## Logo mark (JSX, lucide-react)
```jsx
import { Egg } from 'lucide-react';
export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
      <Egg className="w-6 h-6 text-egg" />
    </div>
    <div className="leading-tight">
      <div className="font-bold text-heading">GEMATI</div>
      <div className="text-xs text-slate-500">Pagerwojo</div>
    </div>
  </div>
);
```

## Badge helper
```jsx
const badge = {
  aktif:      'bg-green-100 text-green-800',
  disetujui:  'bg-green-100 text-green-800',
  menunggu:   'bg-amber-100 text-amber-800',
  nonaktif:   'bg-red-100 text-red-800',
  ditolak:    'bg-red-100 text-red-800',
  roleAdmin:  'bg-purple-100 text-purple-700',
  rolePpkbd:  'bg-blue-100 text-blue-700',
  roleKader:  'bg-amber-100 text-amber-700',
};
```

## Dark mode tokens
`body: #0b140f`, `card: #0f1a14`, `heading: #e8eee8`, input `#0b140f`. Toggle simpan di `localStorage.gemati_theme` (`light`/`dark`), set class `.dark` di `<html>`.
