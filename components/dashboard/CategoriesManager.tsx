'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GripVertical, Pencil, Trash2, Check, X, FolderOpen, ChevronUp, ChevronDown } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Props = {
  storeId: string
  categories: string[] // already in display order
}

export default function CategoriesManager({ storeId, categories }: Props) {
  const router = useRouter()
  const [list, setList] = useState<string[]>(categories)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [busy, setBusy] = useState(false)
  const dragIndex = useRef<number | null>(null)

  async function persistOrder(next: string[]) {
    setList(next)
    const supabase = createClient()
    await supabase.from('stores').update({ category_order: next }).eq('id', storeId)
    router.refresh()
  }

  // ----- Drag and drop (desktop) -----
  function onDragStart(i: number) { dragIndex.current = i }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === i) return
    const next = [...list]
    const [moved] = next.splice(from, 1)
    next.splice(i, 0, moved)
    dragIndex.current = i
    setList(next)
  }
  function onDrop() {
    dragIndex.current = null
    persistOrder(list)
  }

  // ----- Arrow reorder (mobile fallback) -----
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    persistOrder(next)
  }

  // ----- Rename (updates every product in that category) -----
  async function saveRename(oldName: string) {
    const newName = editValue.trim()
    setEditing(null)
    if (!newName || newName === oldName) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('products').update({ category: newName }).eq('store_id', storeId).eq('category', oldName)
    const next = list.map((c) => (c === oldName ? newName : c))
    await persistOrder(next)
    setBusy(false)
  }

  // ----- Delete (clears category from its products) -----
  async function remove(name: string) {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('products').update({ category: null }).eq('store_id', storeId).eq('category', name)
    await persistOrder(list.filter((c) => c !== name))
    setBusy(false)
  }

  if (!list.length) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#e0d9c9] p-8 text-center">
        <FolderOpen size={30} className="mx-auto text-[#d8d2c5] mb-2.5" />
        <p className="text-sm font-bold text-[#1d1b16]">لا توجد تصنيفات بعد</p>
        <p className="text-xs text-[#9a9488] mt-1">أضف تصنيفاً لأي منتج وسيظهر هنا لإدارته وترتيبه.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {list.map((cat, i) => (
        <div
          key={cat}
          draggable={editing === null}
          onDragStart={() => onDragStart(i)}
          onDragOver={(e) => onDragOver(e, i)}
          onDrop={onDrop}
          className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#ECE7DC] rounded-xl"
        >
          <GripVertical size={17} className="text-[#c9bfa9] cursor-grab active:cursor-grabbing hidden sm:block flex-shrink-0" />

          {/* Mobile arrows */}
          <div className="flex flex-col sm:hidden flex-shrink-0">
            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="لأعلى" className="text-[#9a9488] disabled:opacity-20 hover:text-[#1d1b16]"><ChevronUp size={15} /></button>
            <button onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="لأسفل" className="text-[#9a9488] disabled:opacity-20 hover:text-[#1d1b16]"><ChevronDown size={15} /></button>
          </div>

          {editing === cat ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(cat); if (e.key === 'Escape') setEditing(null) }}
              autoFocus
              className="flex-1 min-w-0 bg-white border border-[#ECE7DC] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15"
            />
          ) : (
            <span className="flex-1 min-w-0 text-[14px] font-bold text-[#1d1b16] truncate">{cat}</span>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {editing === cat ? (
              <>
                <button onClick={() => saveRename(cat)} aria-label="حفظ" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#15803d] hover:bg-[#EAF6EC] transition-colors"><Check size={16} /></button>
                <button onClick={() => setEditing(null)} aria-label="إلغاء" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9a9488] hover:bg-[#F4F0E8] transition-colors"><X size={16} /></button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditing(cat); setEditValue(cat) }} disabled={busy} aria-label="تعديل" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9a9488] hover:text-[#1d1b16] hover:bg-[#F4F0E8] transition-colors"><Pencil size={15} /></button>
                <ConfirmDialog
                  title={`حذف تصنيف "${cat}"`}
                  description="المنتجات لن تُحذف، فقط يُزال التصنيف عنها."
                  confirmLabel="حذف"
                  onConfirm={() => remove(cat)}
                  trigger={
                    <button disabled={busy} aria-label="حذف" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9a9488] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                  }
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
