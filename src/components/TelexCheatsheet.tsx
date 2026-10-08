import { ExternalLink, Keyboard } from "lucide-react";
import { Popover } from "./Popover";

export function TelexCheatsheet() {
	return (
		<Popover
			trigger={<Keyboard className="h-6 w-6" />}
			className="w-64"
			buttonClassName="p-2 hover:bg-gold/10"
		>
			<div className="space-y-6 text-warm-cream">
				<section>
					<h3 className="mb-3 border-b border-gold pb-1 font-serif text-lg leading-none">
						Diacritics
					</h3>
					<div className="grid grid-cols-2 gap-x-4 gap-y-2">
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">ă</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">aw</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">â</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">aa</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">đ</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">dd</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">ê</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">ee</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">ô</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">oo</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">ơ</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">ow</kbd>
						</div>
						<div className="flex justify-between border-b border-gold/20 pb-1">
							<span className="font-mono text-xl text-gold">ư</span>
							<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">uw</kbd>
						</div>
					</div>
				</section>

				<section>
					<h3 className="mb-3 border-b border-gold pb-1 font-serif text-lg leading-none">Tones</h3>
					<div className="space-y-2">
						<div className="flex items-center justify-between border-b border-gold/20 pb-1">
							<span className="text-sm opacity-80">Sắc (up)</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-lg text-gold">á</span>
								<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">s</kbd>
							</div>
						</div>
						<div className="flex items-center justify-between border-b border-gold/20 pb-1">
							<span className="text-sm opacity-80">Huyền (down)</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-lg text-gold">à</span>
								<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">f</kbd>
							</div>
						</div>
						<div className="flex items-center justify-between border-b border-gold/20 pb-1">
							<span className="text-sm opacity-80">Hỏi (hook)</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-lg text-gold">ả</span>
								<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">r</kbd>
							</div>
						</div>
						<div className="flex items-center justify-between border-b border-gold/20 pb-1">
							<span className="text-sm opacity-80">Ngã (tilde)</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-lg text-gold">ã</span>
								<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">x</kbd>
							</div>
						</div>
						<div className="flex items-center justify-between border-b border-gold/20 pb-1">
							<span className="text-sm opacity-80">Nặng (dot)</span>
							<div className="flex items-center gap-3">
								<span className="font-mono text-lg text-gold">ạ</span>
								<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">j</kbd>
							</div>
						</div>
					</div>
				</section>

				<section className="border-t border-gold/10 pt-4">
					<div className="mb-4 flex items-center justify-between">
						<span className="text-sm opacity-80">Clear mark</span>
						<kbd className="rounded-sm bg-stone-800 px-1.5 py-0.5 font-mono text-sm">z</kbd>
					</div>
					<div className="text-center">
						<a
							href="https://en.wikipedia.org/wiki/Telex_(input_method)"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs text-gold/60 hover:text-gold"
						>
							Learn more about Telex <ExternalLink className="h-3 w-3" />
						</a>
					</div>
				</section>
			</div>
		</Popover>
	);
}
