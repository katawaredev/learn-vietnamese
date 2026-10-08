# Speech providers and stack audit

On 2026-10-09, real Vietnamese MMS inference and playback of `năm` and repeated `mười hai` passed in Firefox against both development and production servers, without hydration or uncaught playback errors. Local speech shares a 16-bit PCM WAV encoder, including MMS, to avoid browser differences in float WAV decoding. Playback unlocks sound in the original click and uses scoped Web Audio buffers to avoid HTML media fetch-abort promises. The regression checks also cover malformed server audio and successful retry of the same word.

Checked on 2026-10-08. Local runtime compatibility has been verified with real Chromium inference for MMS VN/EN, all three Vietnamese Piper voices, Amy, PhoWhisper Tiny and Whisper Tiny, plus Kokoro Diễm Trinh/Mai Linh and VieNeu Minh Quân Pro (VN/EN). All 14 Kokoro voicepacks and 25 VieNeu preset embeddings/reference codes have been downloaded and validated; full inference has been checked for the named voices, not every preset. Medium/Large recognition models have verified ONNX exports but have not been run in this check. No Vietnamese pronunciation/recognition quality benchmark has been performed, and no external credentials are bundled.

## What was obsolete?

The previous app used `@diffusionstudio/vits-web`, Transformers.js, ONNX Runtime Web, and WebLLM, with separate workers and contexts for each runtime. The definite migration signal is in Piper, whose original repository is archived and says [development moved to OHF-Voice/piper1-gpl](https://github.com/rhasspy/piper). The [vits-web README](https://github.com/diffusionstudio/vits-web) still references that older Piper ecosystem. That does not prove every wrapper or model is unsupported.

Transformers.js and ONNX Runtime remain necessary for local speech. The app uses Transformers.js 4.3.1 for MMS and Whisper/PhoWhisper. Piper/VITS, Kokoro and VieNeu use ONNX Runtime Web 1.30.0. Piper uses its existing WASM phonemizer; Kokoro and VieNeu share sea-g2p. Phonemizer WASM assets are bundled by Vite+. These packages load inside separate workers only for the selected engine; they are not imported by the initial UI or SSR. WebLLM 0.2.85 supplies browser-local chat in a single lazy worker, while TanStack AI owns conversation state and streaming for both local and server modes. The obsolete global LLM provider and the unused React Server Components plugin remain removed.

The old vits-web wrapper and the Mintplex fork both consume the phonemizer's fixed global IDs. A real inference check reproduced an out-of-range embedding failure with the legacy 25 Hours voice (130 symbols). The local adapter instead applies each model's own `phoneme_id_map`, following [Piper's padding/start/end rules](https://github.com/rhasspy/piper-phonemize/blob/master/src/phoneme_ids.cpp). Unsupported symbols are skipped as in Piper; the low-quality legacy voice does not gain tone symbols it was never trained on. The app does not depend on the older wrapper or its ONNX Runtime 1.18 compatibility version.

## Available local browser speech

- Vietnamese playback: MMS, 25 Hours (low), VAIS 1000 (medium), Vivos (x-low), 14 Kokoro voices and 25 VieNeu v3-Turbo voices.
- English playback: MMS, 25 bilingual VieNeu voices and 14 Piper voices, including the original Amy, HFC Female/Male, Lessac and Ryan, plus American/British alternatives.
- Vietnamese recognition: PhoWhisper Tiny/Base/Small/Medium/Large and multilingual Whisper Tiny/Base/Small/Medium/Large.
- English recognition: multilingual Whisper Tiny/Base/Small/Medium/Large.

The catalogue pins Hugging Face revisions: MMS/Whisper use q8 ONNX exports, Vietnamese Kokoro uses its published fp32 graph, and VieNeu uses its int8 backbone. CPU/WASM is the compatibility baseline and does not require WebGPU or cross-origin isolation. Medium/Large models may exceed memory limits on some browsers/devices. Inference runs off the UI thread. Switching models terminates the previous worker; Stop terminates an in-flight download or inference. Successfully loaded models stay warm until switched, cancelled, or the app closes. Browser storage reuses downloads where supported; cold starts still need model/runtime hosts. No text or microphone audio is uploaded in local mode.

The production check also exposed an incompatible Nitro nightly installation (`4.0.0-20251010-091516-7cafddba`): its built SSR bridge called global fetch against the incoming URL, looping the request back to the server. The app now pins `nitro@3.0.260903-beta`, the published release used with the [documented TanStack integration](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro). Nitro's Vite integration remains a beta dependency; pinning and testing its production output avoids relying on a moving nightly alias.

## Vietnamese Kokoro and VieNeu in the browser

The [Hangry Labs project](https://github.com/Hangry-Labs/kokoroTTS) is a server with a web UI. Its Vietnamese checkpoint is still useful for browser inference: the app runs the [ContextBoxAI ONNX model](https://huggingface.co/contextboxai/Kokoro-Vietnamese) directly with its vocabulary and all 14 published voice packs. The standard English Kokoro.js pipeline does not match this checkpoint. The adapter reads numeric storage from the PyTorch ZIP voicepacks without executing pickle metadata, applies vig2p 0.1.2's vocabulary/tone adaptation, runs ONNX locally, and joins sentence audio at 24 kHz.

The [VieNeu comment](https://github.com/pnnbao97/VieNeu-TTS/issues/2#issuecomment-4642583350) announces the exports needed for a browser port. This app implements that port using the [v3-Turbo ONNX engine](https://github.com/pnnbao97/VieNeu-TTS/blob/main/src/vieneu/_v3_turbo_engine/onnx_runtime_lite.py) as the reference: byte-level BPE phoneme tokenization, preset speaker anchoring/reference codes, int8 prefill/decoding with KV caches, acoustic codebook sampling, a sliding repetition window and short-utterance frame cap, then the MOSS decoder at 48 kHz. It offers the 25 preset IDs present in the pinned model's manifest, in Vietnamese and English. Preset playback is the scope of this adapter; it does not implement voice cloning or the upstream streaming server.

Both reuse upstream [sea-g2p](https://github.com/pnnbao97/sea-g2p)'s Vietnamese/English normalization and pronunciation rules, compiled to a bundled 3.4 MB WebAssembly module. The only upstream modifications are in-memory dictionary loading, sequential batch scheduling and a small allocation/init ABI. Rebuild with `python scripts/speech/build-phonemizer.py` (Rust and `wasm32-unknown-unknown` required only for rebuilding). The generated binary is in `src/features/speech/local/assets/`; Vite gives it a content-hashed URL so model caching cannot retain an older phonemizer after an update. The normal application build needs neither Rust nor Python. The dictionary and model files download directly to the browser on first use; synthesis sends no text to a server. Cold downloads are approximately 400 MB for Kokoro and 300 MB for VieNeu, including runtime/dictionary, and shared files are cached across voice choices.

Pinned assets:

- Kokoro: `contextboxai/Kokoro-Vietnamese@9f210d622209fcc216fe2ac6159fed2ff381cb8a`.
- VieNeu: `pnnbao-ump/VieNeu-TTS-v3-Turbo@61b85e3d937fbbacb387714180e8182823512523`, `onnx_int8/` and `gguf/voices/` preset data.
- MOSS decoder: `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX@ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae`.
- sea-g2p 0.10.0: `e825173f235d08ea19315b2b279fb11153b44cea`.

ONNX session creation is serialized inside a worker: ORT's external-data mount state is module-global, and simultaneous creates can lose a graph's shared weight file. Downloads remain concurrent. Preset changes terminate the prior worker and release its memory; cached weights survive. There is no fallback upload when local inference fails.

The services below remain optional alternatives for machines where browser inference is unsuitable.

### KokoroTTS

Follow the [upstream deployment instructions](https://github.com/Hangry-Labs/kokoroTTS). A published CPU image is:

```sh
docker run -p 7860:7860 -v kokorotts_data:/app/persistent \
  hangrylabs/kokorotts:v1.0@sha256:5afef5b9f3d779e56248992274d46a66c0715110eb09e47e1332c39951361f24
```

Configure `AI_TTS_VN_BASE_URL=http://127.0.0.1:7860/v1`, `AI_TTS_VN_MODEL=kokoro`, and a Vietnamese voice ID from `GET /tts/voices`. If the server uses `KOKOROTTS_API_KEY`, put the same key in `AI_TTS_VN_API_KEY`. Its English voices can independently supply `AI_TTS_EN`; the documented `af_heart` voice is English.

### VieNeu-TTS

In a VieNeu checkout, follow its [speech server instructions](https://github.com/pnnbao97/VieNeu-TTS/blob/main/docs/streaming.md):

```sh
uv run python -m apps.openai_speech
# Or use its documented CPU Docker profile:
docker compose -f docker/docker-compose.yml --profile api-cpu up
```

Configure `AI_TTS_VN_BASE_URL=http://127.0.0.1:8000/v1`, model `vieneu-v3-turbo`, and a voice from `GET /v1/voices`. If `VIENEU_API_KEY` is enabled, set the corresponding app key. Run the service separately from the app; configure the service hostname instead of localhost when they occupy different containers.

## STT and chat

Recognition accepts an OpenAI-compatible multipart transcription endpoint. The app uploads the browser's native recording format with an appropriate filename, passes `language=vi` or `en`, and expects `{ "text": "..." }`. A self-hosted Whisper service or hosted transcription provider can fill this contract. Neither TTS candidate is a recognition provider. Confirm that the selected STT server accepts the format produced by your target browsers: WebM/Opus, Ogg/Opus, or MP4. Server transcription preserves the encoded recording; local recognition decodes/resamples in the browser.

Chat supports browser-local inference and TanStack AI's [OpenAI-compatible adapter](https://tanstack.com/ai/latest/docs/adapters/openai) for a configured local or hosted server. Provider endpoints and credentials are server-owned. Clients can select only a model in the server's allowlist; they cannot change URLs, credentials, tools, or generation parameters. No tools are enabled. Both transports share validated prompts and TanStack message state.

## Local conversation models

Checked on 2026-10-09 against the released WebLLM 0.2.85 catalogue and primary model documentation. The browser selector offers [Qwen 3.5](https://huggingface.co/Qwen/Qwen3.5-2B) in 4-bit quantization: 2B as a practical starting choice, 0.8B for smaller downloads, and 4B for machines with more memory. This is an engineering default based on footprint and multilingual support, not a measured English/Vietnamese quality ranking. Evaluate tone marks, pronouns, natural translations, and learner corrections on your target devices before selecting a permanent default.

[WebLLM's published catalogue](https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/config.ts) estimates GPU memory at approximately 1.7 GB / 2.3 GB / 3.9 GB for these models with a 4096-token context. Devices without `shader-f16` automatically use the compatible `q4f32_1` variant, which needs more memory. Runtime, weights and compiled model libraries load on the first message; weights are cached by WebLLM. Only the worker imports the inference runtime. Selecting a model opens no worker and downloads no weights.

The real Qwen 0.8B check loaded the model and began a Vietnamese reply on this test machine's software WebGPU adapter, but exceeded the ten-minute limit before completing. Completed local conversation inference and its latency still need verification on a hardware GPU. Worker streaming, warm reuse, cancellation and reasoning separation pass automated contract tests; these are not model quality benchmarks. Prefer a native local server on machines where browser inference is slow.

One warm worker serves successive messages. Stop, failures, timeouts, model switches and leaving the module terminate the worker to release GPU allocations. Practice keeps up to nine recent messages within a 3500-character input budget; older displayed messages stay in the UI. Live translation passes only the current utterance and turns thinking off. Practice can enable thinking, with a bounded output budget; reasoning is separated from text so it is never spoken as an answer. No local failure uploads a conversation to a server.

For more capable hardware, start with Qwen 3.5 4B or 9B in [Ollama](https://ollama.com/library/qwen3.5), LM Studio or llama.cpp. For a language-focused comparison, [Sailor2 8B Chat](https://huggingface.co/sail/Sailor2-8B-Chat) was specifically continued-trained for English and Southeast Asian languages including Vietnamese. It is based on Qwen 2.5 and is older than Qwen 3.5; being specialized does not establish that it is better. Use its GGUF quantization in a compatible local server and add the exact installed model ID to `AI_CHAT_MODELS`.

Example for an Ollama service running alongside the app:

```sh
ollama pull qwen3.5:4b
ollama pull qwen3.5:9b
ollama serve
```

```dotenv
AI_CHAT_BASE_URL=http://127.0.0.1:11434/v1
AI_CHAT_MODEL=qwen3.5:4b
AI_CHAT_MODELS=qwen3.5:9b
AI_CHAT_THINKING=ollama
```

Restart the app server after changing configuration. The model selector includes the default model and comma-separated additional installed IDs; the app does not download server models. `AI_CHAT_THINKING=ollama` maps thinking to the documented [reasoning_effort control](https://docs.ollama.com/api/openai-compatibility); `qwen` instead sends `chat_template_kwargs.enable_thinking` for compatible Qwen servers such as vLLM. Leave it empty for servers or allowlisted models without these controls. A model ID can identify a Sailor2 GGUF served by llama.cpp; use that server's exact alias, not an assumed Ollama tag. Hosted app servers need a reachable private service hostname instead of the learner's localhost.

## Evaluation before selecting defaults

Compare both TTS candidates with identical Vietnamese phrases: all six tones, minimal pairs, numbers/dates/currency, punctuation, longer sentences, and northern/southern pronunciation relevant to your lessons. Measure first request and warm latency on the intended hardware and listen for tone accuracy and clarity. Test STT with clean native speech, learner accents, and silence; recognition accuracy alone does not measure pronunciation quality.

The app can switch services by configuration without another UI or runtime rewrite. Choose permanent voices after this listening comparison. Service availability advertised by the app means valid configuration, not an upstream health check.
