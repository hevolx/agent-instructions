/**
 * Check if stdout is connected to a TTY (terminal).
 * Returns true if interactive, false if piped/redirected/CI.
 */
export function isInteractiveTTY(): boolean {
  return process.stdout.isTTY === true;
}
