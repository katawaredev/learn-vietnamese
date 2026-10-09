import type { Language } from "../contracts";

export type SpeechKind = "tts" | "stt";
interface ModelInfo {
	id: string;
	name: string;
	languages: readonly Language[];
	downloadMB?: number;
}
export type LocalVoice = ModelInfo &
	(
		| { engine: "mms"; modelId: string; revision: string }
		| { engine: "piper"; voiceId: string }
		| { engine: "kokoro"; voiceId: string }
		| { engine: "vieneu"; voiceId: string }
	);
export interface LocalListener extends ModelInfo {
	engine: "whisper";
	modelId: string;
	revision: string;
}
export type LocalModel = LocalVoice | LocalListener;

const piper = (voiceId: string, name: string, language: Language): LocalVoice => ({
	id: voiceId,
	name,
	engine: "piper",
	voiceId,
	languages: [language],
});
export const LOCAL_VOICES: readonly LocalVoice[] = [
	{
		id: "Xenova/mms-tts-vie",
		name: "Vietnamese (MMS)",
		engine: "mms",
		languages: ["vn"],
		modelId: "Xenova/mms-tts-vie",
		revision: "7f40ca63bb6072ac57026210f2fea55242511214",
	},
	piper("vi_VN-25hours_single-low", "Vietnamese 25 Hours (Low Quality)", "vn"),
	piper("vi_VN-vais1000-medium", "Vietnamese VAIS 1000 (Medium Quality)", "vn"),
	piper("vi_VN-vivos-x_low", "Vietnamese Vivos (Low Quality)", "vn"),
	...[
		["diem_trinh", "Diễm Trinh"],
		["hung_thinh", "Hưng Thịnh"],
		["mai_linh", "Mai Linh"],
		["mai_loan", "Mai Loan"],
		["manh_dung", "Mạnh Dũng"],
		["my_yen", "Mỹ Yến"],
		["ngoc_huyen", "Ngọc Huyền"],
		["phat_tai", "Phát Tài"],
		["thanh_dat", "Thành Đạt"],
		["thuc_trinh", "Thục Trinh"],
		["tuan_ngoc", "Tuấn Ngọc"],
		["storyvert", "storyvert"],
		["duc_an", "Đức An"],
		["duc_duy", "đức duy"],
	].map(([voiceId, name]): LocalVoice => ({
		id: `kokoro-${voiceId}`,
		name: `${name} (Kokoro)`,
		engine: "kokoro",
		downloadMB: 400,
		voiceId,
		languages: ["vn"],
	})),
	...[
		["adam_bua", "Adam bựa"],
		["truc_ly", "Trúc Ly"],
		["anh_khoi", "Anh Khôi"],
		["mai_anh", "Mai Anh"],
		["minh_quan_pro", "Minh Quân Pro"],
		["thuy_dung", "Thùy Dung"],
		["thien_tam_duc", "Thiền Tâm Đức"],
		["ngoc_huyen", "Ngọc Huyền"],
		["quang_son", "Quang Sơn"],
		["ngoc_tran", "Ngọc Trân"],
		["minh_duc", "Minh Đức"],
		["pham_tuyen", "Phạm Tuyên"],
		["thai_son", "Thái Sơn"],
		["xuan_vinh", "Xuân Vĩnh"],
		["thanh_binh", "Thanh Bình"],
		["ngoc_linh", "Ngọc Linh"],
		["doan_trang", "Đoan Trang"],
		["thuc_doan", "Thục Đoan"],
		["minh_triet", "Minh Triết"],
		["my_duyen", "Mỹ Duyên"],
		["quynh_anh", "Quỳnh Anh"],
		["duc_tri", "Đức Trí"],
		["kim_thanh", "Kim Thanh"],
		["adam", "Adam"],
		["manh_dung", "Mạnh Dũng"],
	].map(([voiceId, name]): LocalVoice => ({
		id: `vieneu-${voiceId}`,
		name: `${name} (VieNeu v3 Turbo)`,
		engine: "vieneu",
		downloadMB: 300,
		voiceId,
		languages: ["vn", "en"],
	})),

	{
		id: "Xenova/mms-tts-eng",
		name: "English (MMS)",
		engine: "mms",
		languages: ["en"],
		modelId: "Xenova/mms-tts-eng",
		revision: "3f8955a2adbd6487ce57420620d4916de22b9dac",
	},
	...[
		["en_US-amy-medium", "Amy"],
		["en_US-hfc_female-medium", "HFC Female"],
		["en_US-hfc_male-medium", "HFC Male"],
		["en_US-lessac-medium", "Lessac"],
		["en_US-ryan-medium", "Ryan"],
		["en_US-danny-low", "Danny"],
		["en_US-joe-medium", "Joe"],
		["en_US-kathleen-low", "Kathleen"],
		["en_US-kristin-medium", "Kristin"],
		["en_US-ljspeech-high", "LJ Speech"],
		["en_GB-alan-medium", "Alan (British)"],
		["en_GB-alba-medium", "Alba (British)"],
		["en_GB-cori-high", "Cori (British)"],
		["en_GB-jenny_dioco-medium", "Jenny (British)"],
	].map(([id, name]) => piper(id, `${name} (Piper)`, "en")),
];

