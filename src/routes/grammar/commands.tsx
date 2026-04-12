import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/commands.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/commands")({
	component: CommandsComponent,
});

function CommandsComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
