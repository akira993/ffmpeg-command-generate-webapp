type Directory<T> = {
	createReader(): {
		readEntries(onEntries: (entries: T[]) => void, onError: (error: unknown) => void): void;
	};
};

export function collectDirectFileEntries<T extends { isFile: boolean }>(
	directory: Directory<T>,
): Promise<T[]> {
	const reader = directory.createReader();
	const files: T[] = [];

	return new Promise((resolve, reject) => {
		function readBatch() {
			reader.readEntries((entries) => {
				if (entries.length === 0) {
					resolve(files);
					return;
				}

				files.push(...entries.filter((entry) => entry.isFile));
				readBatch();
			}, reject);
		}

		readBatch();
	});
}
