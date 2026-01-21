import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function roleToLink(role: string) {
  return role.split(" ").join("-").toLowerCase();
}

export function generateTin() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  let prefix = "";
  for (let i = 0; i < 3; i++) {
    prefix += letters[Math.floor(Math.random() * letters.length)];
  }

  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += digits[Math.floor(Math.random() * digits.length)];
  }

  return `${prefix}${suffix}`;
}