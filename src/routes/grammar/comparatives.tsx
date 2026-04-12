import { createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/Card";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/comparatives.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/comparatives")({
	component: ComparativesComponent,
});

const data = dataFile as unknown as GrammarModuleData;

function ComparativesComponent() {
	return (
		<Layout>
			<div className="space-y-8">
				<Disclosure
					defaultOpen
					title={
						<span className="font-bold text-lg">{data.introduction.title}</span>
					}
				>
					<div className="space-y-3">
						{data.introduction.content.map((paragraph) => (
							<p key={paragraph} className="text-white/80 leading-relaxed">
								{paragraph}
							</p>
						))}

						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<Card>
								<div className="space-y-2">
									<div className="font-semibold text-white/90">
										English (Changes Form)
									</div>
									<div className="space-y-1 text-sm">
										<div>tall → taller → tallest</div>
										<div>good → better → best</div>
										<div className="text-white/50 text-xs">
											Adjective changes form
										</div>
									</div>
								</div>
							</Card>

							<Card>
								<div className="space-y-2">
									<div className="font-semibold text-white/90">
										Vietnamese (Same Form)
									</div>
									<div className="space-y-1 text-sm">
										<div>cao → cao hơn → cao nhất (tall)</div>
										<div>tốt → tốt hơn → tốt nhất (good)</div>
										<div className="text-white/50 text-xs">
											Only the particle changes
										</div>
									</div>
								</div>
							</Card>
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
