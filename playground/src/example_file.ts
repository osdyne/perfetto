(window as any).loadPerfetto('/perfetto/').then(app => {
  fetch('assets/data/trace.pb')
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      app.openTraceFromBuffer({ buffer, title: 'File' });
    });
});
