#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';


/**
 * Image optimization script for production builds
 * Converts images to WebP and generates responsive sizes
 */

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const WEBP_QUALITY = 85;

async function findImages(directory) {
    const images = [];

    try {
        const files = await fs.readdir(directory, { recursive: true });

        for (const file of files) {
            const fullPath = path.join(directory, file);
            const ext = path.extname(file).toLowerCase();

            if (SUPPORTED_FORMATS.includes(ext)) {
                const stats = await fs.stat(fullPath);
                if (stats.isFile()) {
                    images.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.warn(`Could not read directory ${directory}:`, error.message);
    }

    return images;
}

async function analyzeImageUsage() {
    const publicDir = path.join(process.cwd(), 'public');
    const srcDir = path.join(process.cwd(), 'src');

    console.log('🔍 Analyzing image usage...');

    // Find all images in public directory
    const publicImages = await findImages(publicDir);

    // Find image references in source code
    const sourceFiles = await fs.readdir(srcDir, { recursive: true });
    const imageReferences = new Set();

    for (const file of sourceFiles) {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            try {
                const fullPath = path.join(srcDir, file);
                const content = await fs.readFile(fullPath, 'utf8');

                // Find image references
                const imageMatches = content.match(/['"`]\/[^'"`]*\.(jpg|jpeg|png|webp)['"`]/g);
                if (imageMatches) {
                    imageMatches.forEach(match => {
                        const cleanPath = match.slice(1, -1); // Remove quotes
                        imageReferences.add(cleanPath);
                    });
                }
            } catch {
                // Skip files that can't be read
            }
        }
    }

    console.log(`📊 Found ${publicImages.length} images in public directory`);
    console.log(`📊 Found ${imageReferences.size} image references in source code`);

    return { publicImages, imageReferences: Array.from(imageReferences) };
}

async function generateOptimizationPlan() {
    const { publicImages, imageReferences } = await analyzeImageUsage();

    const plan = {
        critical: [], // Images referenced in source (need WebP + responsive)
        unused: [],   // Images not referenced (can be removed)
        large: [],    // Images > 500KB (need compression)
        unoptimized: [] // Images without WebP equivalent
    };

    for (const imagePath of publicImages) {
        const stats = await fs.stat(imagePath);
        const sizeKB = stats.size / 1024;

        // Check if image is referenced in source
        const isReferenced = imageReferences.some(ref => ref.includes(path.basename(imagePath)));

        if (isReferenced) {
            plan.critical.push({ path: imagePath, size: sizeKB });
        } else {
            plan.unused.push({ path: imagePath, size: sizeKB });
        }

        if (sizeKB > 500) {
            plan.large.push({ path: imagePath, size: sizeKB });
        }

        // Check if WebP version exists
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        try {
            await fs.access(webpPath);
        } catch {
            plan.unoptimized.push({ path: imagePath, size: sizeKB });
        }
    }

    return plan;
}

async function displayOptimizationReport() {
    console.log('🖼️  Image Optimization Analysis\n');
    console.log('═'.repeat(80));

    const plan = await generateOptimizationPlan();

    // Critical images
    if (plan.critical.length > 0) {
        console.log('\n🔥 CRITICAL IMAGES (Referenced in source):');
        console.log('─'.repeat(50));
        plan.critical.forEach(({ path, size }) => {
            const fileName = path.split('/').pop();
            console.log(`  ${fileName.padEnd(30)} ${size.toFixed(1).padStart(8)} KB`);
        });
        console.log(`\n  Total: ${plan.critical.length} images, ${plan.critical.reduce((sum, img) => sum + img.size, 0).toFixed(1)} KB`);
    }

    // Large images
    if (plan.large.length > 0) {
        console.log('\n⚠️  LARGE IMAGES (>500KB):');
        console.log('─'.repeat(50));
        plan.large.forEach(({ path, size }) => {
            const fileName = path.split('/').pop();
            console.log(`  ${fileName.padEnd(30)} ${size.toFixed(1).padStart(8)} KB`);
        });
    }

    // Unoptimized images
    if (plan.unoptimized.length > 0) {
        console.log('\n📸 UNOPTIMIZED IMAGES (No WebP):');
        console.log('─'.repeat(50));
        plan.unoptimized.forEach(({ path, size }) => {
            const fileName = path.split('/').pop();
            console.log(`  ${fileName.padEnd(30)} ${size.toFixed(1).padStart(8)} KB`);
        });
    }

    // Unused images
    if (plan.unused.length > 0) {
        console.log('\n🗑️  UNUSED IMAGES (Not referenced):');
        console.log('─'.repeat(50));
        plan.unused.forEach(({ path, size }) => {
            const fileName = path.split('/').pop();
            console.log(`  ${fileName.padEnd(30)} ${size.toFixed(1).padStart(8)} KB`);
        });
        console.log(`\n  Potential savings: ${plan.unused.reduce((sum, img) => sum + img.size, 0).toFixed(1)} KB`);
    }

    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('─'.repeat(50));

    if (plan.critical.length > 0) {
        console.log(`  1. Convert ${plan.critical.length} critical images to WebP format`);
        console.log(`  2. Generate responsive sizes for hero images`);
    }

    if (plan.large.length > 0) {
        console.log(`  3. Compress ${plan.large.length} large images (quality: ${WEBP_QUALITY}%)`);
    }

    if (plan.unused.length > 0) {
        console.log(`  4. Remove ${plan.unused.length} unused images (${plan.unused.reduce((sum, img) => sum + img.size, 0).toFixed(1)} KB savings)`);
    }

    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    console.log('─'.repeat(50));
    console.log('  To optimize images automatically:');
    console.log('    npm install --save-dev @squoosh/lib');
    console.log('    npm run optimize:images:convert');
    console.log('');
    console.log('  To implement in components:');
    console.log('    import { OptimizedImage } from "./components/shared/OptimizedImage";');
    console.log('    <OptimizedImage src="/image.jpg" alt="Description" priority />');

    console.log('\n═'.repeat(80));
    console.log('✅ Image Analysis Complete!');

    return plan;
}

async function main() {
    try {
        await displayOptimizationReport();
    } catch (error) {
        console.error('❌ Image analysis failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { analyzeImageUsage, generateOptimizationPlan, displayOptimizationReport };
