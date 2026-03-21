import type { Phase } from '@/stores/session'

export const phaseConfig: Record<Phase, { label: string; darkColor: string; lightColor: string }> = {
  requirements: { label: 'Requirements', darkColor: '#10b981', lightColor: '#059669' },
  'follow-up': { label: 'Follow-up', darkColor: '#8b5cf6', lightColor: '#7c3aed' },
  demo: { label: 'Demo', darkColor: '#f59e0b', lightColor: '#d97706' },
  troubleshoot: { label: 'Troubleshoot', darkColor: '#ef4444', lightColor: '#dc2626' },
}

export function getPhaseColor(phase: Phase, theme: 'dark' | 'light') {
  return theme === 'dark' ? phaseConfig[phase].darkColor : phaseConfig[phase].lightColor
}
