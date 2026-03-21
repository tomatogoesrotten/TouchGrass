import { create } from 'zustand'

type ToastType = 'success' | 'error'

interface ToastStore {
  message: string
  visible: boolean
  type: ToastType
  show: (msg: string, type?: ToastType) => void
  hide: () => void
}

export const useToast = create<ToastStore>((set) => ({
  message: '',
  visible: false,
  type: 'success',
  show: (msg, type = 'success') => {
    set({ message: msg, visible: true, type })
    setTimeout(() => set({ visible: false }), 2800)
  },
  hide: () => set({ visible: false }),
}))
