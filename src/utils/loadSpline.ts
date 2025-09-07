export async function loadSplineViewer() {
  if (customElements.get('spline-viewer')) return;
  await import('@splinetool/viewer');
}