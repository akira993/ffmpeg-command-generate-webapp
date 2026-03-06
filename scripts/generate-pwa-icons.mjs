#!/usr/bin/env node
/**
 * Generate maskable PWA icons from favicon.svg
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';

const sizes = [192, 512];

for (const size of sizes) {
	const iconSize = Math.round(size * 0.8);
	const padding = Math.round((size - iconSize) / 2);

	const icon = await sharp('src/lib/assets/favicon.svg')
		.resize(iconSize, iconSize)
		.toBuffer();

	await sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: { r: 100, g: 54, b: 138, alpha: 1 }
		}
	})
		.composite([{ input: icon, left: padding, top: padding }])
		.png()
		.toFile(`static/icons/icon-maskable-${size}x${size}.png`);

	console.log(`Created icon-maskable-${size}x${size}.png`);
}