const whisper = (
	id: string,
	name: string,
	modelId: string,
	revision: string,
	languages: readonly Language[],
): LocalListener => ({
	id,
	name,
	modelId,
	revision,
	languages,
	engine: "whisper",
});
export const LOCAL_LISTENERS: readonly LocalListener[] = [
	whisper(
		"phowhisper-tiny",
		"PhoWhisper Tiny",
		"huuquyet/PhoWhisper-tiny",
		"6d19be0aa195a75bb9c06f7fa4cb5672e25a9164",
		["vn"],
	),
	whisper(
		"phowhisper-base",
		"PhoWhisper Base",
		"huuquyet/PhoWhisper-base",
		"7623a803636be73f54c30dfa4ce1c42cdc9bbbcf",
		["vn"],
	),
	whisper(
		"phowhisper-small",
		"PhoWhisper Small",
		"huuquyet/PhoWhisper-small",
		"515c6b55639f2944aa8b64f2b0268b41c944353c",
		["vn"],
	),
	whisper(
		"phowhisper-medium",
		"PhoWhisper Medium (large download)",
		"huuquyet/PhoWhisper-medium",
		"59a7b55b21321923b1131618fccf6c3a2cb6fbd2",
		["vn"],
	),
	whisper(
		"phowhisper-large",
		"PhoWhisper Large (large download)",
		"huuquyet/PhoWhisper-large",
		"1c2dc3659b1646ffd09c052d3433f899f6e1c789",
		["vn"],
	),
	whisper(
		"whisper-tiny",
		"Whisper Tiny",
		"Xenova/whisper-tiny",
		"5332fcc35e32a33b86612b9a57a89be7906102b1",
		["vn", "en"],
	),
	whisper(
		"whisper-base",
		"Whisper Base",
		"Xenova/whisper-base",
		"64da57285918e20ea79ea5c88eed7197933abaa8",
		["vn", "en"],
	),
	whisper(
		"whisper-small",
		"Whisper Small",
		"Xenova/whisper-small",
		"2d67713f236afa48a18992566e7647f6ca848e13",
		["vn", "en"],
	),
	whisper(
		"whisper-medium",
		"Whisper Medium (large download)",
		"Xenova/whisper-medium",
		"8c5b90880ab9f79487ab33613413431bf661d595",
		["vn", "en"],
	),
	whisper(
		"whisper-large",
		"Whisper Large (large download)",
		"Xenova/whisper-large",
		"451f4b004423a67138e1d510de9c7cd904c259e7",
		["vn", "en"],
	),
];

export function localModels(kind: SpeechKind, language: Language): readonly LocalModel[] {
	return (kind === "tts" ? LOCAL_VOICES : LOCAL_LISTENERS).filter((model) =>
		model.languages.includes(language),
	);
}

export function findLocalModel(kind: SpeechKind, id: string) {
	return (kind === "tts" ? LOCAL_VOICES : LOCAL_LISTENERS).find((model) => model.id === id);
}
