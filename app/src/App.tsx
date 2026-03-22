import { Routes, Route } from 'react-router-dom'
import { useThemeClass } from '@/hooks/useThemeClass'
import { Dashboard } from '@/screens/Dashboard'
import { Sessions } from '@/screens/Sessions'
import { Analytics } from '@/screens/Analytics'
import { Settings } from '@/screens/Settings'
import { Setup } from '@/screens/Setup'
import { Session } from '@/screens/Session'
import { PlanPage } from '@/screens/PlanPage'
import { Toast } from '@/components/ui/Toast'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function App() {
  useThemeClass()

  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/session" element={<Session />} />
        <Route path="/session/plan" element={<PlanPage />} />
      </Routes>
      <DeleteModal />
      <Toast />
    </>
  )
}
