import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import dataFile from "~/data/grammar/conditionals.json";
import type { GrammarModuleData } from "./-GrammarModule";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/conditionals")({
	component: ConditionalsComponent,
});

const data = dataFile as unknown as GrammarModuleData;

function ConditionalsComponent() {
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
							Vietnamese conditionals follow a simple pattern where both markers
							are optional:
						</p>

						{/* Conditional formula */}
						<div className="font-mono text-white/70">
							<span className="text-white/40">(</span>
							<span className="text-purple-500">nếu</span>
							<span className="text-white/40">)</span>
							{" + condition , "}
							<span className="text-white/40">(</span>
							<span className="text-purple-500">thì</span>
							<span className="text-white/40">)</span>
							{" + result"}
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
