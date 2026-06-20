'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Coupon } from '@/types'
import { currencyLabel } from '@/lib/currency'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2, Plus, Ticket } from 'lucide-react'
import { toast } from 'sonner'

type Props = { storeId: string; currency: string; coupons: Coupon[]; usage?: Record<string, number> }

export default function CouponsManager({ storeId, currency, coupons: initial, usage = {} }: Props) {
  const [coupons, setCoupons] = useState(initial)
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const curr = currencyLabel(currency)

  async function add() {
    const c = code.trim().toUpperCase()
    const v = parseFloat(value)
    if (!c || !v || v <= 0) { toast.error('أدخل كوداً وقيمة صحيحة'); return }
    if (type === 'percent' && v > 100) { toast.error('النسبة لا تتجاوز ١٠٠٪'); return }
    setBusy(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('coupons').insert({ store_id: storeId, code: c, type, value: v }).select().single()
    setBusy(false)
    if (error) { toast.error(error.code === '23505' ? 'هذا الكود موجود بالفعل' : 'تعذّر الإضافة'); return }
    setCoupons((prev) => [data as Coupon, ...prev])
    setCode(''); setValue('')
    toast.success('تمت إضافة الكود')
  }

  async function toggle(cp: Coupon) {
    const supabase = createClient()
    await supabase.from('coupons').update({ active: !cp.active }).eq('id', cp.id)
    setCoupons((prev) => prev.map((c) => (c.id === cp.id ? { ...c, active: !c.active } : c)))
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('coupons').delete().eq('id', id)
    setCoupons((prev) => prev.filter((c) => c.id !== id))
    toast.success('تم حذف الكود')
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="code">الكود</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SALE20" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ctype">نوع الخصم</Label>
            <select
              id="ctype"
              value={type}
              onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
              className="w-full h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="percent">نسبة ٪</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="cval">{type === 'percent' ? 'النسبة (٪)' : `القيمة (${curr})`}</Label>
          <Input id="cval" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percent' ? '20' : '50'} dir="ltr" />
        </div>
        <Button onClick={add} disabled={busy} className="w-full bg-green-600 hover:bg-green-700 gap-1.5">
          <Plus size={16} /> إضافة كود
        </Button>
      </div>

      {/* List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <Ticket size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">لا توجد أكواد بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((cp) => (
            <div key={cp.id} className="bg-white rounded-xl ring-1 ring-foreground/[0.07] p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Ticket size={16} className="text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 tracking-wide" dir="ltr">{cp.code}</p>
                <p className="text-xs text-gray-400">
                  خصم {cp.type === 'percent' ? `${cp.value.toLocaleString('ar-EG')}٪` : `${cp.value.toLocaleString('ar-EG')} ${curr}`}
                  {(usage[cp.code] ?? 0) > 0 && ` · استُخدم ${(usage[cp.code]).toLocaleString('ar-EG')}×`}
                </p>
              </div>
              <span className={`text-xs font-medium hidden sm:inline flex-shrink-0 ${cp.active ? 'text-green-600' : 'text-gray-400'}`}>
                {cp.active ? 'مفعّل' : 'موقوف'}
              </span>
              <button
                onClick={() => toggle(cp)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${cp.active ? 'bg-green-500' : 'bg-gray-300'}`}
                aria-label="تفعيل/إيقاف"
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${cp.active ? 'right-1' : 'right-6'}`} />
              </button>
              <ConfirmDialog
                title="حذف الكود"
                description={`حذف كود "${cp.code}" نهائياً؟`}
                confirmLabel="حذف"
                onConfirm={() => remove(cp.id)}
                trigger={
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
