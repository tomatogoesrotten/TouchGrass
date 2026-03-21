import { Routes, Route } from 'react-router-dom'
import { useThemeClass } from '@/hooks/useThemeClass'
import { Dashboard } from '@/screens/Dashboard'
import { Setup } from '@/screens/Setup'
import { Session } from '@/screens/Session'
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
        <Route path="/setup" element={<Setup />} />
        <Route path="/session" element={<Session />} />
      </Routes>
      <DeleteModal />
      <Toast />
    </>
  )
}
