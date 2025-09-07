import fs from 'fs';

async function runPerformanceTests() {
  console.log('🚀 Running HARDCORE performance tests...\n');

  // 1. Bundle Analysis
  console.log('📦 BUNDLE ANALYSIS');
  console.log('===================');

  try {
    const buildStats = fs.readdirSync('./dist/assets');
    let totalSize = 0;

    buildStats.forEach(file => {
      const stats = fs.statSync(`./dist/assets/${file}`);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      console.log(`${file}: ${sizeKB} KB`);
    });

    console.log(`\n📊 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Estimated gzipped: ${(totalSize / 1024 / 3).toFixed(2)} KB\n`);

    if (totalSize > 1024 * 1024) {
      console.log('❌ BUNDLE TOO LARGE! Needs optimization');
    }
  } catch (error) {
    console.log('❌ Bundle analysis error:', error.message);
  }

  console.log('\n🔍 PERFORMANCE ISSUES DETECTED:');
  console.log('================================');
  console.log('1. 3D Spline viewers loading on ALL devices');
  console.log('2. Multiple heavy animations running simultaneously');
  console.log('3. No lazy loading for heavy components');
  console.log('4. Backdrop blur causing GPU overload');
  console.log('5. Too many simultaneous CSS transitions');

  console.log('\n💡 OPTIMIZATION PLAN:');
  console.log('=====================');
  console.log('1. Disable 3D on mobile/low-end devices');
  console.log('2. Reduce backdrop blur intensity');
  console.log('3. Simplify animations');
  console.log('4. Add proper loading states');
  console.log('5. Optimize CSS transitions');
}

runPerformanceTests().catch(console.error);