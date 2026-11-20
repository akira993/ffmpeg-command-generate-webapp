import { describe, expect, it, vi } from 'vitest';
import { collectDirectFileEntries } from './drop-entries.js';

type Entry = { isFile: boolean; name: string };

function fakeDirectory(name: string, ...batches: Entry[][]) {
	const readEntries = vi.fn((onEntries: (entries: Entry[]) => void) => {
		const batch = batches.shift();
		if (!batch) throw new Error('readEntries called after the final batch');
		queueMicrotask(() => onEntries(batch));
	});
	const createReader = vi.fn(() => ({ readEntries }));
	return { name, isFile: false, isDirectory: true, createReader, readEntries };
}

describe('collectDirectFileEntries', () => {
	const first = { isFile: true, name: 'first.png' };
	const second = { isFile: true, name: 'second.png' };

	it.each([
		{ count: 0, files: [] },
		{ count: 1, files: [first] },
		{ count: 2, files: [first, second] },
	])('returns $count direct files in order without opening subfolders', async ({ files }) => {
		const deeper = fakeDirectory('deeper', [{ isFile: true, name: 'hidden.png' }], []);
		const nested = fakeDirectory('nested', [deeper], []);
		const root = fakeDirectory('root', [nested, ...files], []);

		const result = await collectDirectFileEntries(root);

		expect(nested.createReader).toHaveBeenCalledTimes(0);
		expect(deeper.createReader).toHaveBeenCalledTimes(0);
		expect(result).toEqual(files);
	});

	it('reads every batch in order until an empty batch', async () => {
		const root = fakeDirectory('root', [first], [second], []);

		expect(await collectDirectFileEntries(root)).toEqual([first, second]);
		expect(root.createReader).toHaveBeenCalledTimes(1);
		expect(root.readEntries).toHaveBeenCalledTimes(3);
	});
});
