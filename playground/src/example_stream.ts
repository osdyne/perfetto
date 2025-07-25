const loadFile = (url) => fetch(url).then((res) => res.arrayBuffer());

const timeout = (seconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });

const chunkPath = (counter: number) =>
  `assets/data/trace_part${counter.toString().padStart(3, '0')}.pb`;

const container = document.getElementById("app");

(window as any).loadPerfetto(container, { rootUrl: '/perfetto/'}).then(async app => {
  for (let i = 0; i <= 16; i++) {
    const buffer = await loadFile(chunkPath(i));
    console.log(chunkPath(i), buffer);
    app.streamTraceFromBuffer({ buffer, title: 'Stream' });
    await timeout(1);
  }
});
