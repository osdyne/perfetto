window.addEventListener("load", () => {
  (window as any).loadPerfetto({
    rootUrl: '/perfetto/',
    initialState: { sidebarVisible: true, showFileHandling: true }
  });
});
