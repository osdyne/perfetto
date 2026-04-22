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
let idleWasmWorker: Worker | null;

export async function initWasm(root: string): Promise<void> {
  const bundleResult = await fetch(root + 'engine_bundle.js');

  if (!bundleResult.ok) {
    throw new Error(`Failed to fetch engine_bundle.js: ${bundleResult.status} ${bundleResult.statusText}`);
  }
  
  const worker = new Worker(URL.createObjectURL(await bundleResult.blob()));

  try {
    // Compile on the main thread while the worker is starting up.
    const wasmModule = await WebAssembly.compileStreaming(
      fetch(root + 'trace_processor.wasm')
    );

    worker.postMessage({wasmModule});

    // Wait for the worker to signal WASM bridge initialization
    await new Promise<void>((resolve, reject) => {
      worker.addEventListener('message', (msg: MessageEvent) => {
        if (msg.data?.ready) { 
          resolve();
        } else if (msg.data?.error) {
          reject(new Error(msg.data.error));
        }
      }, {once: true});
    });

    idleWasmWorker = worker;
  } catch (err: unknown) {
    worker.terminate();
  
    console.error('Failed to initialize WASM bridge:', err);
  }
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

    if (!idleWasmWorker) throw new Error('Worker failed to initialize. Check previous errors.');
    
    const channel = new MessageChannel();
    const port1 = channel.port1;
    this.port = channel.port2;

    this.worker = idleWasmWorker;
    this.worker.postMessage(port1, [port1]);
    this.port.onmessage = this.onMessage.bind(this);
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
