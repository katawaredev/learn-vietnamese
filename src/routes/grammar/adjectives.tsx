import { createFileRoute } from "@tanstack/react-router";
import { Disclosure } from "~/components/Disclosure";
import { ExternalLink } from "~/components/ExternalLink";
import dataFile from "~/data/grammar/adjectives.json";
import { type Example, GrammarPracticeGrid } from "./-GrammarPracticeGrid";
import { GRAMMAR_TYPE_COLORS } from "./-grammar-colors";
import { Layout } from "./-layout";
import { type WordData, WordGrid } from "./-WordGrid";

export const Route = createFileRoute("/grammar/adjectives")({
	component: AdjectivesComponent,
});

interface Section {
	id: string;
	title: string;
	description: string;
	colorKey: string;
	words: Record<string, WordData>;
	examples: Example[];
}

interface Category {
	title: string;
	words: Record<string, WordData>;
}

interface ReduplicationItem {
	base: string;
	result: string;
	meaning: string;
}

interface AdjectivesData {
	introduction: { title: string };
	reduplication: {
		full: ReduplicationItem[];
		partial: ReduplicationItem[];
	};
	sections: Section[];
	categories: Record<string, Category>;
}

function AdjectivesComponent() {
	const data = dataFile as unknown as AdjectivesData;

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
						{/* Rule 1: Word order */}
						<p className="text-white/80">
							In Vietnamese, adjectives come{" "}
							<strong className="text-gold">after</strong> the noun:
						</p>

						<div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
							<div className="grid grid-cols-2 gap-4 text-center">
								<div>
									<div className="mb-1 text-sm text-white/50">English</div>
									<div className="font-mono text-lg text-white/80">
										<span className="text-gold">beautiful</span> house
									</div>
									<div className="mt-1 text-white/40 text-xs">
										adjective + noun
									</div>
								</div>
								<div>
									<div className="mb-1 text-sm text-white/50">Vietnamese</div>
									<div className="font-mono text-lg text-white/80">
										nhà <span className="text-gold">đẹp</span>
									</div>
									<div className="mt-1 text-white/40 text-xs">
										noun + adjective
									</div>
								</div>
							</div>
						</div>

						{/* Rule 2: No "to be" */}
						<p className="text-white/80">
							Adjectives act as verbs — no "to be" needed.{" "}
							<span className="text-warm-cream">Tôi mệt</span> (literally "I
							tired") is a complete sentence meaning "I am tired".
						</p>

						{/* Rule 3: Degree — visual, not a paragraph */}
						<p className="text-white/80">
							To say "very", you can put a word{" "}
							<strong className="text-gold">before</strong> or{" "}
							<strong className="text-gold">after</strong> the adjective:
						</p>
						<div className="space-y-1 font-mono text-sm">
							<div className="text-white/70">
								<span className="text-amber-500">rất</span> đẹp = very beautiful{" "}
								<span className="text-white/40">(before, neutral)</span>
							</div>
							<div className="text-white/70">
								đẹp <span className="text-amber-500">lắm</span> = very beautiful{" "}
								<span className="text-white/40">(after, casual)</span>
							</div>
							<div className="text-white/70">
								đẹp <span className="text-amber-500">quá</span>! = so beautiful!{" "}
								<span className="text-white/40">(after, exclamatory)</span>
							</div>
						</div>

						{/* Rule 4: Reduplication */}
						<p className="mt-2 font-semibold text-gold">
							<ExternalLink
								text="Reduplication"
								href="https://en.wiktionary.org/wiki/Appendix:Vietnamese_reduplication"
							/>
						</p>
						<p className="text-white/80">
							Repeating an adjective softens it — like adding "-ish" or "kinda"
							in English:
						</p>
						<div className="space-y-1 font-mono text-sm">
							{data.reduplication.full.map((ex) => (
								<div key={ex.base} className="text-white/70">
									{ex.base} →{" "}
									<span className="text-warm-cream">{ex.result}</span>{" "}
									<span className="text-white/40">({ex.meaning})</span>
								</div>
							))}
						</div>

						<p className="text-white/80">
							Sometimes the repeated part changes sound slightly — this is{" "}
							<em>partial reduplication</em>. The second word isn't a real word
							on its own, it's a sound echo that refines the meaning:
						</p>
						<div className="space-y-1 font-mono text-sm">
							{data.reduplication.partial.map((ex) => (
								<div key={ex.base} className="text-white/70">
									{ex.base} →{" "}
									<span className="text-warm-cream">{ex.result}</span>{" "}
									<span className="text-white/40">({ex.meaning})</span>
								</div>
							))}
						</div>
					</div>
				</Disclosure>

				{/* Standard sections (intensifiers) */}
				{data.sections.map((section) => (
					<div key={section.id} className="space-y-6">
						<div>
							<h2 className="font-bold font-serif text-2xl text-gold">
								{section.title}
							</h2>
							<p className="mt-1 text-white/60">{section.description}</p>
						</div>

						<WordGrid
							data={section.words}
							titleClassName={GRAMMAR_TYPE_COLORS[section.colorKey]}
						/>

						{section.examples.length > 0 && (
							<Disclosure plain title="Examples" defaultOpen>
								<GrammarPracticeGrid examples={section.examples} />
							</Disclosure>
						)}
					</div>
				))}

				{/* Common Adjectives by Category */}
				<div className="space-y-6">
					<div>
						<h2 className="font-bold font-serif text-2xl text-gold">
							Common Adjectives
						</h2>
						<p className="mt-1 text-white/60">
							Essential adjectives grouped by category
						</p>
					</div>

					<div className="space-y-6">
						{Object.entries(data.categories).map(([key, category]) => (
							<div key={key} className="space-y-3">
								<h3 className="font-semibold text-lg">{category.title}</h3>
								<WordGrid
									data={category.words}
									titleClassName={GRAMMAR_TYPE_COLORS.adjective}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</Layout>
	);
}
