import { useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { Helmet } from 'react-helmet-async'
import {
  Lock,
  Unlock,
  Trash2,
  Download,
  Loader2,
  ImageIcon,
  ArrowRight,
  FolderArchive,
  RotateCcw,
} from 'lucide-react'
import Dropzone from '../../components/Dropzone.jsx'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import AdBanner from '../../components/AdBanner.jsx'
import { downloadBlob, baseName, formatBytes } from '../../lib/download.js'
import {
  PRESETS,
  FORMATS,
  loadImage,
  computeTargetSize,
  resolveOutputFormat,
  resizeToBlob,
} from '../../lib/resize.js'

let uid = 0
const nextId = () => `img-${++uid}-${Date.now()}`

export default function ResizerTool({ 
  customTitle, 
  customDesc, 
  defaultWidth = 1024, 
  defaultHeight = 768, 
  defaultPresetIndex = 0, 
  defaultQuality = 0.85 
}) {
  const [items, setItems] = useState([])
  const [unit, setUnit] = useState('px')
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const [lastEdited, setLastEdited] = useState('width')
  const [lockAspect, setLockAspect] = useState(true)
  const [percent, setPercent] = useState(50)
  const [presetIndex, setPresetIndex] = useState(defaultPresetIndex)
  const [formatKey, setFormatKey] = useState('original')
  const [quality, setQuality] = useState(defaultQuality)

  const title = customTitle || 'Free Online Image Resizer for Job Applications & Exams'
  const desc = customDesc || 'Resize photos to exact pixels or percentage for job portals, university admissions, and ID cards. Everything runs locally in your browser — your images are never uploaded.'
  const [preventUpscale, setPreventUpscale] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const firstImageRef = useRef(true)

  const showQuality = useMemo(() => {
    if (formatKey === 'png') return false
    if (formatKey === 'original') return items.some((i) => i.file.type !== 'image/png')
    return true
  }, [formatKey, items])

  async function handleFiles(files) {
    const loaded = await Promise.all(
      files.map(async (file) => {
        const { img, url } = await loadImage(file)
        return {
          id: nextId(),
          file,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          status: 'ready',
          resultBlob: null,
          resultUrl: null,
          resultWidth: null,
          resultHeight: null,
          resultSize: null,
        }
      }),
    )
    if (firstImageRef.current && loaded[0]) {
      setWidth(loaded[0].width)
      setHeight(loaded[0].height)
      firstImageRef.current = false
    }
    setItems((prev) => [...prev, ...loaded])
  }

  function removeItem(id) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id)
      if (found) {
        URL.revokeObjectURL(found.url)
        if (found.resultUrl) URL.revokeObjectURL(found.resultUrl)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  function clearAll() {
    items.forEach((i) => {
      URL.revokeObjectURL(i.url)
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl)
    })
    setItems([])
    firstImageRef.current = true
  }

  function onWidthChange(v) {
    setLastEdited('width')
    setWidth(v)
    setPresetIndex(0)
  }
  function onHeightChange(v) {
    setLastEdited('height')
    setHeight(v)
    setPresetIndex(0)
  }
  function onPresetChange(idx) {
    setPresetIndex(idx)
    const preset = PRESETS[idx]
    if (preset.w) {
      setWidth(preset.w)
      setHeight(preset.h)
      setLastEdited('width')
      setLockAspect(false)
    }
  }

  const settings = { unit, width, height, percent, lockAspect, lastEdited, preventUpscale }

  async function resizeAll() {
    if (!items.length) return
    setIsProcessing(true)
    setItems((prev) => prev.map((i) => ({ ...i, status: 'processing' })))

    for (const item of items) {
      try {
        const target = computeTargetSize(item, settings)
        const outFormat = resolveOutputFormat(formatKey, item.file.type)
        const blob = await resizeToBlob(item.file, {
          width: target.width,
          height: target.height,
          mime: outFormat.mime,
          quality,
        })
        const resultUrl = URL.createObjectURL(blob)
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'done',
                  resultBlob: blob,
                  resultUrl,
                  resultWidth: target.width,
                  resultHeight: target.height,
                  resultSize: blob.size,
                  resultExt: outFormat.ext,
                }
              : i,
          ),
        )
      } catch (err) {
        console.error(err)
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i)))
      }
    }
    setIsProcessing(false)
  }

  function downloadOne(item) {
    if (!item.resultBlob) return
    downloadBlob(item.resultBlob, `${baseName(item.file.name)}-resized.${item.resultExt}`)
  }

  async function downloadAllZip() {
    const done = items.filter((i) => i.resultBlob)
    if (!done.length) return
    const zip = new JSZip()
    done.forEach((item) => {
      zip.file(`${baseName(item.file.name)}-resized.${item.resultExt}`, item.resultBlob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'resized-images.zip')
  }

  const doneCount = items.filter((i) => i.status === 'done').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Helmet>
        <title>{title} (100% Private)</title>
        <meta name="description" content={desc} />
      </Helmet>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-500">
          {desc}
        </p>
        <div className="mt-6">
          <AdBanner options={{ key: '1d21efbd0ebce1b68eb923a243d080b5', format: 'iframe', height: 90, width: 728, params: {} }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Settings panel */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Resize settings</h3>

          <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
            {['px', 'percent'].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={
                  'flex-1 rounded-md py-1.5 transition-colors ' +
                  (unit === u ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')
                }
              >
                {u === 'px' ? 'Pixels' : 'Percentage'}
              </button>
            ))}
          </div>

          {unit === 'px' ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Preset</label>
                <Select
                  value={presetIndex}
                  onChange={(val) => onPresetChange(val)}
                  options={PRESETS.map((p, idx) => ({ value: idx, label: p.label }))}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={Math.round(width)}
                    onChange={(e) => onWidthChange(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button
                  onClick={() => setLockAspect((v) => !v)}
                  title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  className={
                    'mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ' +
                    (lockAspect
                      ? 'border-brand-300 bg-brand-50 text-brand-600'
                      : 'border-slate-300 text-slate-400 hover:text-slate-600')
                  }
                >
                  {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Height (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={Math.round(height)}
                    onChange={(e) => onHeightChange(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {lockAspect
                  ? 'Height is calculated per image to keep its original proportions.'
                  : 'Images will be stretched to this exact size.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Scale</span>
                <span className="font-semibold text-brand-600">{percent}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min="1"
                max="500"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value) || 1)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-slate-400">Scales width and height together, per image.</p>
            </div>
          )}

          <div className="my-5 h-px bg-slate-100" />

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Output format</label>
              <Select
                value={formatKey}
                onChange={(val) => setFormatKey(val)}
                options={FORMATS}
              />
            </div>

            {showQuality && (
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Quality</span>
                  <span className="font-semibold text-brand-600">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="1"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={preventUpscale}
                onChange={(e) => setPreventUpscale(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-brand-600 focus:ring-brand-500"
              />
              Don't enlarge smaller images
            </label>
          </div>

          <Button
            onClick={resizeAll}
            disabled={!items.length || isProcessing}
            className="mt-5 w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Resizing…
              </>
            ) : (
              <>Resize {items.length ? `${items.length} image${items.length > 1 ? 's' : ''}` : 'images'}</>
            )}
          </Button>
          <div className="mt-6">
            <AdBanner options={{ key: 'd18c853ae1b75bbdf50babef60dd5460', format: 'iframe', height: 50, width: 320, params: {} }} />
          </div>
        </aside>

        {/* Queue */}
        <div>
          <Dropzone onFiles={handleFiles} compact={items.length > 0} />

          {items.length > 0 && (
            <>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {items.length} image{items.length > 1 ? 's' : ''} · {doneCount} resized
                </p>
                <div className="flex gap-2">
                  {doneCount > 1 && (
                    <Button variant="secondary" size="sm" onClick={downloadAllZip}>
                      <FolderArchive className="h-4 w-4" /> Download all (.zip)
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4" /> Clear all
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <ImageRow key={item.id} item={item} onRemove={removeItem} onDownload={downloadOne} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SEO & Trust Content Section */}
      <div className="mt-16 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Why Use Our Tool for Official Documents?</h2>
          <p className="mt-2 text-slate-500">Perfect for students, job seekers, and administrators.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">100% Private & Secure</h3>
            <p className="mt-2 text-sm text-slate-600">Unlike other tools, our image resizer runs entirely in your browser. Your photos are never uploaded to a server, making it completely safe for sensitive ID cards and passport photos.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Job Application Ready</h3>
            <p className="mt-2 text-sm text-slate-600">Most ATS (Applicant Tracking Systems) and university portals have strict limits (e.g., exactly 600x600 pixels or under 100KB). Use our exact pixel resizing and quality slider to meet these requirements instantly.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Fast Bulk Processing</h3>
            <p className="mt-2 text-sm text-slate-600">Need to resize 50 employee photos? Drag and drop them all at once. Our client-side processing handles bulk resizing in seconds, directly from your computer's memory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageRow({ item, onRemove, onDownload }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <img src={item.url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>
            {item.width}×{item.height} · {formatBytes(item.size)}
          </span>
          {item.status === 'done' && (
            <>
              <ArrowRight className="h-3 w-3 text-brand-400" />
              <span className="font-medium text-emerald-600">
                {item.resultWidth}×{item.resultHeight} · {formatBytes(item.resultSize)}
              </span>
            </>
          )}
          {item.status === 'error' && <span className="font-medium text-rose-500">Failed to process</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-brand-500" />}
        {item.status === 'done' && (
          <Button variant="secondary" size="sm" onClick={() => onDownload(item)}>
            <Download className="h-4 w-4" /> Save
          </Button>
        )}
        {item.status === 'ready' && <ImageIcon className="h-5 w-5 text-slate-300" />}
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="!px-2">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
