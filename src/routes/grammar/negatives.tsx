import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/negatives.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/negatives")({
	component: NegativesComponent,
});

const data = dataFile as unknown as GrammarModuleData;

function NegativesComponent() {
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
						{/* Decision guide cards */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Card>
								<div className="space-y-2">
									<div className="font-semibold text-lg text-red-400">
										không
									</div>
									<div className="text-sm text-white/60">
										not — facts & states
									</div>
									<div className="font-mono text-sm text-white/70">
										Tôi <span className="text-red-400">không</span> biết → I
										don't know
									</div>
								</div>
							</Card>

							<Card>
								<div className="space-y-2">
									<div className="font-semibold text-lg text-red-400">chưa</div>
									<div className="text-sm text-white/60">
										not yet — pending actions
									</div>
									<div className="font-mono text-sm text-white/70">
										Tôi <span className="text-red-400">chưa</span> ăn → I
										haven't eaten yet
									</div>
								</div>
							</Card>

							<Card>
								<div className="space-y-2">
									<div className="font-semibold text-lg text-red-400">đừng</div>
									<div className="text-sm text-white/60">don't — commands</div>
									<div className="font-mono text-sm text-white/70">
										<span className="text-red-400">Đừng</span> lo → Don't worry
									</div>
								</div>
							</Card>
						</div>

						<p className="text-white/80">
							Place the negation word directly before the verb or adjective. No
							helper verbs needed.
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
