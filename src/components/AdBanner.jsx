import { useEffect, useRef } from 'react'

export default function AdBanner({ options }) {
  const bannerRef = useRef(null)

  useEffect(() => {
    if (!bannerRef.current || bannerRef.current.hasChildNodes()) return

    const conf = document.createElement('script')
    conf.type = 'text/javascript'
    conf.innerHTML = `atOptions = ${JSON.stringify(options)};`

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://bauval.org/22/${options.key}`
    script.async = true

    bannerRef.current.appendChild(conf)
    bannerRef.current.appendChild(script)
  }, [options])

  return (
    <div className="flex w-full justify-center my-4 overflow-hidden min-h-[50px]">
      <div ref={bannerRef} />
    </div>
  )
}
