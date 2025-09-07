#!/usr/bin/env node

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';

const urls = [
    'http://localhost:5173/',
    'http://localhost:5173/forge',
    'http://localhost:5173/marketplace',
    'http://localhost:5173/meta-datasets'
];

const config = {
    extends: 'lighthouse:default',
    settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop',
        throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        },
    },
};

const mobileConfig = {
    ...config,
    settings: {
        ...config.settings,
        formFactor: 'mobile',
        screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
        },
        throttling: {
            rttMs: 150,
            throughputKbps: 1638,
            cpuSlowdownMultiplier: 4,
        },
    },
};

async function runLighthouseAudit(url, config, device = 'desktop') {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'info',
        output: 'json',
        port: chrome.port,
    };

    try {
        const runnerResult = await lighthouse(url, options, config);
        await chrome.kill();

        const { lhr } = runnerResult;
        return {
            url,
            device,
            scores: {
                performance: Math.round(lhr.categories.performance.score * 100),
                accessibility: Math.round(lhr.categories.accessibility.score * 100),
                bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
                seo: Math.round(lhr.categories.seo.score * 100),
            },
            metrics: {
                fcp: lhr.audits['first-contentful-paint'].numericValue,
                lcp: lhr.audits['largest-contentful-paint'].numericValue,
                cls: lhr.audits['cumulative-layout-shift'].numericValue,
                tbt: lhr.audits['total-blocking-time'].numericValue,
                tti: lhr.audits['interactive'].numericValue,
            },
            opportunities: lhr.audits['unused-javascript'] ? {
                unusedJavaScript: lhr.audits['unused-javascript'].details?.items?.length || 0,
                unusedCSS: lhr.audits['unused-css-rules'].details?.items?.length || 0,
                renderBlocking: lhr.audits['render-blocking-resources'].details?.items?.length || 0,
            } : {},
            fullReport: lhr,
        };
    } catch (error) {
        await chrome.kill();
        throw error;
    }
}

async function generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(process.cwd(), 'lighthouse-reports');

    try {
        await fs.mkdir(reportDir, { recursive: true });
    } catch {
        // Directory might already exist
    }

    // Generate summary report
    let summary = `# Lighthouse Audit Report\n\n**Generated:** ${new Date().toISOString()}\n\n`;

    summary += `## Summary\n\n`;
    summary += `| Page | Device | Performance | Accessibility | Best Practices | SEO |\n`;
    summary += `|------|--------|-------------|---------------|----------------|----||\n`;

    let totalScores = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
    let count = 0;

    for (const result of results) {
        const pageName = result.url.split('/').pop() || 'home';
        summary += `| ${pageName} | ${result.device} | ${result.scores.performance} | ${result.scores.accessibility} | ${result.scores.bestPractices} | ${result.scores.seo} |\n`;

        if (result.device === 'desktop') { // Only count desktop for averages
            totalScores.performance += result.scores.performance;
            totalScores.accessibility += result.scores.accessibility;
            totalScores.bestPractices += result.scores.bestPractices;
            totalScores.seo += result.scores.seo;
            count++;
        }
    }

    // Add averages
    summary += `\n**Desktop Averages:**\n`;
    summary += `- Performance: ${Math.round(totalScores.performance / count)}\n`;
    summary += `- Accessibility: ${Math.round(totalScores.accessibility / count)}\n`;
    summary += `- Best Practices: ${Math.round(totalScores.bestPractices / count)}\n`;
    summary += `- SEO: ${Math.round(totalScores.seo / count)}\n\n`;

    // Add performance metrics
    summary += `## Core Web Vitals\n\n`;
    for (const result of results.filter(r => r.device === 'desktop')) {
        const pageName = result.url.split('/').pop() || 'home';
        summary += `### ${pageName}\n`;
        summary += `- **FCP:** ${Math.round(result.metrics.fcp)}ms\n`;
        summary += `- **LCP:** ${Math.round(result.metrics.lcp)}ms ${result.metrics.lcp > 2500 ? '❌' : '✅'}\n`;
        summary += `- **CLS:** ${result.metrics.cls.toFixed(3)} ${result.metrics.cls > 0.1 ? '❌' : '✅'}\n`;
        summary += `- **TBT:** ${Math.round(result.metrics.tbt)}ms\n`;
        summary += `- **TTI:** ${Math.round(result.metrics.tti)}ms\n\n`;
    }

    // Add recommendations
    summary += `## Recommendations\n\n`;
    const perfIssues = results.filter(r => r.scores.performance < 90);
    if (perfIssues.length > 0) {
        summary += `### Performance Issues (Score < 90)\n`;
        for (const issue of perfIssues) {
            const pageName = issue.url.split('/').pop() || 'home';
            summary += `- **${pageName}** (${issue.device}): ${issue.scores.performance}/100\n`;
        }
        summary += `\n`;
    }

    const accessIssues = results.filter(r => r.scores.accessibility < 95);
    if (accessIssues.length > 0) {
        summary += `### Accessibility Issues (Score < 95)\n`;
        for (const issue of accessIssues) {
            const pageName = issue.url.split('/').pop() || 'home';
            summary += `- **${pageName}** (${issue.device}): ${issue.scores.accessibility}/100\n`;
        }
        summary += `\n`;
    }

    // Save summary
    const summaryPath = path.join(reportDir, `lighthouse-summary-${timestamp}.md`);
    await fs.writeFile(summaryPath, summary);

    // Save detailed JSON reports
    for (const result of results) {
        const pageName = result.url.split('/').pop() || 'home';
        const fileName = `lighthouse-${pageName}-${result.device}-${timestamp}.json`;
        const filePath = path.join(reportDir, fileName);
        await fs.writeFile(filePath, JSON.stringify(result.fullReport, null, 2));
    }

    console.log(`\n📊 Lighthouse Audit Complete!`);
    console.log(`📁 Reports saved to: ${reportDir}`);
    console.log(`📋 Summary: ${summaryPath}`);

    // Print quick summary to console
    console.log(`\n🎯 Quick Summary:`);
    console.log(`Average Performance: ${Math.round(totalScores.performance / count)}/100`);
    console.log(`Average Accessibility: ${Math.round(totalScores.accessibility / count)}/100`);
    console.log(`Average Best Practices: ${Math.round(totalScores.bestPractices / count)}/100`);
    console.log(`Average SEO: ${Math.round(totalScores.seo / count)}/100`);

    return summaryPath;
}

async function main() {
    console.log('🚀 Starting Lighthouse audits...');
    console.log('📝 Testing pages:', urls);

    const results = [];

    try {
        // Test desktop performance
        console.log('\n🖥️  Running desktop audits...');
        for (const url of urls) {
            console.log(`  Testing: ${url}`);
            const result = await runLighthouseAudit(url, config, 'desktop');
            results.push(result);
            console.log(`  ✅ Performance: ${result.scores.performance}/100`);
        }

        // Test mobile performance
        console.log('\n📱 Running mobile audits...');
        for (const url of urls) {
            console.log(`  Testing: ${url}`);
            const result = await runLighthouseAudit(url, mobileConfig, 'mobile');
            results.push(result);
            console.log(`  ✅ Performance: ${result.scores.performance}/100`);
        }

        await generateReport(results);

    } catch (error) {
        console.error('❌ Lighthouse audit failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runLighthouseAudit, generateReport };
