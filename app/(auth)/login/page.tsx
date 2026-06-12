'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Mode = 'login' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError('حدث خطأ، تأكد من البريد الإلكتروني')
      return
    }
    setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور — تحقق من بريدك الإلكتروني')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🛍️</div>
          <CardTitle className="text-2xl">
            {mode === 'login' ? 'تسجيل الدخول' : 'نسيت كلمة المرور؟'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'أدر متجرك على واتساب' : 'أدخل بريدك وسنرسل لك رابط التعيين'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={mode === 'login' ? handleLogin : handleForgot}>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">{success}</div>}

            <div className="space-y-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            </div>

            {mode === 'login' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }} className="text-xs text-green-600 hover:underline">
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'جاري...' : mode === 'login' ? 'دخول' : 'إرسال رابط التعيين'}
            </Button>

            {mode === 'login' ? (
              <p className="text-sm text-center text-gray-500">
                ليس لديك حساب؟{' '}
                <Link href="/signup" className="text-green-600 hover:underline font-medium">سجل الآن</Link>
              </p>
            ) : (
              <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null) }} className="text-sm text-gray-500 hover:text-gray-700">
                ← رجوع لتسجيل الدخول
              </button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
