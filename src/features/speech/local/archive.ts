// Read numeric storage only. PyTorch pickle metadata is never executed.
export function zipEntries(bytes: ArrayBuffer) {
	const view = new DataView(bytes);
	let end = bytes.byteLength - 22;
	while (end >= Math.max(0, bytes.byteLength - 65_557) && view.getUint32(end, true) !== 0x06054b50)
		end--;
	if (end < 0 || view.getUint32(end, true) !== 0x06054b50)
		throw new Error("Invalid model archive.");
	const count = view.getUint16(end + 10, true);
	let cursor = view.getUint32(end + 16, true);
	const entries = new Map<string, Uint8Array<ArrayBuffer>>();
	let expanded = 0;
	for (let index = 0; index < count; index++) {
		if (cursor + 46 > end || view.getUint32(cursor, true) !== 0x02014b50)
			throw new Error("Invalid ZIP index.");
		const method = view.getUint16(cursor + 10, true);
		const size = view.getUint32(cursor + 20, true);
		const outputSize = view.getUint32(cursor + 24, true);
		const nameLength = view.getUint16(cursor + 28, true);
		const extra = view.getUint16(cursor + 30, true);
		const comment = view.getUint16(cursor + 32, true);
		const offset = view.getUint32(cursor + 42, true);
		const name = new TextDecoder().decode(new Uint8Array(bytes, cursor + 46, nameLength));
		if (offset + 30 > bytes.byteLength || view.getUint32(offset, true) !== 0x04034b50)
			throw new Error("Invalid ZIP entry.");
		const start =
			offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true);
		expanded += outputSize;
		if (start + size > bytes.byteLength || expanded > 128 * 1024 * 1024 || entries.has(name))
			throw new Error("Invalid ZIP size.");
		const data = new Uint8Array(bytes.slice(start, start + size));
		if (method !== 0) throw new Error("Expected an uncompressed model archive.");
		if (data.byteLength !== outputSize) throw new Error("Invalid ZIP output size.");
		entries.set(name, data);
		cursor += 46 + nameLength + extra + comment;
	}
	return entries;
}

export function numpyFloat32(bytes: Uint8Array<ArrayBuffer>) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (
		bytes.length < 10 ||
		new TextDecoder().decode(bytes.subarray(1, 6)) !== "NUMPY" ||
		bytes[0] !== 147
	)
		throw new Error("Invalid NumPy tensor.");
	const version = bytes[6];
	if (version !== 1 && version !== 2) throw new Error("Unsupported NumPy version.");
	const start = version === 1 ? 10 : 12;
	const length = version === 1 ? view.getUint16(8, true) : view.getUint32(8, true);
	const header = new TextDecoder().decode(bytes.subarray(start, start + length));
	if (!/'descr':\s*'<f4'/.test(header) || !/'fortran_order':\s*False/.test(header))
		throw new Error("Expected a little-endian float32 tensor.");
	const shape = /'shape':\s*\(([^)]*)\)/.exec(header)?.[1];
	if (shape === undefined || !/^[\d,\s]*$/.test(shape)) throw new Error("Invalid tensor shape.");
	const dims = shape
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean)
		.map(Number);
	const count = dims.reduce((size, dim) => size * dim, 1);
	if (!Number.isSafeInteger(count) || start + length + count * 4 !== bytes.length)
		throw new Error("Invalid tensor length.");
	return { dims, data: new Float32Array(bytes.slice(start + length).buffer) };
}

export function voicePack(bytes: ArrayBuffer) {
	const entries = zipEntries(bytes);
	const storage = [...entries].find(([name]) => name.endsWith("/data/0"))?.[1];
	const byteorder = [...entries].find(([name]) => name.endsWith("/byteorder"))?.[1];
	if (
		!storage ||
		storage.byteLength !== 510 * 256 * 4 ||
		new TextDecoder().decode(byteorder) !== "little"
	)
		throw new Error("Invalid Kokoro voice pack.");
	const floats = new Float32Array(storage.buffer);
	if (!floats.every(Number.isFinite)) throw new Error("Invalid voice style values.");
	return floats;
}
