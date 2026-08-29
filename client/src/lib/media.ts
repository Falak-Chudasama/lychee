export type MediaFormat = 'mp4' | 'mp3'

export const BACKEND = '/api'

export const mp4Qualities = ['best', '2160p', '1440p', '1080p', '720p', '480p', '360p'] as const
export const mp3Qualities = ['320', '192', '128'] as const

export interface MediaInfo {
  title: string
  thumbnail: string
  uploader: string
  duration: number | null
}

export function buildInfoUrl(url: string) {
  return `${BACKEND}/info?url=${encodeURIComponent(url)}`
}

export function buildDownloadUrl(url: string, format: MediaFormat, quality: string) {
  return `${BACKEND}/download/file?url=${encodeURIComponent(url)}&format=${format}&quality=${encodeURIComponent(quality)}`
}

export function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}

export function qualityLabel(format: MediaFormat, quality: string) {
  return format === 'mp4' ? quality : `${quality} kbps`
}

export function defaultQualityFor(format: MediaFormat) {
  return format === 'mp4' ? mp4Qualities[0] : mp3Qualities[0]
}

export function formatDuration(totalSeconds: number | null) {
  if (totalSeconds === null || Number.isNaN(totalSeconds)) return '—'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}