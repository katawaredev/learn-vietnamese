# Web Workers Deep Dive

How Web Workers are used and why they're critical for performance.

## Why Web Workers?

JavaScript is single-threaded. ML models on main thread = frozen UI.

**Solution**: Offload to Web Workers (background threads).

## Worker Types

The app uses separate workers for different TTS providers, loaded lazily only when needed.

### TTS MMS Worker (`src/workers/tts-mms-worker.ts`)

Converts text → audio using MMS (VITS-based) models via transformers.js.

```ts
// Receives
{ type: "predict", text: "Xin chào", modelId: "Xenova/mms-tts-vie" }

// Returns
{ status: "complete", audio: Blob }
```

Runs entirely in WebAssembly via ONNX Runtime. Progress events for UI feedback.

### TTS VITS Worker (`src/workers/tts-vits-worker.ts`)

Converts text → audio using VITS models from @diffusionstudio/vits-web.

```ts
// Receives
{ type: "predict", text: "Xin chào", voiceId: "vi_VN-vais1000-medium" }

// Returns
{ status: "complete", audio: Blob }
```

Lazy-loaded only when user selects a VITS voice. Each provider has its own worker pool to avoid loading unused libraries.

### STT Worker (`src/workers/stt-worker.ts`)

Converts audio → text using Whisper/PhoWhisper.

```ts
// Initialize
{ type: "init", modelPath: "...", language: "vn" }

// Transcribe
{ type: "transcribe", audio: Float32Array, language: "vn" }

// Returns
{ status: "complete", text: "Xin chào" }
```

Uses Transformers.js + ONNX Runtime (WebAssembly backend).

### LLM Worker (`src/workers/llm-worker.ts`)

Language model inference using WebGPU.

```ts
// Initialize
{ type: "init", config: { modelId: "...", thinkingEnabled: true } }

// Generate (streaming)
{ type: "generate", messages: [...] }

// Streams
{ status: "stream", text: "...", isComplete: false }
```

Requires WebGPU. Streams tokens for instant feedback.

## Worker Pool Pattern

Each TTS provider has its own singleton worker pool to enable code splitting:

```tsx
// src/workers/tts-mms-worker-pool.ts (for MMS)
class TTSMMSWorkerPool {
  private worker: Worker | null = null;
  private cache = new Map();
  private requestQueue = [];

  async generateAudio(text, modelId) {
    if (this.cache.has(key)) return cached;

    return new Promise((resolve) => {
      this.requestQueue.push({ text, modelId, resolve });
      this.processQueue();
    });
  }
}

export const ttsMMSPool = new TTSMMSWorkerPool();

// src/workers/tts-vits-worker-pool.ts (for VITS)
export const ttsVitsPool = new TTSVitsWorkerPool();
```

Components use the appropriate pool based on provider:

```tsx
// Lazy-loaded components use their specific pool
const audio = await ttsMMSPool.generateAudio(text, modelId);     // MMS
const audio = await ttsVitsPool.generateAudio(text, voiceId);    // VITS
```

One worker per provider for entire app, not per component. Providers only load when selected.

## Worker Lifecycle Management

### React Strict Mode Challenge

Strict Mode mounts twice in development:

```txt
Mount 1 → Unmount 1 → Mount 2
```

Problem: First unmount kills worker loading model.

Solution: Module-scoped worker + mount counter:

```tsx
let sharedWorker: Worker | null = null;
let workerMountCount = 0;

useEffect(() => {
  if (sharedWorker) {
    worker.current = sharedWorker;
  } else {
    worker.current = new Worker(...);
    sharedWorker = worker.current;
  }
  workerMountCount++;

  return () => {
    workerMountCount--;
    setTimeout(() => {
      if (workerMountCount === 0) {
        sharedWorker?.terminate();
        sharedWorker = null;
      }
    }, 100);
  };
}, []);
```

Worker survives Strict Mode remount.

### Navigation Cleanup

Workers terminate when navigating away from routes.

Frees GPU memory when leaving chat/conversation routes.

## Message Passing

### Transferable Objects

**Bad** (copies data):

```ts
worker.postMessage({ audio: float32Array });
// 2× memory
```

**Good** (transfers ownership):

```ts
worker.postMessage({ audio: float32Array }, [float32Array.buffer]);
// 1× memory
```

### Progress Events

```ts
// Worker
self.postMessage({ status: "progress", progress: 0.5 });

// Component
worker.onmessage = (event) => {
  if (event.data.status === "progress") {
    setLoadingProgress(event.data.progress);
  }
};
```

### Error Handling

```ts
// Worker
try {
  const result = await operation();
  self.postMessage({ status: "complete", result });
} catch (error) {
  self.postMessage({ status: "error", error: error.message });
}
```

## Worker Pool Details

### Request Queueing

One request at a time (prevents model thrashing):

```ts
private processQueue() {
  if (this.activeRequest || this.requestQueue.length === 0) return;

  this.activeRequest = this.requestQueue.shift()!;
  this.worker!.postMessage({ /* ... */ });
}
```

### LRU Cache

Evicts least recently used when over limit:

```ts
private evictOldCache() {
  if (this.cache.size <= MAX_SIZE) return;

  const sorted = Array.from(this.cache.entries())
    .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

  const toRemove = this.cache.size - MAX_SIZE;
  for (let i = 0; i < toRemove; i++) {
    const [key, entry] = sorted[i];
    URL.revokeObjectURL(entry.blobUrl);
    this.cache.delete(key);
  }
}
```

### Blob URL Lifecycle

Must revoke to prevent memory leaks:

```ts
const blobUrl = URL.createObjectURL(audioBlob);
this.cache.set(key, { audio, blobUrl, lastUsed: Date.now() });

// Later, when evicting:
URL.revokeObjectURL(entry.blobUrl);
```

## Best Practices

1. **Use worker pools** - Never create workers in components
2. **Terminate on unmount** - With mount counter for Strict Mode
3. **Revoke blob URLs** - When removing from cache
4. **Transfer large data** - Use transferable objects
5. **Report progress** - For long operations
6. **Handle errors** - Workers can fail
7. **Bound queues** - Limit concurrent requests
8. **Cache smartly** - LRU with size limits

## Debugging

### Chrome DevTools

Sources tab → Threads sidebar → See all workers

Set breakpoints in worker code.

### Console Logging

```ts
console.log("Worker message"); // Shows with "Worker" prefix
```

### Performance

```ts
performance.mark("start");
await work();
performance.mark("end");
performance.measure("work", "start", "end");
```

## Further Reading

- [MDN: Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN: Transferable Objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
