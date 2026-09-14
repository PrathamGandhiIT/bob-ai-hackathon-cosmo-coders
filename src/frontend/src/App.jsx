import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './layouts/DashboardLayout'
import Overview from './pages/Overview'
import Disruptions from './pages/Disruptions'
import Shipments from './pages/Shipments'
import Fleet from './pages/Fleet'
import ColdChain from './pages/ColdChain'
import AICopilot from './pages/AICopilot'
import Actions from './pages/Actions'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/disruptions" element={<Disruptions />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/cold-chain" element={<ColdChain />} />
            <Route path="/copilot" element={<AICopilot />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
