#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * WebP Conversion Script using Sharp (high-performance image processing)
 * Converts JPG/PNG images to WebP format with quality optimization
 */

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const WEBP_QUALITY = 85; // High quality WebP
const OUTPUT_SUFFIX = ''; // No suffix, replace original references

async function checkSharpAvailable() {
    try {
        const sharp = await import('sharp');
        return sharp.default;
    } catch (error) {
        console.log('📦 Sharp not installed. Installing...');
        console.log('Run: npm install --save-dev sharp');
        return null;
    }
}

async function findImagesToConvert() {
    const publicDir = path.join(process.cwd(), 'public');
    const images = [];

    try {
        const files = await fs.readdir(publicDir);

        for (const file of files) {
            const fullPath = path.join(publicDir, file);
            const ext = path.extname(file).toLowerCase();

            if (SUPPORTED_FORMATS.includes(ext)) {
                const stats = await fs.stat(fullPath);
                if (stats.isFile()) {
                    // Check if WebP version already exists
                    const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    let webpExists = false;
                    try {
                        await fs.access(webpPath);
                        webpExists = true;
                    } catch {
                        // WebP doesn't exist, good to convert
                    }

                    images.push({
                        original: fullPath,
                        webp: webpPath,
                        filename: file,
                        size: stats.size,
                        webpExists
                    });
                }
            }
        }
    } catch (error) {
        console.warn(`Could not read directory ${publicDir}:`, error.message);
    }

    return images;
}

async function convertToWebP(imagePath, outputPath, sharp) {
    try {
        await sharp(imagePath)
            .webp({
                quality: WEBP_QUALITY,
                effort: 6, // Maximum compression effort
                lossless: false // Use lossy compression for better size
            })
            .toFile(outputPath);

        // Get file sizes for comparison
        const originalStats = await fs.stat(imagePath);
        const webpStats = await fs.stat(outputPath);

        const originalSize = originalStats.size;
        const webpSize = webpStats.size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        return {
            originalSize,
            webpSize,
            savings: parseFloat(savings)
        };
    } catch (error) {
        throw new Error(`Conversion failed: ${error.message}`);
    }
}

async function updateImageReferences(originalPath, webpPath) {
    const srcDir = path.join(process.cwd(), 'src');
    const originalFilename = path.basename(originalPath);
    const webpFilename = path.basename(webpPath);

    // Find all TypeScript/TSX files that might reference the image
    async function findFiles(dir, extensions = ['.ts', '.tsx']) {
        const files = [];
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files.push(...await findFiles(fullPath, extensions));
            } else if (extensions.some(ext => item.name.endsWith(ext))) {
                files.push(fullPath);
            }
        }

        return files;
    }

    const sourceFiles = await findFiles(srcDir);
    let updatedFiles = 0;

    for (const file of sourceFiles) {
        try {
            const content = await fs.readFile(file, 'utf8');
            const originalRef = `/${originalFilename}`;
            const webpRef = `/${webpFilename}`;

            if (content.includes(originalRef)) {
                const updatedContent = content.replace(
                    new RegExp(originalRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    webpRef
                );

                if (updatedContent !== content) {
                    await fs.writeFile(file, updatedContent, 'utf8');
                    updatedFiles++;
                }
            }
        } catch (error) {
            console.warn(`Could not update file ${file}:`, error.message);
        }
    }

    return updatedFiles;
}

async function main() {
    console.log('🖼️  WebP Conversion Tool\n');
    console.log('═'.repeat(60));

    // Check if Sharp is available
    const sharp = await checkSharpAvailable();
    if (!sharp) {
        console.log('\n❌ Cannot proceed without Sharp image processing library.');
        console.log('Install it with: npm install --save-dev sharp');
        process.exit(1);
    }

    // Find images to convert
    const images = await findImagesToConvert();
    const toConvert = images.filter(img => !img.webpExists);
    const alreadyConverted = images.filter(img => img.webpExists);

    if (toConvert.length === 0) {
        console.log('✅ All images already have WebP versions!');
        if (alreadyConverted.length > 0) {
            console.log('\n📊 Existing WebP files:');
            alreadyConverted.forEach(img => {
                console.log(`  ${img.filename} → ${path.basename(img.webp)}`);
            });
        }
        return;
    }

    console.log(`\n🔄 Converting ${toConvert.length} images to WebP...\n`);

    let totalOriginalSize = 0;
    let totalWebpSize = 0;
    const conversions = [];

    for (const image of toConvert) {
        try {
            console.log(`Converting: ${image.filename}...`);

            const result = await convertToWebP(image.original, image.webp, sharp);

            totalOriginalSize += result.originalSize;
            totalWebpSize += result.webpSize;

            conversions.push({
                filename: image.filename,
                ...result
            });

            console.log(`  ✅ ${(result.originalSize / 1024).toFixed(1)}KB → ${(result.webpSize / 1024).toFixed(1)}KB (${result.savings}% smaller)`);

            // Update source code references
            const updatedFiles = await updateImageReferences(image.original, image.webp);
            if (updatedFiles > 0) {
                console.log(`  📝 Updated ${updatedFiles} source files`);
            }

        } catch (error) {
            console.error(`  ❌ Failed to convert ${image.filename}: ${error.message}`);
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 CONVERSION SUMMARY');
    console.log('─'.repeat(60));

    const totalSavings = totalOriginalSize - totalWebpSize;
    const totalSavingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1);

    console.log(`Total Original Size: ${(totalOriginalSize / 1024).toFixed(1)} KB`);
    console.log(`Total WebP Size:     ${(totalWebpSize / 1024).toFixed(1)} KB`);
    console.log(`Total Savings:       ${(totalSavings / 1024).toFixed(1)} KB (${totalSavingsPercent}%)`);

    console.log('\n📋 Individual Results:');
    conversions.forEach(conv => {
        console.log(`  ${conv.filename}: ${conv.savings}% reduction`);
    });

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Test the website to ensure images load correctly');
    console.log('2. Run lighthouse audit to measure performance improvement');
    console.log('3. Consider removing original JPG/PNG files if not needed');

    console.log('\n✅ WebP Conversion Complete!');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Conversion failed:', error);
        process.exit(1);
    });
}

export { convertToWebP, findImagesToConvert };
