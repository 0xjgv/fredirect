import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function isInteger(value: string | number | undefined): boolean {
  try {
    return value ? Number.isInteger(+value) : false;
  } catch (_) {
    return false;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
