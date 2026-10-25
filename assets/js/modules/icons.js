/* Icon SVG inline (tĩnh, do site định nghĩa) */
const s = (body, vb = '0 0 24 24', extra = '') =>
  `<svg viewBox="${vb}" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;
const line = (d) => s(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);

export const ICONS = {
  facebook: s('<path fill="currentColor" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6V21h2.9z"/>'),
  gmail: s('<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3.5 6.5h17v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="m3.8 7 8.2 6.2L20.2 7"/>'),
  tiktok: s('<path fill="currentColor" d="M16.6 3h-3v11.9a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.3a5.6 5.6 0 1 0 4.8 5.6V9.1a7.3 7.3 0 0 0 4.3 1.4V7.6a4.3 4.3 0 0 1-4.3-4.3z"/>'),
  prev: line('M15 5l-7 7 7 7'),
  next: line('M9 5l7 7-7 7'),
  close: line('M6 6l12 12M18 6L6 18'),
  play: s('<path fill="currentColor" d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.3-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z"/>'),
  pause: s('<rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor"/><rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor"/>'),
  skip: s('<path fill="currentColor" d="M5 6v12a.7.7 0 0 0 1.1.6l8.6-6a.7.7 0 0 0 0-1.2L6.1 5.4A.7.7 0 0 0 5 6z"/><rect x="16.5" y="5" width="2.6" height="14" rx="1" fill="currentColor"/>'),
  volume: line('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11'),
  mute: line('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5'),
  list: line('M4 7h11M4 12h11M4 17h7M18 15.5V6l3 1.2M18 15.5a2 2 0 1 1-2-2'),
  phone: line('M5 4.5h3.2l1.6 4-2 1.3a10 10 0 0 0 6.4 6.4l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 6.1A1.5 1.5 0 0 1 5 4.5z'),
  zalo: line('M12 4c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4L6 20l3.6-2.1c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.1 8.5-7S16.7 4 12 4zM8.5 9.5h3.2l-3.2 4h3.2M14 9.5v4M14 13.5h2'),
  copy: line('M9 9h10v11H9zM5 15V4h10'),
  external: line('M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'),
  image: line('M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5a1.5 1.5 0 1 0 0-.01'),
  check: line('M5 12.5l4.5 4.5L19 7.5'),
  cancer: s('<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="7" cy="9.2" r="2.6"/><path d="M7 6.6C10.5 3.6 17 4 20.5 7.6"/><circle cx="17" cy="14.8" r="2.6"/><path d="M17 17.4C13.5 20.4 7 20 3.5 16.4"/></g>'),
  spark: s('<path fill="currentColor" d="M12 2.5l1.6 6.2 6.2 1.6-6.2 1.6L12 18.1l-1.6-6.2-6.2-1.6 6.2-1.6z"/>'),
  send: line('M3.5 11.2 20.5 4l-4.2 16-5-6-5.3 3.2 1.5-6zM7 11.2 20.5 4'),

  /* —— Dịch vụ Thuyền Rồng —— */
  cruise: s(`<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 40c6-2 12 2 18 0s12-2 18 0 10 2 12 0"/><path d="M10 48c6-2 12 2 18 0s12-2 18 0"/>
    <path d="M12 33h40l-5 6H17z"/><path d="M16 33v-9h22l5 9"/><path d="M22 24v-6h10v6"/>
    <path d="M52 33c3-4 2-9-1-11 3 0 5 2 5 2"/><circle cx="51" cy="20" r="1.2" fill="currentColor"/>
    <path d="M44 12a4 4 0 1 0 6-3 5 5 0 1 1-6 3z" opacity=".7"/></g>`, '0 0 64 64'),
  dinner: s(`<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 34h44a22 22 0 0 1-44 0z"/><path d="M6 34h52"/><path d="M26 56h12"/>
    <path d="M24 26c-2-3 2-5 0-8M32 26c-2-3 2-5 0-8M40 26c-2-3 2-5 0-8" opacity=".7"/>
    <path d="M44 10l10 20M50 8l8 18"/></g>`, '0 0 64 64'),
  party: s(`<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 34h36v20H14z"/><path d="M14 42c4 3 8 3 12 0s8-3 12 0 8 3 12 0"/>
    <path d="M22 34v-6M32 34v-6M42 34v-6"/><path d="M22 24c-1.5-2 1.5-3 0-5M32 24c-1.5-2 1.5-3 0-5M42 24c-1.5-2 1.5-3 0-5" opacity=".8"/>
    <path d="M8 12l3 3M56 12l-3 3M32 4v4M12 26l-4 1M52 26l4 1" opacity=".7"/></g>`, '0 0 64 64'),
  cahue: s(`<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 30L32 12l24 18z"/><path d="M18 30c2 3 6 5 14 5s12-2 14-5" opacity=".7"/>
    <path d="M40 54V40l12-3v14"/><circle cx="37" cy="54" r="3"/><circle cx="49" cy="51" r="3"/>
    <path d="M14 44c2-2 4 2 6 0s4 2 6 0" opacity=".7"/></g>`, '0 0 64 64'),

  /* —— Danh mục Order —— */
  fashion: line('M8 4l4 2 4-2 4 4-3 3v9H7v-9L4 8z'),
  beauty: line('M10 3h4v5h-4zM8.5 8h7l-1 13h-5zM9 13h6'),
  home: line('M4 11l8-6 8 6M6 9.5V20h12V9.5M10 20v-5h4v5'),
  tech: line('M4 6h16v10H4zM2.5 19h19M10 13h4'),
  collect: line('M5 9h14v11H5zM3.5 6h17v3h-17zM12 6v14M12 6c-1-3-5-3-4 0M12 6c1-3 5-3 4 0'),
  search: line('M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20'),
};
