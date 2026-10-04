import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ResizerTool from './features/Resizer/ResizerTool.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-accent-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ResizerTool />} />
          <Route path="/job-application-photo-resizer" element={
            <ResizerTool 
              customTitle="Photo Resizer for Job Applications"
              customDesc="Resize your photo to exactly 600x600 pixels or under 100KB for Applicant Tracking Systems and job portals."
              defaultWidth={600}
              defaultHeight={600}
            />
          } />
          <Route path="/passport-size-photo-maker" element={
            <ResizerTool 
              customTitle="Passport Size Photo Maker & Resizer"
              customDesc="Create pixel-perfect passport size photos online. Secure and runs locally in your browser."
              defaultWidth={600}
              defaultHeight={600}
            />
          } />
          <Route path="/compress-image-to-100kb" element={
            <ResizerTool 
              customTitle="Compress Image to 100KB Online"
              customDesc="Easily compress images and photos to under 100KB for exams, applications, and student portals."
              defaultQuality={0.6}
            />
          } />
          <Route path="*" element={<ResizerTool />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
