/**
 * Launch the user's mail app reliably, even on repeated clicks.
 *
 * - Top-frame mailto navigations get blocked by Chromium's anti-flood protection
 *   ("user gesture is required") after the first launch.
 * - Hidden iframes don't work: a frame created after the click has no user activation.
 *
 * So we open a NEW TAB for the mailto URL — it carries the click's user activation,
 * which is the one path that always launches. The tab stays blank after the mail
 * app opens, so we clean it up after a generous delay (long enough that we never
 * race the "Open Outlook?" confirmation — killing the tab mid-negotiation aborts
 * the launch entirely).
 */
export const openMailApp = (email: string) => {
  const mailto = `mailto:${email}`;

  const win = window.open(mailto, '_blank');
  if (!win) {
    // Popup blocked — fall back to the standard top-frame navigation
    window.location.href = mailto;
    return;
  }

  window.setTimeout(() => {
    try { win.close(); } catch { /* already closed */ }
  }, 30000);
};
