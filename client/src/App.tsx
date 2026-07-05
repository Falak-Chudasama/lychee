import { useMemo, useState } from 'react'
import { Select } from './components/Select'
import {
  AlertIcon,
  ClockIcon,
  DownloadIcon,
  ImageIcon,
  LinkIcon,
  LycheeMark,
  SearchIcon,
  SpinnerIcon,
  UserIcon,
} from './components/icons'
import {
  type MediaFormat,
  buildDownloadUrl,
  buildInfoUrl,
  defaultQualityFor,
  formatDuration,
  isLikelyUrl,
  mp3Qualities,
  mp4Qualities,
  qualityLabel,
} from './lib/media'

export default function App() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<MediaFormat>('mp4')
  const [quality, setQuality] = useState<string>(defaultQualityFor('mp4'))
  const [loading, setLoading] = useState(false)
  const [fetchingInfo, setFetchingInfo] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [uploader, setUploader] = useState('')
  const [duration, setDuration] = useState<number | null>(null)

  const qualityOptions = useMemo(() => {
    const source = format === 'mp4' ? mp4Qualities : mp3Qualities
    return source.map((option) => ({ value: option, label: qualityLabel(format, option) }))
  }, [format])

  const trimmedUrl = url.trim()
  const canSubmit = trimmedUrl.length > 0 && !loading && !fetchingInfo

  const resetMediaInfo = () => {
    setTitle('')
    setThumbnail('')
    setUploader('')
    setDuration(null)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (error) setError('')
  }

  const handleFormatChange = (next: MediaFormat) => {
    setFormat(next)
    setQuality(defaultQualityFor(next))
  }

  const validateUrl = () => {
    if (!trimmedUrl) {
      setError('Paste a YouTube URL first.')
      return false
    }
    if (!isLikelyUrl(trimmedUrl)) {
      setError('That does not look like a valid URL.')
      return false
    }
    return true
  }

  const fetchInfo = async () => {
    if (!validateUrl()) return

    setFetchingInfo(true)
    setError('')

    try {
      const res = await fetch(buildInfoUrl(trimmedUrl))
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? 'Could not fetch media info.')
      }

      const data = await res.json()
      setTitle(data.title ?? '')
      setThumbnail(data.thumbnail ?? '')
      setUploader(data.uploader ?? '')
      setDuration(typeof data.duration === 'number' ? data.duration : null)
    } catch (err) {
      resetMediaInfo()
      setError(err instanceof Error ? err.message : 'Failed to fetch media info.')
    } finally {
      setFetchingInfo(false)
    }
  }

  const download = () => {
    if (!validateUrl()) return

    setError('')
    setLoading(true)

    const downloadUrl = buildDownloadUrl(trimmedUrl, format, quality)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.rel = 'noreferrer'
    anchor.target = '_blank'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    window.setTimeout(() => setLoading(false), 1000)
  }

  return (
    <main className="max-h-screen px-4 py-8 text-lychee-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur md:p-8">
            <label htmlFor="media-url" className="block text-sm font-semibold text-lychee-ink">
              YouTube URL
            </label>
            <div className="relative mt-2">
              <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lychee-seed" />
              <input
                id="media-url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="focus-ring w-full rounded-2xl border border-lychee-border bg-lychee-membrane-100/70 py-3 pl-11 pr-4 text-sm text-lychee-ink transition placeholder:text-lychee-ink/35 focus:border-lychee-shell focus:bg-white"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-sm font-semibold text-lychee-ink">Format</span>
                <div
                  role="radiogroup"
                  aria-label="Format"
                  className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-lychee-border bg-lychee-membrane-100 p-2"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={format === 'mp4'}
                    onClick={() => handleFormatChange('mp4')}
                    className={`focus-ring rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      format === 'mp4'
                        ? 'bg-lychee-shell text-white shadow'
                        : 'bg-white/60 text-lychee-ink hover:bg-white'
                    }`}
                  >
                    MP4
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={format === 'mp3'}
                    onClick={() => handleFormatChange('mp3')}
                    className={`focus-ring rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      format === 'mp3'
                        ? 'bg-lychee-shell text-white shadow'
                        : 'bg-white/60 text-lychee-ink hover:bg-white'
                    }`}
                  >
                    MP3
                  </button>
                </div>
              </div>

              <Select label="Quality" value={quality} options={qualityOptions} onChange={setQuality} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchInfo}
                disabled={!canSubmit}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-lychee-border bg-white px-5 py-3 text-sm font-semibold text-lychee-seed-700 transition hover:bg-lychee-membrane-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fetchingInfo ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
                {fetchingInfo ? 'Checking…' : 'Load info'}
              </button>

              <button
                type="button"
                onClick={download}
                disabled={!canSubmit}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-lychee-shell px-5 py-3 text-sm font-semibold text-white transition hover:bg-lychee-shell-600 active:bg-lychee-shell-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                {loading ? 'Opening download…' : 'Download'}
              </button>
            </div>

            {error ? (
              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-lychee-shell-200 bg-lychee-shell-50 px-4 py-3 text-sm text-lychee-shell-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur md:p-8">
            <div className="text-sm font-semibold text-lychee-ink">Preview</div>

            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title || 'Thumbnail'}
                className="mt-4 aspect-video w-full rounded-2xl border border-lychee-border object-cover"
              />
            ) : (
              <div className="mt-4 flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-lychee-border bg-lychee-membrane-100 text-sm text-lychee-ink/45">
                <ImageIcon className="h-6 w-6" />
                Thumbnail will appear here
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-lychee-ink/45">
                  Title
                </div>
                <div className="mt-1 text-sm font-semibold text-lychee-ink">
                  {title || 'No media loaded yet'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-lychee-border bg-lychee-membrane-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-lychee-seed">
                    <UserIcon className="h-3.5 w-3.5" />
                    Uploader
                  </div>
                  <div className="mt-1 text-sm font-semibold text-lychee-ink">{uploader || '—'}</div>
                </div>

                <div className="rounded-2xl border border-lychee-border bg-lychee-membrane-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-lychee-seed">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Duration
                  </div>
                  <div className="mt-1 text-sm font-semibold text-lychee-ink">
                    {formatDuration(duration)}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
