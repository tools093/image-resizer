import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export default function Dropzone({
  onFiles,
  accept = 'image/*',
  multiple = true,
  title = 'Drop images here',
  subtitle = 'or click to browse · PNG, JPG, WEBP',
  compact = false,
}) {
  const inputRef = useRef(null)
  const [isOver, setIsOver] = useState(false)

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
      if (files.length) onFiles(files)
    },
    [onFiles],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={
        'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors ' +
        (compact ? 'gap-2 p-6' : 'gap-3 p-12') +
        ' ' +
        (isOver
          ? 'border-brand-500 bg-brand-50'
          : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/50')
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-transform group-hover:scale-105">
        <UploadCloud className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}
