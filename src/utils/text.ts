// Normalize text for comparison
export const normalizeText = (text: string | null): string => {
	if (!text) return "";
	// Keep only alphanumeric characters and spaces, convert to lowercase
	return text
		.replace(/[^a-zA-Z0-9\s]/g, "") // Remove non-alphanumeric except spaces
		.replace(/\s+/g, " ") // Replace multiple spaces with single space
		.trim() // Remove leading/trailing spaces
		.toLowerCase();
};
