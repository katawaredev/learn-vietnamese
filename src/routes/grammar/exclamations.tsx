import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/exclamations.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/exclamations")({
	component: ExclamationsComponent,
});

function ExclamationsComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
