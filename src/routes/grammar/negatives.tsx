import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/negatives.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/negatives")({
	component: NegativesComponent,
});

function NegativesComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
