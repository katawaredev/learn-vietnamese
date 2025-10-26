# Learn Vietnamese

Interactive Vietnamese language learning app powered by client-side AI. Everything runs in your browser - no backend required. Web Speech API fallback (requires external services)

## Features

- **Text-to-Speech**: Neural voices (VITS) + Web Speech API fallback
- **Speech-to-Text**: Whisper/PhoWhisper models + Web Speech API fallback
- **AI Translation**: Context-aware Vietnamese ↔ English translation
- **Pronunciation Practice**: Vowels, consonants, tones
- **Number Practice**: Vietnamese counting
- **Conversation Mode**: Two-way translation with formality context
- **AI Chat**: Conversational practice with LLM

## Tech Stack

**Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS

**AI Models** (client-side):

- **TTS**: VITS neural voices via `@diffusionstudio/vits-web`
- **STT**: Whisper/PhoWhisper via `@huggingface/transformers`
- **LLM**: Small language models via `@mlc-ai/web-llm` (WebGPU)
- **Fallback**: Web Speech API when AI unavailable

**Infrastructure**: Web Workers for background processing, worker pools to prevent memory leaks

### AI vs Web Speech

Components intelligently route between AI and Web Speech.

Users can select provider in settings. AI provides better quality; Web Speech provides instant availability.

## Quick Start

```bash
git clone https://github.com/katawaredev/learn-vietnamese.git
cd learn-vietnamese
bun install  # or npm install
bun dev      # or npm run dev
```

Open <http://localhost:3000>

**Note**: AI models download on first use. Web Speech API works immediately as fallback.

## Browser Requirements

- **TTS/STT**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **LLM**: WebGPU support required (Chrome 113+, Safari 18+, Edge 113+)

Check WebGPU: <https://webgpureport.org>

## Development

```bash
bun dev        # Dev server
bun build      # Production build
bun check      # Lint + format
bun typecheck  # TypeScript typechecks
```

### Project Structure

```txt
src/
├── components/     # UI components
├── routes/         # File-based routes
├── workers/        # Web Workers + pools
├── providers/      # React Context (settings)
├── data/           # Static learning data
└── utils/          # Utilities

docs/               # Technical documentation
```

### Adding a Route

Create `src/routes/my-route.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-route")({
  component: MyRoute,
  ssr: false, // Disable if using Web Workers
});

function MyRoute() {
  return <div>Route content</div>;
}
```

## Documentation

- [Workers](./docs/workers.md) - Worker pool pattern
- [AI Models](./docs/ai-models.md) - Model selection

## Privacy

- Zero backend calls after model download
- No analytics or tracking
- All processing in browser
- Speech data never leaves your device

## Acknowledgments

- VITS models: [Diffusion Studio](https://github.com/diffusion-studio/vits-web)
- Whisper: [OpenAI](https://github.com/openai/whisper)
- PhoWhisper: [VinAI Research](https://github.com/VinAIResearch/PhoWhisper)
- WebLLM: [MLC AI](https://mlc.ai/)
- Transformers.js: [Hugging Face](https://huggingface.co/docs/transformers.js)
