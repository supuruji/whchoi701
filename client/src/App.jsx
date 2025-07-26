import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PapersPage from './pages/PapersPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App