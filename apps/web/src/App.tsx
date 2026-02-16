import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Developers } from './pages/Developers'
import { Teams } from './pages/Teams'
import { Repositories } from './pages/Repositories'
import { Commits } from './pages/Commits'
import { Settings } from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/commits" element={<Commits />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
