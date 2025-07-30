/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      url?: string;
      loading?: string;
      'auto-rotate'?: string;
      'auto-play'?: string;
      'background-color'?: string;
      'animation-speed'?: string;
      'mouse-controls'?: string;
      'touch-controls'?: string;
    };
  }
}