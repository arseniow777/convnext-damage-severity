import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueId(seed: string) {
  return `${seed}-${Math.random().toString(36).slice(2, 9)}`;
}
