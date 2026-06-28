'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandMark } from '@/components/BrandMark'

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
      if (error.message.includes('rate limit')) {
        setError('تم إرسال عدد كبير من الطلبات — انتظر ساعة وحاول مرة أخرى')
      } else {
        setError('حدث خطأ، تأكد من البريد الإلكتروني')
      }
      return
    }
    setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور — تحقق من بريدك الإلكتروني')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-[#F4F0E8] via-[#FBFAF7] to-[#FBFAF7]" dir="rtl">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#16a34a]/10 rounded-full blur-3xl" />
      <Card className="relative w-full max-w-md border-[#ECE7DC] shadow-[var(--shadow-lift)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3"><BrandMark size={48} className="rounded-2xl" /></div>
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
            {success && <div className="bg-[#D8F0DE] text-[#15803d] border border-[#bfe3c8] text-sm p-3 rounded-lg">{success}</div>}

            <div className="space-y-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            </div>

            {mode === 'login' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }} className="text-xs text-[#15803d] hover:underline font-medium">
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d]" disabled={loading}>
              {loading ? 'جاري...' : mode === 'login' ? 'دخول' : 'إرسال رابط التعيين'}
            </Button>

            {mode === 'login' ? (
              <p className="text-sm text-center text-[#74716a]">
                ليس لديك حساب؟{' '}
                <Link href="/signup" className="text-[#15803d] hover:underline font-bold">سجل الآن</Link>
              </p>
            ) : (
              <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null) }} className="text-sm text-[#74716a] hover:text-[#1d1b16]">
                ← رجوع لتسجيل الدخول
              </button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
