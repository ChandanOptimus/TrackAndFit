export interface User {
  id: string;
  name: string;
  accent: string; // personal accent colour used across their pages
  accentSoft: string;
}

export const USERS: User[] = [
  { id: "chandan", name: "Chandan", accent: "#0ea5a4", accentSoft: "#d5f5f2" },
  { id: "ankita", name: "Ankita", accent: "#ec4899", accentSoft: "#fde0ef" },
];

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}
