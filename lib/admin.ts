// Who can access the /admin ops dashboard.
// Set ADMIN_EMAILS in env (comma-separated) to your own login email(s).
export function isAdminEmail(email: string | null | undefined): boolean {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && admins.includes(email.toLowerCase())
}
