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
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-5 text-center">
        <FolderOpen size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">لا توجد تصنيفات بعد</p>
        <p className="text-xs text-gray-400 mt-1">أضف تصنيفاً لأي منتج وسيظهر هنا لإدارته وترتيبه</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
      {list.map((cat, i) => (
        <div
          key={cat}
          draggable={editing === null}
          onDragStart={() => onDragStart(i)}
          onDragOver={(e) => onDragOver(e, i)}
          onDrop={onDrop}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          <GripVertical size={16} className="text-gray-300 cursor-grab active:cursor-grabbing hidden sm:block flex-shrink-0" />

          {/* Mobile arrows */}
          <div className="flex flex-col sm:hidden">
            <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-300 disabled:opacity-20"><ChevronUp size={14} /></button>
            <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="text-gray-300 disabled:opacity-20"><ChevronDown size={14} /></button>
          </div>

          {editing === cat ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(cat); if (e.key === 'Escape') setEditing(null) }}
              autoFocus
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
            />
          ) : (
            <span className="flex-1 text-sm font-medium text-gray-800">{cat}</span>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {editing === cat ? (
              <>
                <button onClick={() => saveRename(cat)} className="w-7 h-7 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50"><Check size={15} /></button>
                <button onClick={() => setEditing(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"><X size={15} /></button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditing(cat); setEditValue(cat) }} disabled={busy} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"><Pencil size={14} /></button>
                <ConfirmDialog
                  title={`حذف تصنيف "${cat}"`}
                  description="المنتجات لن تُحذف، فقط يُزال التصنيف عنها."
                  confirmLabel="حذف"
                  onConfirm={() => remove(cat)}
                  trigger={
                    <button disabled={busy} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
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
