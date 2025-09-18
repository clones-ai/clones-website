interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500 ${className}`}></div>
  );
}