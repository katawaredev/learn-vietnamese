export function isLowEndDevice(): boolean {
	if ((navigator.hardwareConcurrency || 1) <= 4) return true;
	if ("deviceMemory" in navigator && (navigator.deviceMemory as number) <= 4)
		return true;
	return false;
}
