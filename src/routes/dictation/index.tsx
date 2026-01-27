import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, Mic } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { buttonVariants } from "~/components/Button";
import { Card } from "~/components/Card";
import { A1 } from "~/data/dictation";
import Header from "~/layout/Header";

export const Route = createFileRoute("/dictation/")({
	component: DictationComponent,
});

interface DictationEntry {
	slug: string;
	title: {
		en: string;
		vn: string;
	};
	story: Array<{
		en: string;
		vn: string;
	}>;
}

function DictationComponent() {
	const entries = Object.values(A1) as DictationEntry[];

	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-burgundy-dark to-burgundy">
			<Header />
			<main className="flex flex-1 flex-col px-4 pb-8">
				<div className="mx-auto w-full max-w-6xl">
					<h1 className="mb-8 font-bold font-serif text-4xl text-warm-cream">
						Level: A1
					</h1>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{entries.map((entry) => (
							<Card key={entry.slug} className="flex flex-col space-y-4">
								<div className="flex-1">
									<h3 className="mb-2 font-semibold font-serif text-warm-cream text-xl">
										{entry.title.en}
									</h3>
									<p className="text-gold/80 text-sm">{entry.title.vn}</p>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<Link
										to="/dictation/listen/$slug"
										params={{ slug: entry.slug }}
										className={twMerge(
											buttonVariants({ variant: "outline", size: "small" }),
											"flex items-center justify-center space-x-2",
										)}
									>
										<Headphones size={16} />
										<span>Transcribe</span>
									</Link>
									<Link
										to="/dictation/speak/$slug"
										params={{ slug: entry.slug }}
										className={twMerge(
											buttonVariants({ variant: "outline", size: "small" }),
											"flex items-center justify-center space-x-2",
										)}
									>
										<Mic size={16} />
										<span>Recite</span>
									</Link>
								</div>
							</Card>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
