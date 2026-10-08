import { createFileRoute } from "@tanstack/react-router";
import { respond } from "~/server/ai/http";
import { transcribe } from "~/server/ai/speech";

export const Route = createFileRoute("/api/speech/transcribe")({
	server: { handlers: { POST: ({ request }) => respond(transcribe(request), request.signal) } },
});
