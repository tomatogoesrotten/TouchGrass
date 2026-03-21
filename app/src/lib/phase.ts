import type { Phase } from '@/stores/session'

export const phaseConfig: Record<Phase, { label: string; darkColor: string; lightColor: string }> = {
  requirements: { label: 'Requirements', darkColor: '#c4f042', lightColor: '#a3cc29' },
  'follow-up': { label: 'Follow-up', darkColor: '#8b5cf6', lightColor: '#7c3aed' },
  demo: { label: 'Demo', darkColor: '#ff8a00', lightColor: '#e67d00' },
  troubleshoot: { label: 'Troubleshoot', darkColor: '#ff4d6a', lightColor: '#e5384b' },
}

export function getPhaseColor(phase: Phase, theme: 'dark' | 'light') {
  return theme === 'dark' ? phaseConfig[phase].darkColor : phaseConfig[phase].lightColor
}
