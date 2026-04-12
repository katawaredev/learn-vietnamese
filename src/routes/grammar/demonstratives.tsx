import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/demonstratives.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/demonstratives")({
	component: DemonstrativesComponent,
});

function DemonstrativesComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
