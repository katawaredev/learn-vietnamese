import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/demonstratives.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/demonstratives")({
	component: DemonstrativesComponent,
});

const data = dataFile as unknown as GrammarModuleData;

function DemonstrativesComponent() {
	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-lg">{data.introduction.title}</span>
					}
				>
					<div className="space-y-5">
						<p className="text-white/80">
							Vietnamese has three distance levels — near the speaker, near the
							listener, and far from both:
						</p>

						{/* Spatial distance diagram */}
						<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="mb-2 font-semibold text-blue-400 text-sm">
										Speaker
									</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-blue-400">này</span> / đây
									</div>
									<div className="mt-1 text-white/40 text-xs">this / here</div>
								</div>
								<div>
									<div className="mb-2 font-semibold text-sm text-yellow-400">
										Listener
									</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-yellow-400">đó</span> / ấy
									</div>
									<div className="mt-1 text-white/40 text-xs">that / there</div>
								</div>
								<div>
									<div className="mb-2 font-semibold text-purple-400 text-sm">
										Far away
									</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-purple-400">kia</span>
									</div>
									<div className="mt-1 text-white/40 text-xs">over there</div>
								</div>
							</div>
						</div>

						{/* English vs Vietnamese comparison */}
						<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
							<div className="grid grid-cols-2 gap-4 text-center">
								<div>
									<div className="mb-1 text-sm text-white/50">English</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-blue-400">this</span> →{" "}
										<span className="text-yellow-400">that</span>
									</div>
									<div className="mt-1 text-white/40 text-xs">
										2 distance levels
									</div>
								</div>
								<div>
									<div className="mb-1 text-sm text-white/50">Vietnamese</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-blue-400">này</span> →{" "}
										<span className="text-yellow-400">đó</span> →{" "}
										<span className="text-purple-400">kia</span>
									</div>
									<div className="mt-1 text-white/40 text-xs">
										3 distance levels
									</div>
								</div>
							</div>
						</div>

						{/* Word order comparison */}
						<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
							<div className="grid grid-cols-2 gap-4 text-center">
								<div>
									<div className="mb-1 text-sm text-white/50">English</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-gold">this</span> cat
									</div>
									<div className="mt-1 text-white/40 text-xs">
										demonstrative + noun
									</div>
								</div>
								<div>
									<div className="mb-1 text-sm text-white/50">Vietnamese</div>
									<div className="font-mono text-lg text-white/80">
										con mèo <span className="text-gold">này</span>
									</div>
									<div className="mt-1 text-white/40 text-xs">
										classifier + noun + demonstrative
									</div>
								</div>
							</div>
						</div>
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
