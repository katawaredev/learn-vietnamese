export function getRandomElement<T>(arr: readonly T[]): T {
	if (arr.length === 0) throw new Error("No items provided");
	const index = Math.floor(Math.random() * arr.length);
	return arr[index];
}

export function pickOne<T>(...items: readonly T[]): T {
	if (items.length === 0) throw new Error("No items provided");
	const index = Math.floor(Math.random() * items.length);
	return items[index];
}
