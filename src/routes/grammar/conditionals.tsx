import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/conditionals.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/conditionals")({
	component: ConditionalsComponent,
});

function ConditionalsComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
