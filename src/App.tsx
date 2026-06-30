import AppRoutes from '@/routes/AppRoutes'
import Navbar from '@/components/Navbar'

function App() {
  return (
    <div className="app-container">
      <header>
        <Navbar />
      </header>
      <main id="main-content">
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
