import { createFileRoute } from "@tanstack/react-router";
import { streamChat } from "~/server/ai/chat";
import { respond } from "~/server/ai/http";

export const Route = createFileRoute("/api/chat")({
	server: { handlers: { POST: ({ request }) => respond(streamChat(request), request.signal) } },
});
