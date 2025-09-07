#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Performance Comparison Tool
 * Compares before/after metrics for optimization impact analysis
 */

const METRICS_FILE = path.join(process.cwd(), 'performance-metrics.json');

async function getCurrentMetrics() {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');

    try {
        // Bundle analysis
        const distFiles = await fs.readdir(distPath);
        const bundleFiles = distFiles.filter(f => f.endsWith('.js') || f.endsWith('.css'));

        let totalBundleSize = 0;
        const fileBreakdown = {};

        for (const file of bundleFiles) {
            const stats = await fs.stat(path.join(distPath, file));
            const sizeKB = stats.size / 1024;
            totalBundleSize += sizeKB;
            fileBreakdown[file] = sizeKB;
        }

        // Image analysis
        const publicFiles = await fs.readdir(publicPath);
        const imageFiles = publicFiles.filter(f =>
            f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
        );

        let totalImageSize = 0;
        const imageBreakdown = {};

        for (const file of imageFiles) {
            const stats = await fs.stat(path.join(publicPath, file));
            const sizeKB = stats.size / 1024;
            totalImageSize += sizeKB;
            imageBreakdown[file] = sizeKB;
        }

        return {
            timestamp: new Date().toISOString(),
            bundle: {
                total: Math.round(totalBundleSize * 100) / 100,
                files: fileBreakdown
            },
            images: {
                total: Math.round(totalImageSize * 100) / 100,
                files: imageBreakdown
            }
        };
    } catch (error) {
        throw new Error(`Failed to analyze current metrics: ${error.message}`);
    }
}

async function saveMetrics(metrics, label = 'current') {
    try {
        let allMetrics = {};

        // Try to load existing metrics
        try {
            const existing = await fs.readFile(METRICS_FILE, 'utf8');
            allMetrics = JSON.parse(existing);
        } catch {
            // File doesn't exist yet
        }

        allMetrics[label] = metrics;

        await fs.writeFile(METRICS_FILE, JSON.stringify(allMetrics, null, 2));
        console.log(`✅ Metrics saved as '${label}'`);
    } catch (error) {
        throw new Error(`Failed to save metrics: ${error.message}`);
    }
}

