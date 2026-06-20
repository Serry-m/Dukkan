import type { Store } from '@/types'
import { isPro } from '@/lib/plan'

// Brand SVGs (from 21st.dev logo search), injected raw and scaled to the wrapper.
const INSTAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132.004 132" width="100%" height="100%"><defs><linearGradient id="dk-ig-a"><stop offset="0" stop-color="#fd5"/><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></linearGradient><radialGradient id="dk-ig-b" cx="158.429" cy="578.088" r="65" gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.402 454.004)" gradientUnits="userSpaceOnUse" xlink:href="#dk-ig-a" xmlns:xlink="http://www.w3.org/1999/xlink"/></defs><path fill="url(#dk-ig-b)" d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 17.547.957 25.96 1.027 42.66c.025 6.27.057 13.98.057 22.367 0 27.142.028 35.087.156 36.628.45 5.42 1.3 8.83 3.1 12.56 3.44 7.137 10.01 12.494 17.75 14.49 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.006 14.24-7.282 17.75-14.516 1.765-3.64 2.66-7.18 3.065-12.32.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.223-1.305-8.733-3.127-12.443-1.495-3.037-3.155-5.305-5.565-7.624C116.747 4 108.346.957 91.633 1.027 85.363 1.05 77.658 1.082 69.27 1.082c-1.474-.001-2.713-.082-4.24-.082z" transform="translate(.991 .991) scale(.97817)"/><path fill="#fff" d="M66.004 18.834c-12.81 0-14.418.056-19.448.285-5.02.23-8.448 1.024-11.45 2.19-3.1 1.205-5.73 2.816-8.35 5.438-2.62 2.62-4.23 5.25-5.44 8.35-1.17 3-1.965 6.43-2.19 11.448-.225 5.03-.284 6.64-.284 19.45 0 12.81.057 14.413.286 19.443.23 5.02 1.024 8.448 2.19 11.45 1.205 3.1 2.816 5.73 5.438 8.35 2.62 2.62 5.25 4.235 8.35 5.44 3.002 1.165 6.43 1.96 11.45 2.19 5.03.23 6.638.285 19.447.285 12.81 0 14.413-.055 19.443-.285 5.02-.23 8.45-1.025 11.453-2.19 3.1-1.205 5.725-2.82 8.345-5.44 2.62-2.62 4.23-5.25 5.44-8.35 1.16-3.002 1.955-6.43 2.19-11.45.225-5.03.285-6.633.285-19.443 0-12.81-.06-14.42-.285-19.45-.235-5.02-1.03-8.448-2.19-11.448-1.21-3.1-2.82-5.73-5.44-8.35-2.62-2.622-5.245-4.233-8.35-5.438-3.01-1.166-6.438-1.96-11.458-2.19-5.03-.23-6.633-.285-19.443-.285zm-4.232 8.504c1.256-.002 2.658 0 4.232 0 12.595 0 14.087.045 19.06.272 4.598.21 7.094.978 8.758 1.624 2.2.855 3.77 1.877 5.42 3.528 1.65 1.65 2.672 3.222 3.529 5.422.646 1.662 1.414 4.158 1.623 8.756.227 4.972.276 6.465.276 19.054 0 12.59-.05 14.083-.276 19.055-.21 4.598-.977 7.094-1.623 8.756-.855 2.2-1.879 3.768-3.53 5.418-1.65 1.65-3.218 2.672-5.418 3.527-1.663.648-4.16 1.414-8.758 1.624-4.972.227-6.465.276-19.06.276-12.596 0-14.088-.05-19.06-.276-4.598-.212-7.094-.98-8.758-1.626-2.2-.854-3.773-1.877-5.424-3.527-1.65-1.65-2.672-3.22-3.529-5.421-.646-1.662-1.414-4.158-1.623-8.756-.227-4.972-.272-6.465-.272-19.062 0-12.597.045-14.082.272-19.054.21-4.598.977-7.094 1.623-8.758.855-2.2 1.879-3.772 3.53-5.422 1.65-1.65 3.222-2.672 5.422-3.529 1.665-.648 4.16-1.414 8.758-1.625 4.351-.196 6.037-.255 14.829-.265zm29.41 7.838c-3.128 0-5.666 2.535-5.666 5.664 0 3.128 2.538 5.666 5.666 5.666 3.127 0 5.665-2.538 5.665-5.666 0-3.128-2.538-5.666-5.666-5.666zm-25.179 6.62c-13.376 0-24.222 10.846-24.222 24.223 0 13.376 10.846 24.217 24.222 24.217 13.376 0 24.218-10.84 24.218-24.217 0-13.376-10.843-24.222-24.219-24.222zm0 8.504c8.68 0 15.719 7.037 15.719 15.718 0 8.68-7.04 15.718-15.72 15.718-8.68 0-15.718-7.038-15.718-15.718 0-8.68 7.037-15.718 15.718-15.718z"/></svg>`

const FACEBOOK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`

const TIKTOK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`

function RawIcon({ svg, size }: { svg: string; size: number }) {
  return <span style={{ width: size, height: size, display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

// Turns a handle or URL into a full profile URL.
function buildUrl(platform: 'instagram' | 'facebook' | 'tiktok', value: string): string {
  const v = value.trim()
  if (v.startsWith('http')) return v
  const handle = v.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${handle}`
  if (platform === 'facebook') return `https://facebook.com/${handle}`
  return `https://tiktok.com/@${handle}`
}

export function StoreSocials({ store, size = 18 }: { store: Store; size?: number }) {
  // Social links are a Pro feature — don't surface them on free storefronts.
  if (!isPro(store)) return null

  const links: { key: 'instagram' | 'facebook' | 'tiktok'; svg: string; label: string }[] = []
  if (store.instagram) links.push({ key: 'instagram', svg: INSTAGRAM, label: 'إنستجرام' })
  if (store.facebook) links.push({ key: 'facebook', svg: FACEBOOK, label: 'فيسبوك' })
  if (store.tiktok) links.push({ key: 'tiktok', svg: TIKTOK, label: 'تيك توك' })
  if (!links.length) return null

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.key}
          href={buildUrl(l.key, store[l.key]!)}
          target="_blank"
          rel="noreferrer"
          aria-label={l.label}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <RawIcon svg={l.svg} size={size} />
        </a>
      ))}
    </div>
  )
}
