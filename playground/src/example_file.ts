const app = document.getElementById("app");
(window as any).loadPerfetto(app, { rootUrl: '/perfetto/'}).then(app => {
  fetch('assets/data/trace.pb')
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      app.openTraceFromBuffer({ buffer, title: 'File' });
    });
});
