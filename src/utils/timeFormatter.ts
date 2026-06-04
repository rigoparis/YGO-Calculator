/**
 * Utility to format seconds into a tabular-friendly MM:SS timer representation.
 * Handles negative time limits if overtime needs to be tracked.
 * 
 * @param seconds The total number of seconds remaining or elapsed
 * @returns Formatted time string (e.g. "40:00" or "-02:15")
 */
export function formatTime(seconds: number): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const remainingSecs = Math.floor(absSeconds % 60);
  
  const paddedMins = String(minutes).padStart(2, '0');
  const paddedSecs = String(remainingSecs).padStart(2, '0');
  
  return `${isNegative ? '-' : ''}${paddedMins}:${paddedSecs}`;
}
