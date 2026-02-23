export function isAdmin(user: { role: string; isSuperAdmin: boolean }): boolean {
  return user.role === "admin" || user.isSuperAdmin;
}
