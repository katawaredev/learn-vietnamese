import { env } from "@huggingface/transformers";

// Shared configuration for all transformers.js workers
// Disable local models to ensure models are always fetched from HuggingFace
env.allowLocalModels = false;

export { env };
