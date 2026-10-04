import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ResizerTool from './features/Resizer/ResizerTool.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-accent-50">
      <Header />
      <main className="flex-1">
        <ResizerTool />
      </main>
      <Footer />
    </div>
  )
}
