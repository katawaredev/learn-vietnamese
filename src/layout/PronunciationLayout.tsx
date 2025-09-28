import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { useState } from "react";
import { LinkButton } from "~/components/Button";
import { ListenButton } from "~/components/ListenButton";
import { Popover } from "~/components/Popover";
import { Result } from "~/components/ResultButton";
import { Select } from "~/components/Select";
import { SpeakButton } from "~/components/SpeakButton";
import SpeakUrlButton from "~/components/SpeakUrlButton";
import Header from "./Header";

interface PronunciationItem {
	pronunciation: string;
	ipa: string;
	telex: string;
	url?: string | null;
}

interface PronunciationData {
	[key: string]: PronunciationItem;
}

interface PronunciationLayoutProps {
	data: PronunciationData;
	currentRoute: string;
}

const pronunciationRoutes = [
	{ value: "vowels", label: "Vowels", path: "/pronunciation/vowels" },
	{
		value: "double-vowels",
		label: "Double Vowels",
		path: "/pronunciation/double-vowels",
	},
	{
		value: "consonants",
		label: "Consonants",
		path: "/pronunciation/consonants",
	},
	{ value: "tones", label: "Tones", path: "/pronunciation/tones" },
];

export const PronunciationLayout: FC<PronunciationLayoutProps> = ({
	data,
	currentRoute,
}) => {
	const navigate = useNavigate();
	const [transcriptions, setTranscriptions] = useState<
		Record<string, string | null>
	>({});
	const [newTranscriptions, setNewTranscriptions] = useState<Set<string>>(
		new Set(),
	);

	const currentIndex = pronunciationRoutes.findIndex(
		(route) => route.value === currentRoute,
	);
	const prevRoute =
		currentIndex > 0 ? pronunciationRoutes[currentIndex - 1] : null;
	const nextRoute =
		currentIndex < pronunciationRoutes.length - 1
			? pronunciationRoutes[currentIndex + 1]
			: null;

	const handleTranscription = (key: string, text: string) => {
		setTranscriptions((prev) => ({ ...prev, [key]: text }));
		setNewTranscriptions((prev) => new Set(prev).add(key));
		// Clear the "new" flag after a short delay
		setTimeout(() => {
			setNewTranscriptions((prev) => {
				const next = new Set(prev);
				next.delete(key);
				return next;
			});
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-burgundy-dark to-burgundy">
			<Header>
				<Select
					placeholder="Select Category"
					className="min-w-32"
					menuSize="sm"
					options={pronunciationRoutes.map((route) => ({
						label: route.label,
						value: route.value,
					}))}
					value={currentRoute}
					onChange={(value) => {
						const route = pronunciationRoutes.find((r) => r.value === value);
						if (route) {
							navigate({ to: route.path });
						}
					}}
				/>
			</Header>

			<main className="px-4 pb-8">
				<div className="mx-auto max-w-6xl">
					<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{Object.entries(data).map(([key, item]) => {
							const transcription = transcriptions[key];

							return (
								<div
									key={key}
									className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20"
								>
									{/* Info button - top right corner */}
									<div className="absolute top-2 right-2">
										<Popover
											trigger={
												<InformationCircleIcon className="h-6 w-6 text-gold" />
											}
											buttonClassName="opacity-60 hover:opacity-100 transition-opacity p-2"
											size="xl"
										>
											<div className="space-y-2">
												<div>
													<strong>Pronunciation:</strong>
													<p className="text-sm">{item.pronunciation}</p>
												</div>
												<div>
													<strong>Telex:</strong>
													<p className="text-sm">{item.telex}</p>
												</div>
											</div>
										</Popover>
									</div>

									{/* Result indicator */}
									<Result
										transcription={transcription}
										expectedText={key}
										isNew={newTranscriptions.has(key)}
									/>

									{/* Main vowel display */}
									<div className="text-center">
										<div className="py-8">
											<div className="-mb-4 font-bold text-6xl">{key}</div>
										</div>
										<div className="mb-4 font-mono text-sm text-white/70">
											{item.ipa}
										</div>
									</div>

									{/* Action buttons */}
									<div className="flex items-center justify-center gap-6">
										{item.url ? (
											<SpeakUrlButton url={item.url} size="small" />
										) : (
											<SpeakButton text={key} size="small" />
										)}
										<ListenButton
											onTranscription={(text) => handleTranscription(key, text)}
											size="small"
										/>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mx-auto flex max-w-4xl gap-8 px-4 pt-12">
						{prevRoute ? (
							<LinkButton
								variant="outline"
								size="medium"
								to={prevRoute.path}
								className="w-full"
							>
								← {prevRoute.label}
							</LinkButton>
						) : (
							<div className="w-full" />
						)}
						{nextRoute ? (
							<LinkButton
								variant="outline"
								size="medium"
								to={nextRoute.path}
								className="w-full"
							>
								{nextRoute.label} →
							</LinkButton>
						) : (
							<div className="w-full" />
						)}
					</div>
				</div>
			</main>
		</div>
	);
};
