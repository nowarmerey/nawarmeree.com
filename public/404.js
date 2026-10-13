// Show the path the visitor asked for inside the "ping" line (textContent only — never parsed as HTML).
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('nfPath');
  if (!el) return;
  let path = window.location.pathname;
  try { path = decodeURIComponent(path); } catch { /* malformed escape: show it raw */ }
  el.textContent = path.slice(0, 80);
});