async function compareMetrics(beforeLabel = 'before', afterLabel = 'current') {
    try {
        const data = await fs.readFile(METRICS_FILE, 'utf8');
        const allMetrics = JSON.parse(data);

        const before = allMetrics[beforeLabel];
        const after = allMetrics[afterLabel];

        if (!before || !after) {
            throw new Error(`Missing metrics for comparison. Available: ${Object.keys(allMetrics).join(', ')}`);
        }

        console.log('📊 Performance Comparison Report\n');
        console.log('═'.repeat(80));

        // Bundle comparison
        const bundleDiff = after.bundle.total - before.bundle.total;
        const bundlePercent = ((bundleDiff / before.bundle.total) * 100).toFixed(1);

        console.log('\n📦 Bundle Size Analysis:');
        console.log('─'.repeat(50));
        console.log(`Before: ${before.bundle.total} KB`);
        console.log(`After:  ${after.bundle.total} KB`);
        console.log(`Change: ${bundleDiff > 0 ? '+' : ''}${bundleDiff.toFixed(1)} KB (${bundlePercent}%)`);

        if (bundleDiff < 0) {
            console.log(`🎉 Bundle size reduced by ${Math.abs(bundleDiff).toFixed(1)} KB!`);
        } else if (bundleDiff > 0) {
            console.log(`⚠️  Bundle size increased by ${bundleDiff.toFixed(1)} KB`);
        } else {
            console.log(`✅ Bundle size unchanged`);
        }

        // Image comparison
        const imageDiff = after.images.total - before.images.total;
        const imagePercent = before.images.total > 0 ? ((imageDiff / before.images.total) * 100).toFixed(1) : '0';

        console.log('\n🖼️  Image Size Analysis:');
        console.log('─'.repeat(50));
        console.log(`Before: ${before.images.total} KB`);
        console.log(`After:  ${after.images.total} KB`);
        console.log(`Change: ${imageDiff > 0 ? '+' : ''}${imageDiff.toFixed(1)} KB (${imagePercent}%)`);

        if (imageDiff < 0) {
            console.log(`🎉 Image size reduced by ${Math.abs(imageDiff).toFixed(1)} KB!`);
        } else if (imageDiff > 0) {
            console.log(`⚠️  Image size increased by ${imageDiff.toFixed(1)} KB`);
        } else {
            console.log(`✅ Image size unchanged`);
        }

        // Total comparison
        const totalBefore = before.bundle.total + before.images.total;
        const totalAfter = after.bundle.total + after.images.total;
        const totalDiff = totalAfter - totalBefore;
        const totalPercent = ((totalDiff / totalBefore) * 100).toFixed(1);

        console.log('\n🎯 Total Impact:');
        console.log('─'.repeat(50));
        console.log(`Before: ${totalBefore.toFixed(1)} KB`);
        console.log(`After:  ${totalAfter.toFixed(1)} KB`);
        console.log(`Change: ${totalDiff > 0 ? '+' : ''}${totalDiff.toFixed(1)} KB (${totalPercent}%)`);

        // Performance impact estimation
        console.log('\n📈 Estimated Performance Impact:');
        console.log('─'.repeat(50));

        if (totalDiff < -100) {
            console.log('🚀 Significant improvement expected (>100KB saved)');
            console.log('   • Faster initial page load');
            console.log('   • Reduced bandwidth usage');
            console.log('   • Better mobile performance');
        } else if (totalDiff < -50) {
            console.log('✅ Good improvement expected (50-100KB saved)');
            console.log('   • Noticeable load time improvement');
            console.log('   • Better user experience');
        } else if (totalDiff < 0) {
            console.log('⬆️  Minor improvement expected (<50KB saved)');
        } else {
            console.log('➡️  No significant size change');
        }

        console.log('\n═'.repeat(80));

        return {
            bundleDiff,
            imageDiff,
            totalDiff,
            totalPercent: parseFloat(totalPercent)
        };

    } catch (error) {
        throw new Error(`Failed to compare metrics: ${error.message}`);
    }
}

async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'save':
            const label = process.argv[3] || 'current';
            const metrics = await getCurrentMetrics();
            await saveMetrics(metrics, label);
            console.log('\n📊 Current Metrics:');
            console.log(`Bundle: ${metrics.bundle.total} KB`);
            console.log(`Images: ${metrics.images.total} KB`);
            console.log(`Total: ${(metrics.bundle.total + metrics.images.total).toFixed(1)} KB`);
            break;

        case 'compare':
            const before = process.argv[3] || 'before';
            const after = process.argv[4] || 'current';
            await compareMetrics(before, after);
            break;

        case 'current':
            const current = await getCurrentMetrics();
            console.log('📊 Current Performance Metrics\n');
            console.log('Bundle Size:', current.bundle.total, 'KB');
            console.log('Image Size:', current.images.total, 'KB');
            console.log('Total Size:', (current.bundle.total + current.images.total).toFixed(1), 'KB');
            break;

        default:
            console.log('📊 Performance Comparison Tool\n');
            console.log('Usage:');
            console.log('  npm run perf:save [label]     - Save current metrics');
            console.log('  npm run perf:compare [before] [after] - Compare metrics');
            console.log('  npm run perf:current          - Show current metrics');
            console.log('\nExample workflow:');
            console.log('  1. npm run perf:save before   # Save baseline');
            console.log('  2. # Make optimizations');
            console.log('  3. npm run build');
            console.log('  4. npm run perf:save after    # Save results');
            console.log('  5. npm run perf:compare before after');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Performance analysis failed:', error);
        process.exit(1);
    });
}

export { getCurrentMetrics, saveMetrics, compareMetrics };
