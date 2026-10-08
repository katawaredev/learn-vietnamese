import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { capabilities } from "~/server/ai/config";
import { respond } from "~/server/ai/http";

export const Route = createFileRoute("/api/speech/capabilities")({
	server: {
		handlers: {
			GET: ({ request }) =>
				respond(
					capabilities.pipe(
						Effect.map((value) =>
							Response.json(value, { headers: { "Cache-Control": "no-store" } }),
						),
					),
					request.signal,
				),
		},
	},
});
