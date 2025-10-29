# AI Models Guide

Guide to AI models used in the app and how to select them.

## Overview

All models run in your browser. Nothing sent to servers after initial download.

## Text-to-Speech (TTS)

**Library**: `@huggingface/transformers`

**Models**: Xenova/mms-tts-vie (Vietnamese), Xenova/mms-tts-eng (English)

### How TTS Works

Text → MMS (VITS-based) neural network → WAV audio

First use downloads model. Subsequent uses are cached.

## Speech-to-Text (STT)

**Library**: `@huggingface/transformers`

### How STT Works

Audio recording → Float32Array → Whisper/PhoWhisper → Text

Model loads on first use, cached afterward.

## Language Models (LLM)

**Library**: `@mlc-ai/web-llm`

**Requirements**: WebGPU support (Chrome 113+, Edge 113+, Safari 18+)

**Models**: Small language models compatible with available VRAM

**Use cases**:

- Translation with context
- Conversation practice
- Grammar explanations

Available models update with WebLLM library versions.

### Thinking Mode

Shows model's reasoning process before answer. Slower but can provide better results.

## Model Caching

All models cached by browser after first download.

**Clear cache**: Browser DevTools → Application → Clear site data

Models update when you update app dependencies.

## Troubleshooting

### TTS Issues

**No audio**: Check browser console, verify not muted, try different voice

**Robotic audio**: Expected for some voices/text

### STT Issues

**No transcription**: Check mic permissions, ensure quiet environment

**Wrong transcription**: Try larger model, use PhoWhisper for Vietnamese, speak clearly

### LLM Issues

**WebGPU not supported**: Update browser or use TTS/STT only

**Model fails to load**: Close other apps (free VRAM), try smaller model

**Slow**: Expected for larger models, try smaller model or disable thinking mode

## Further Reading

- [MMS: Scaling Speech Technology to 1000+ Languages](https://arxiv.org/abs/2305.13516)
- [VITS Paper](https://arxiv.org/abs/2106.06103)
- [Whisper Paper](https://arxiv.org/abs/2212.04356)
- [PhoWhisper](https://github.com/VinAIResearch/PhoWhisper)
- [WebLLM Docs](https://webllm.mlc.ai/)
