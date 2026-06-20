import type { SupabaseClient } from '@supabase/supabase-js'

// Who can access the /admin ops dashboard.
// Set ADMIN_EMAILS in env (comma-separated) to your own login email(s).
export function isAdminEmail(email: string | null | undefined): boolean {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && admins.includes(email.toLowerCase())
}

// Record an admin action to the audit log. Best-effort — never throws (a
// logging failure must not block the action itself).
export async function logAdminAction(
  admin: SupabaseClient,
  entry: {
    adminEmail: string
    action: string
    targetStoreId?: string | null
    targetEmail?: string | null
    detail?: string | null
  }
) {
  try {
    await admin.from('admin_actions').insert({
      admin_email: entry.adminEmail,
      action: entry.action,
      target_store_id: entry.targetStoreId ?? null,
      target_email: entry.targetEmail ?? null,
      detail: entry.detail ?? null,
    })
  } catch {
    // swallow — logging is non-critical
  }
}
