const loadFile = (url) => fetch(url).then((res) => res.arrayBuffer());

const timeout = (seconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });

const chunkPath = (counter: number) =>
  `assets/data/trace_part${counter.toString().padStart(3, '0')}.pb`;

import { AppImpl } from '../../ui/src/core/app_impl';

window.addEventListener('perfetto_loaded', async (event: Event) => {
  const { detail: app } = event as CustomEvent<AppImpl>;

  for (let i = -1; i <= 16; i++) {
    const buffer = await loadFile(chunkPath(i));
    console.log(chunkPath(i), buffer);
    app.streamTraceFromBuffer({ buffer, title: 'Stream' });
    await timeout(1);
  }
});
