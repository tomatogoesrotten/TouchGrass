import type { Phase } from '@/stores/session'

export const phaseConfig: Record<Phase, { label: string; darkColor: string; lightColor: string }> = {
  requirements: { label: 'Requirements', darkColor: '#00e5a0', lightColor: '#00b37e' },
  'follow-up': { label: 'Follow-up', darkColor: '#a78bfa', lightColor: '#7c5ccf' },
  demo: { label: 'Demo', darkColor: '#fbbf24', lightColor: '#d99a00' },
  troubleshoot: { label: 'Troubleshoot', darkColor: '#f87171', lightColor: '#dc3545' },
}

export function getPhaseColor(phase: Phase, theme: 'dark' | 'light') {
  return theme === 'dark' ? phaseConfig[phase].darkColor : phaseConfig[phase].lightColor
}
