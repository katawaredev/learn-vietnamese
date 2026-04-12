import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/focus-markers.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/focus-markers")({
	component: FocusMarkersComponent,
});

function FocusMarkersComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
