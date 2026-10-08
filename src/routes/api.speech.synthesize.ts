import { createFileRoute } from "@tanstack/react-router";
import { respond } from "~/server/ai/http";
import { synthesize } from "~/server/ai/speech";

export const Route = createFileRoute("/api/speech/synthesize")({
	server: { handlers: { POST: ({ request }) => respond(synthesize(request), request.signal) } },
});
