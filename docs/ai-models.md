# AI Models Guide

Guide to AI models used in the app and how to select them.

## Overview

All models run in your browser. Nothing sent to servers after initial download.

## Text-to-Speech (TTS)

The app supports multiple TTS providers, each with different quality and model size trade-offs:

### MMS (Meta Multilingual Speech)

**Library**: `@huggingface/transformers`

**Models**: Xenova/mms-tts-vie (Vietnamese), Xenova/mms-tts-eng (English)

Text → MMS (VITS-based) neural network → WAV audio

### VITS (Diffusion Studio)

**Library**: `@diffusionstudio/vits-web`

**Models**: Multiple quality options (low/medium) for both Vietnamese and English

Text → VITS neural network → WAV audio

**Vietnamese voices**:

- vi_VN-25hours_single-low (Low Quality)
- vi_VN-vais1000-medium (Medium Quality)
- vi_VN-vivos-x_low (Low Quality)

**English voices**:

- en_US-amy-medium, en_US-hfc_female-medium, en_US-hfc_male-medium
- en_US-lessac-medium, en_US-ryan-medium

### How TTS Works

All TTS models are loaded lazily - the library and models are only downloaded when you select a voice from that provider. First use downloads the model, subsequent uses are cached.

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
