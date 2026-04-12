import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/modal-verbs.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/modal-verbs")({
	component: ModalVerbsComponent,
});

function ModalVerbsComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
