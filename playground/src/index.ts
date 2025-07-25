
window.addEventListener('load', () => {
  const container = document.getElementById('app');
  (window as any).loadPerfetto(container, {
    rootUrl: '/perfetto/',
    initialState: { sidebarVisible: true, showFileHandling: true }
  });
});
