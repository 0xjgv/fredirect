export function isInteger(value: string | number | undefined): boolean {
  try {
    return value ? Number.isInteger(+value) : false;
  } catch (_) {
    return false;
  }
}
