import { createFileRoute } from "@tanstack/react-router";
import data from "~/data/grammar/passive-voice.json";
import { GrammarModule, type GrammarModuleData } from "./-GrammarModule";
import { Layout } from "./-layout";

export const Route = createFileRoute("/grammar/passive-voice")({
	component: PassiveVoiceComponent,
});

function PassiveVoiceComponent() {
	return (
		<Layout>
			<GrammarModule data={data as unknown as GrammarModuleData} />
		</Layout>
	);
}
