import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/commands.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/commands")({
	component: CommandsComponent,
});

const data = dataFile as unknown as GrammarModuleData;

const politenessSpectrum: {
	parts: ([string] | [string, boolean])[];
	english: string;
}[] = [
	{ parts: [["Ăn!"]], english: "Eat!" },
	{ parts: [["Ăn "], ["đi", true]], english: "Go eat" },
	{ parts: [["Ăn "], ["nhé", true]], english: "Eat, ok?" },
	{ parts: [["Hãy", true], [" ăn"]], english: "Please eat" },
	{ parts: [["Xin mời", true], [" ăn"]], english: "Please, do eat" },
];

function CommandsComponent() {
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
						<p className="text-white/80 leading-relaxed">
							Vietnamese commands range from direct to very polite. Particles
							and polite words shift the tone:
						</p>

						<div className="space-y-1 font-mono text-sm">
							{politenessSpectrum.map((item) => (
								<div key={item.english} className="text-white/70">
									{item.parts.map(([text, highlight]) =>
										highlight ? (
											<span key={text} className="text-purple-400">
												{text}
											</span>
										) : (
											<span key={text}>{text}</span>
										),
									)}
									<span className="text-white/40"> — {item.english}</span>
								</div>
							))}
						</div>

						{data.introduction.content.map((paragraph) => (
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}
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
