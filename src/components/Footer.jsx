import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Popular Resizing Tools</h3>
            <ul className="space-y-2 text-slate-500">
              <li><Link to="/job-application-photo-resizer" className="hover:text-brand-600 transition-colors">Job Application Photo Resizer</Link></li>
              <li><Link to="/passport-size-photo-maker" className="hover:text-brand-600 transition-colors">Passport Size Photo Maker</Link></li>
              <li><Link to="/compress-image-to-100kb" className="hover:text-brand-600 transition-colors">Compress Image to 100KB</Link></li>
              <li><Link to="/" className="hover:text-brand-600 transition-colors">Standard Image Resizer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Tools</h3>
            <ul className="space-y-2 text-slate-500">
              <li><a href="../bgremover/" className="hover:text-brand-600 transition-colors">Background Remover</a></li>
              <li><a href="../pdf/" className="hover:text-brand-600 transition-colors">PDF Text Editor</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          Tools · runs entirely in your browser · no files ever leave your device
        </div>
      </div>
    </footer>
  )
}
