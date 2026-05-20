import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserIdFromToken() {
  const token = typeof window !== 'undefined' ? localStorage.getItem("woo-token") : null;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.data?.user?.id || payload.id; // Adjust based on your JWT structure
  } catch (e) {
    return null;
  }
}
