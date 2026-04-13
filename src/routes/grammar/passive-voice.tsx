import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/passive-voice.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/passive-voice")({
	component: PassiveVoiceComponent,
});

const data = dataFile as unknown as GrammarModuleData;

function PassiveVoiceComponent() {
	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-lg">{data.introduction.title}</span>
					}
				>
					<div className="space-y-4">
						<p className="text-white/80">
							English has one neutral passive ("I was praised"). Vietnamese has
							two — the speaker's attitude is built into the grammar:
						</p>

						<div className="font-mono text-sm text-white/70">
							<div>
								Tôi <span className="text-emerald-400">được</span> khen = I was
								praised <span className="text-white/40">(good for me)</span>
							</div>
							<div>
								Tôi <span className="text-red-400">bị</span> khen = I was
								"praised"{" "}
								<span className="text-white/40">(unwanted — sarcastic)</span>
							</div>
						</div>

						<p className="text-white/80">
							Same verb, different marker — the meaning flips. Choosing the
							wrong one sounds odd or rude.
						</p>
					</div>
				</Disclosure>

				{data.sections.map((section) => (
					<div key={section.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{section.title}
							</h2>
							<p className="mt-1 text-white/60">{section.description}</p>
						</div>

						{Object.keys(section.words).length > 0 && (
							<WordGrid
								data={section.words}
								titleClassName={GRAMMAR_TYPE_COLORS[section.colorKey]}
							/>
						)}

						{section.examples.length > 0 && (
							<Disclosure plain title="Examples" defaultOpen>
								<GrammarPracticeGrid examples={section.examples as Example[]} />
							</Disclosure>
						)}
					</div>
				))}
			</div>
		</Layout>
	);
}
