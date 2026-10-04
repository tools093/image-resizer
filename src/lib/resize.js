import Pica from 'pica'

const pica = Pica()

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

export const PRESETS = [
  { label: 'Custom', w: null, h: null },
  { label: 'Instagram Post — 1080 × 1080', w: 1080, h: 1080 },
  { label: 'Instagram Story / Reel — 1080 × 1920', w: 1080, h: 1920 },
  { label: 'Facebook Cover — 820 × 312', w: 820, h: 312 },
  { label: 'X (Twitter) Post — 1600 × 900', w: 1600, h: 900 },
  { label: 'LinkedIn Banner — 1584 × 396', w: 1584, h: 396 },
  { label: 'YouTube Thumbnail — 1280 × 720', w: 1280, h: 720 },
  { label: 'Full HD — 1920 × 1080', w: 1920, h: 1080 },
  { label: 'Square Avatar — 512 × 512', w: 512, h: 512 },
]

export const FORMATS = [
  { value: 'original', label: 'Keep original', mime: null, ext: null },
  { value: 'png', label: 'PNG (lossless)', mime: 'image/png', ext: 'png' },
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { value: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp' },
]

export function resolveOutputFormat(formatKey, sourceMime) {
  if (formatKey === 'original') {
    if (sourceMime === 'image/png') return FORMATS[1]
    if (sourceMime === 'image/jpeg') return FORMATS[2]
    if (sourceMime === 'image/webp') return FORMATS[3]
    return FORMATS[1]
  }
  return FORMATS.find((f) => f.value === formatKey) ?? FORMATS[1]
}

export function computeTargetSize(item, settings) {
  const { unit, width, height, percent, lockAspect, lastEdited, preventUpscale } = settings
  let targetW
  let targetH

  if (unit === 'percent') {
    const p = Math.max(1, percent) / 100
    targetW = item.width * p
    targetH = item.height * p
  } else if (lockAspect) {
    const ratio = item.width / item.height
    if (lastEdited === 'height') {
      targetH = height
      targetW = height * ratio
    } else {
      targetW = width
      targetH = width / ratio
    }
  } else {
    targetW = width
    targetH = height
  }

  if (preventUpscale && (targetW > item.width || targetH > item.height)) {
    if (unit === 'percent' || lockAspect) {
      const scale = Math.min(item.width / targetW, item.height / targetH, 1)
      targetW *= scale
      targetH *= scale
    } else {
      targetW = Math.min(targetW, item.width)
      targetH = Math.min(targetH, item.height)
    }
  }

  return {
    width: Math.max(1, Math.round(targetW)),
    height: Math.max(1, Math.round(targetH)),
  }
}

export async function resizeToBlob(file, { width, height, mime, quality }) {
  const { img, url } = await loadImage(file)
  try {
    const srcCanvas = document.createElement('canvas')
    srcCanvas.width = img.naturalWidth
    srcCanvas.height = img.naturalHeight
    srcCanvas.getContext('2d').drawImage(img, 0, 0)

    const destCanvas = document.createElement('canvas')
    destCanvas.width = width
    destCanvas.height = height

    await pica.resize(srcCanvas, destCanvas, {
      quality: 3,
      alpha: mime === 'image/png' || mime === 'image/webp',
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    })

    const blob = await pica.toBlob(destCanvas, mime, mime === 'image/png' ? undefined : quality)
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}
