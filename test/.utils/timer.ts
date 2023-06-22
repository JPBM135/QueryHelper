import { performance } from 'perf_hooks';

export function timerHelper() {
  const start = performance.now();
  return () => performance.now() - start;
}
