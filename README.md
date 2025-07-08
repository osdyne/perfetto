# osdyne trace viewer - System profiling, app tracing and trace analysis

osdyne trace viewer is a production-grade open-source stack for performance
instrumentation and trace analysis based on Perfetto. It offers services and libraries and for
recording system-level and app-level traces, native + java heap profiling, a
library for analyzing traces using SQL and a web-based UI to visualize and
explore multi-GB traces.

## Setup
- dependencies: Node 22, Python 3 (or use the shell.nix)
- run: `npm install && npm run bootstrap`


## Development
- run `npm start`
- open `localhost:5173`
