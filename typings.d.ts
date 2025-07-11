export interface PostedTrace {
  buffer: ArrayBuffer;
  title: string;
  fileName?: string;
  url?: string;
  uuid?: string;
  localOnly?: boolean;
  keepApiOpen?: boolean;
  pluginArgs?: {
    [pluginId: string]: {
      [key: string]: unknown;
    };
  };
}

export class AppImpl {
  openTraceFromBuffer(postMessageArgs: PostedTrace): void;
  streamTraceFromBuffer(postMessageArgs: PostedTrace): Promise<void>;
}

declare global {
  interface Window {
    loadPerfetto: (root: string) => Promise<AppImpl>;
  }
}
