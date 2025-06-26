import { AppImpl } from '../../ui/src/core/app_impl';

window.addEventListener('perfetto_loaded', (event: Event) => {
  const { detail: app } = event as CustomEvent<AppImpl>;
  fetch('assets/data/trace.pb')
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      app.openTraceFromBuffer({ buffer, title: 'File' });
    });
});
