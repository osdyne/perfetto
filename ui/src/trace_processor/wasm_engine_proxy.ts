// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {assertTrue} from '../base/logging';
import {EngineBase} from '../trace_processor/engine';

// let bundlePath: string;
let idleWasmWorker: Promise<Worker>;

export function initWasm(root: string) {
  idleWasmWorker = fetch(root + 'engine_bundle.js')
    .then((result) => result.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      return new Worker(blobUrl);
    })
    .then(async (worker) => {
      const wasmBinary = await fetch(root + 'trace_processor.wasm').then(
        (result) => result.arrayBuffer(),
      );
      worker.postMessage({wasmBinary});

      return worker;
    });
}

/**
 * This implementation of Engine uses a WASM backend hosted in a separate
 * worker thread. The entrypoint of the worker thread is engine/index.ts.
 */
export class WasmEngineProxy extends EngineBase implements Disposable {
  readonly mode = 'WASM';
  readonly id: string;
  private port: MessagePort | null = null;
  private worker: Worker | null = null;

  constructor(id: string) {
    super();
    this.id = id;
  }

  async connect() {
    await idleWasmWorker.then((worker) => {
      const channel = new MessageChannel();
      const port1 = channel.port1;
      this.port = channel.port2;

      this.worker = worker;
      this.worker.postMessage(port1, [port1]);
      this.port.onmessage = this.onMessage.bind(this);
    });
  }

  onMessage(m: MessageEvent) {
    assertTrue(m.data instanceof Uint8Array);
    super.onRpcResponseBytes(m.data as Uint8Array);
  }

  rpcSendRequestBytes(data: Uint8Array): void {
    // We deliberately don't use a transfer list because protobufjs reuses the
    // same buffer when encoding messages (which is good, because creating a new
    // TypedArray for each decode operation would be too expensive).
    if (this.port) {
      this.port.postMessage(data);
    }
  }

  [Symbol.dispose]() {
    this.worker?.terminate();
  }
}
