import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { chatModels } from "~/server/ai/chat-models";
import { respond } from "~/server/ai/http";

export const Route = createFileRoute("/api/chat/models")({
	server: {
		handlers: {
			GET: ({ request }) =>
				respond(
					chatModels.pipe(
						Effect.map((value) =>
							Response.json(value, { headers: { "Cache-Control": "no-store" } }),
						),
					),
					request.signal,
				),
		},
	},
});
