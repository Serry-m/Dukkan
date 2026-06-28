'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Implicit flow: Supabase puts #access_token=...&type=recovery in the hash.
    // The browser client auto-parses it and fires PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // PKCE flow: Supabase puts ?code= in the query string.
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError('الرابط منتهي الصلاحية. اطلب رابطاً جديداً من صفحة تسجيل الدخول.')
        } else {
          setReady(true)
        }
      })
    }

    // If neither flow triggers within 6 seconds, show an error.
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) {
          setError('الرابط غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً من صفحة تسجيل الدخول.')
        }
        return current
      })
    }, 6000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [searchParams])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('حدث خطأ أثناء الحفظ، حاول مرة أخرى.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleReset}>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {!ready && !error && (
          <div className="text-center py-6">
            <div className="inline-block w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#74716a] mt-3">جاري التحقق من الرابط...</p>
          </div>
        )}

        {ready && (
          <>
            <div className="space-y-1">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </>
        )}
      </CardContent>

      {ready && (
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[#16a34a] hover:bg-[#15803d]"
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </Button>
        </CardFooter>
      )}
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-[#F4F0E8] via-[#FBFAF7] to-[#FBFAF7]" dir="rtl">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#16a34a]/10 rounded-full blur-3xl" />
      <Card className="relative w-full max-w-md border-[#ECE7DC] shadow-[var(--shadow-lift)]">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D8F0DE] flex items-center justify-center mx-auto mb-3">
            <KeyRound size={22} className="text-[#15803d]" />
          </div>
          <CardTitle className="text-2xl">تعيين كلمة مرور جديدة</CardTitle>
          <CardDescription>أدخل كلمة المرور الجديدة لحسابك</CardDescription>
        </CardHeader>
        <Suspense fallback={
          <CardContent>
            <div className="text-center py-6">
              <div className="inline-block w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        }>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  )
}
