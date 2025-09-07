#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

async function analyzeBundleSize() {
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');

    console.log('📊 Bundle Size Analysis\n');

    try {
        const files = await fs.readdir(assetsPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        const cssFiles = files.filter(f => f.endsWith('.css'));

        let totalSize = 0;
        const fileAnalysis = [];

        // Analyze JS files
        for (const file of jsFiles) {
            const filePath = path.join(assetsPath, file);
            const stats = await fs.stat(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;

            let category = 'Unknown';
            if (file.includes('vendor')) category = 'Vendor Dependencies';
            else if (file.includes('motion')) category = 'Framer Motion';
            else if (file.includes('router')) category = 'React Router';
            else if (file.includes('icons')) category = 'Icons';
            else if (file.includes('index')) category = 'Main Application';

            fileAnalysis.push({
                file,
                category,
                size: stats.size,
                sizeKB: parseFloat(sizeKB)
            });
        }

        // Analyze CSS files
        for (const file of cssFiles) {
            const filePath = path.join(assetsPath, file);
            const stats = await fs.stat(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;

            fileAnalysis.push({
                file,
                category: 'Stylesheets',
                size: stats.size,
                sizeKB: parseFloat(sizeKB)
            });
        }

        // Sort by size
        fileAnalysis.sort((a, b) => b.size - a.size);

        console.log('📦 File Analysis:');
        console.log('─'.repeat(80));
        console.log(`${'File'.padEnd(35)} ${'Category'.padEnd(20)} ${'Size'.padStart(10)}`);
        console.log('─'.repeat(80));

        for (const file of fileAnalysis) {
            const fileName = file.file.length > 34 ? file.file.substring(0, 31) + '...' : file.file;
            console.log(`${fileName.padEnd(35)} ${file.category.padEnd(20)} ${(file.sizeKB + ' KB').padStart(10)}`);
        }

        console.log('─'.repeat(80));
        console.log(`${'TOTAL'.padEnd(35)} ${''.padEnd(20)} ${((totalSize / 1024).toFixed(2) + ' KB').padStart(10)}`);

        // Category summary
        const categoryTotals = {};
        for (const file of fileAnalysis) {
            if (!categoryTotals[file.category]) {
                categoryTotals[file.category] = { size: 0, count: 0 };
            }
            categoryTotals[file.category].size += file.sizeKB;
            categoryTotals[file.category].count++;
        }

        console.log('\n📊 By Category:');
        console.log('─'.repeat(50));
        Object.entries(categoryTotals)
            .sort((a, b) => b[1].size - a[1].size)
            .forEach(([category, data]) => {
                const percentage = ((data.size / (totalSize / 1024)) * 100).toFixed(1);
                console.log(`${category.padEnd(25)} ${(data.size.toFixed(2) + ' KB').padStart(12)} (${percentage}%)`);
            });

        // Performance recommendations
        console.log('\n💡 Optimization Recommendations:');
        console.log('─'.repeat(50));

        const vendorSize = categoryTotals['Vendor Dependencies']?.size || 0;
        const motionSize = categoryTotals['Framer Motion']?.size || 0;
        const totalSizeKB = totalSize / 1024;

        if (vendorSize > 150) {
            console.log('⚠️  Vendor bundle is large (>150KB). Consider:');
            console.log('   - Tree shaking unused dependencies');
            console.log('   - Code splitting for vendor chunks');
        }

        if (motionSize > 140) {
            console.log('⚠️  Framer Motion bundle is large (>140KB). Consider:');
            console.log('   - Using only specific motion components');
            console.log('   - Lazy loading complex animations');
        }

        if (totalSizeKB > 400) {
            console.log('⚠️  Total bundle size is large (>400KB). Consider:');
            console.log('   - Route-based code splitting');
            console.log('   - Dynamic imports for heavy components');
        }

        if (totalSizeKB < 350) {
            console.log('✅ Bundle size is within acceptable range (<350KB)');
        }

        console.log('\n🎯 Performance Targets:');
        console.log(`   Current: ${totalSizeKB.toFixed(2)} KB`);
        console.log(`   Target:  <350 KB`);
        console.log(`   Status:  ${totalSizeKB <= 350 ? '✅ GOOD' : '⚠️  NEEDS OPTIMIZATION'}`);

        return {
            totalSizeKB,
            fileAnalysis,
            categoryTotals,
            recommendations: {
                vendorOptimization: vendorSize > 150,
                motionOptimization: motionSize > 140,
                codeSplitting: totalSizeKB > 400,
                withinTarget: totalSizeKB <= 350
            }
        };

    } catch (error) {
        console.error('❌ Error analyzing bundle:', error.message);
        console.log('💡 Make sure to run "npm run build" first');
        return null;
    }
}

async function analyzeDependencies() {
    console.log('\n📚 Dependency Analysis\n');

    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const deps = packageJson.dependencies || {};
        const devDeps = packageJson.devDependencies || {};

        console.log('📦 Production Dependencies:');
        console.log('─'.repeat(50));
        Object.entries(deps).forEach(([name, version]) => {
            let status = '';
            if (name.includes('motion')) status = ' (Animation - Heavy)';
            else if (name.includes('react')) status = ' (Core)';
            else if (name.includes('spline')) status = ' (3D - Heavy)';
            else if (name.includes('router')) status = ' (Navigation)';

            console.log(`  ${name.padEnd(25)} ${version.padStart(15)}${status}`);
        });

        console.log(`\n📊 Total Production Dependencies: ${Object.keys(deps).length}`);
        console.log(`📊 Total Dev Dependencies: ${Object.keys(devDeps).length}`);

        // Heavy dependencies warning
        const heavyDeps = Object.keys(deps).filter(dep =>
            dep.includes('motion') || dep.includes('spline') || dep.includes('three')
        );

        if (heavyDeps.length > 0) {
            console.log('\n⚠️  Heavy Dependencies Detected:');
            heavyDeps.forEach(dep => {
                console.log(`   - ${dep}`);
            });
            console.log('   Consider lazy loading or tree shaking these packages.');
        }

    } catch (error) {
        console.error('❌ Error analyzing dependencies:', error.message);
    }
}

async function main() {
    console.log('🔍 Clones Website - Bundle & Dependency Analysis\n');
    console.log('═'.repeat(80));

    const bundleAnalysis = await analyzeBundleSize();
    await analyzeDependencies();

    console.log('\n═'.repeat(80));
    console.log('✅ Analysis Complete!');

    if (bundleAnalysis && !bundleAnalysis.recommendations.withinTarget) {
        console.log('\n🚨 Action Required: Bundle size optimization needed');
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { analyzeBundleSize, analyzeDependencies };
