# Learn Vietnamese

Vietnamese pronunciation, number, grammar, and relationship practice, with speech playback, recognition, conversation translation, and AI chat.

The app uses React 19, TypeScript, TanStack Start/Router, Tailwind CSS, and Base UI. TanStack AI owns chat streaming and message state. Effect 4 validates external contracts and manages speech requests, cancellation, and browser media resources. Vite+ provides the development toolchain; Nitro runs the server.

Speech settings offer local AI models, native browser speech, and optional server integrations. The right drawer controls Vietnamese speech throughout the app. AI Chat and Live Conversation also have a left AI Settings drawer for English speech, conversation model selection, and optional thinking. Local speech needs no WebGPU. Browser-local chat uses WebLLM with Qwen 3.5 and requires WebGPU; a configured chat server is an alternative. Each inference runtime loads only when needed, and model weights download on first use.

## Development

```sh
vp install
cp .env.example .env
vp dev --port 3000
```

Open <http://localhost:3000>. Leaving the service variables empty allows local speech and browser-local chat on devices with WebGPU. Choose English speech and a conversation model in AI Settings on either conversation page. Browser-local chat defaults to Qwen 3.5 2B; smaller 0.8B and larger 4B options are available. Thinking defaults off and stays off for live translation. Native browser speech support and Vietnamese voice availability vary by browser and operating system. Microphone access requires HTTPS or localhost.

```sh
vp check
vp run test
vp run build
vp run test:ai      # Production browser smoke test with local mock services
vp run test:ai:firefox # Same browser checks in Firefox
vp run test:audio-model # Real MMS playback in Firefox; downloads weights
vp run test:audio-dev # Same inference and playback checks against vp dev
vp run test:chat-models # Real Qwen browser chat; downloads weights, needs WebGPU
vp run test:speech-models # Opt-in Chromium test; downloads original local models
vp run test:speech-additional # Kokoro/VieNeu browser inference and preset asset checks
vp run start
```

The production server reads environment variables at runtime. Supply them through your deployment environment, or start Node with `node --env-file=.env .output/server/index.mjs`. Never use a `VITE_` prefix for provider credentials.

## Configure AI services

Each service has an independent base URL, model, and optional bearer key. TTS also needs a voice. URLs should include the provider's API prefix (usually `/v1`), without the final operation path.

| Environment prefix | Purpose                            | Upstream operation           |
| ------------------ | ---------------------------------- | ---------------------------- |
| `AI_TTS_VN`        | Vietnamese playback                | `POST /audio/speech`         |
| `AI_TTS_EN`        | English playback                   | `POST /audio/speech`         |
| `AI_STT`           | Vietnamese and English recognition | `POST /audio/transcriptions` |
| `AI_CHAT`          | Practice chat and translation      | `POST /chat/completions`     |

For example, a running VieNeu server can provide Vietnamese speech:

```dotenv
AI_TTS_VN_BASE_URL=http://127.0.0.1:8000/v1
AI_TTS_VN_MODEL=vieneu-v3-turbo
AI_TTS_VN_VOICE=voice-id-from-your-server
AI_TTS_VN_API_KEY=
```

Choose a real voice ID from that server's `GET /v1/voices`. See [speech providers and the stack audit](docs/ai-models.md) for Kokoro, VieNeu, and recognition options. See [AI architecture](docs/ai-architecture.md) for request contracts and lifecycle guarantees.

New sessions default to configured server speech where available, otherwise local MMS and PhoWhisper Tiny/Whisper Tiny. Each playback selector mixes native browser voices with local models; recognition likewise mixes native speech recognition with local listeners. Kokoro provides 14 Vietnamese voices and VieNeu provides 25 bilingual preset voices. Original MMS/Piper/PhoWhisper/Whisper selections migrate from the old settings. A selected provider failure is shown explicitly; local recordings are never silently uploaded to a server.

## Project layout

```text
src/features/speech/  Contracts, browser media, settings, local workers, HTTP client
src/features/chat/    Conversation settings, prompts, local worker and TanStack connection
src/server/ai/        Server configuration and provider integrations
src/routes/           Learning pages and same-origin API endpoints
src/components/       Shared controls
src/data/             Learning content
```

## Data handling

Server playback sends text to the configured TTS service. Server recognition sends the recording to the configured STT service. Server chat sends practice history or the current translation utterance to the configured service. Browser-local chat keeps conversations on the device. API keys and endpoint details remain on the server; the server validates selected models against its configured allowlist. Self-hosted services can keep processing on infrastructure you control; hosted services have their own retention policies.

Local AI inference keeps text and microphone audio on the learner's device. Model/runtime downloads use public model hosts and CDNs; browser Cache Storage can reuse downloaded model files. First-use downloads are approximately 400 MB for Vietnamese Kokoro and 300 MB for VieNeu (including their shared pronunciation dictionary and runtime); voice changes reuse cached shared weights. Medium/large recognition models also need substantial storage and memory; Tiny/Base are better starting choices. This does not make the entire app an offline PWA.

Native browser recognition and some browser voices may use remote browser services. The app holds recordings in memory for the active request and does not persist them. Generated server audio is cached in memory for the current page session (up to 64 entries and 20 MiB); reloading clears it. Reload after changing server configuration. Reset speech settings releases Vietnamese speech workers and resets only Vietnamese choices. English and conversation preferences persist independently. Model changes start a fresh conversation, and leaving either conversation module releases chat and English workers. Model files remain cached; use the browser's site-storage controls to reclaim them. Clearing all site data also removes saved preferences and any legacy audio cache.
