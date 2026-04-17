import { downloadTrace } from "./utils";

window.addEventListener('load', () => {
  const app = document.getElementById('app');
  (window as any)
    .loadPerfetto(app, {
      rootUrl: '/perfetto/',
      initialState: { sidebarVisible: false, showFileHandling: false }
    })
    .then((app) => {
      fetch('assets/data/trace.pb')
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          app.openTraceFromBuffer({ buffer, title: 'File' });
        });

        app.onDownload(downloadTrace);
    });
});
