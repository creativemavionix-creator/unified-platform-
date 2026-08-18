import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrgName(name: string): string {
  if (!name) return "My Workspace";
  
  let clean = name;
  if (clean.length > 5 && /\d+$/.test(clean)) {
    clean = clean.replace(/\d+$/, "");
  }
  
  clean = clean
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
    
  clean = clean
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();

  const lower = clean.toLowerCase();
  if (
    !lower.endsWith("workspace") && 
    !lower.endsWith("labs") && 
    !lower.endsWith("org") && 
    !lower.endsWith("co") && 
    !lower.endsWith("inc") &&
    !lower.endsWith("group")
  ) {
    clean = `${clean} Workspace`;
  }
  
  return clean;
}
