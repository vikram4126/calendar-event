import React from 'react'
import * as LucideIcons from 'lucide-react'

export function NavTabIcon({ type }) {
  if (type === 'Finance') {
    return (
      <svg className="nav-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
        <path d="M3 9h18" strokeWidth="1.8" />
        <path d="M8 4v5M16 4v5" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 13h4M8 17h8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'Learning') {
    return (
      <svg className="nav-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3L2 8l10 5 10-5-10-5z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2 8v6" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 10.5v5.5a6 6 0 0 0 12 0v-5.5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return null
}

const ICON_ID_MAP = {
  a1: LucideIcons.MessageSquare,
  a2: LucideIcons.CheckSquare,
  a3: LucideIcons.Clock,
  a4: LucideIcons.LayoutGrid,
  a5: LucideIcons.Users,
  a6: LucideIcons.Activity,
  a7: LucideIcons.Monitor,
  a8: LucideIcons.UserCheck,
  l1: LucideIcons.LogIn,
  l2: LucideIcons.Star,
  l3: LucideIcons.Code,
  l4: LucideIcons.Shield,
  l5: LucideIcons.Heart,
  l6: LucideIcons.Globe
}

const ALIAS_MAP = {
  message: 'MessageSquare',
  messagesquare: 'MessageSquare',
  chat: 'MessageSquare',
  comm: 'MessageSquare',
  check: 'CheckSquare',
  checksquare: 'CheckSquare',
  audit: 'CheckSquare',
  clock: 'Clock',
  time: 'Clock',
  forecast: 'Clock',
  grid: 'LayoutGrid',
  layoutgrid: 'LayoutGrid',
  planning: 'LayoutGrid',
  users: 'Users',
  people: 'Users',
  team: 'Users',
  activity: 'Activity',
  pulse: 'Activity',
  monitor: 'Monitor',
  tech: 'Monitor',
  usercheck: 'UserCheck',
  onboarding: 'LogIn',
  login: 'LogIn',
  star: 'Star',
  leadership: 'Star',
  code: 'Code',
  skills: 'Code',
  shield: 'Shield',
  compliance: 'Shield',
  heart: 'Heart',
  softskills: 'Heart',
  globe: 'Globe',
  digital: 'Globe'
}

function getLucideIcon(iconStr) {
  if (!iconStr) return null
  const raw = String(iconStr).trim()
  if (!raw) return null

  // 1. Direct match on exact export (e.g. "MessageSquare", "Calendar")
  if (LucideIcons[raw]) return LucideIcons[raw]

  // 2. Alias match (e.g. "message" -> "MessageSquare")
  const lowerKey = raw.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (ALIAS_MAP[lowerKey] && LucideIcons[ALIAS_MAP[lowerKey]]) {
    return LucideIcons[ALIAS_MAP[lowerKey]]
  }

  // 3. Convert kebab-case or snake_case or spaces to PascalCase (e.g. "message-square" -> "MessageSquare", "user-check" -> "UserCheck")
  const pascalName = raw
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  if (LucideIcons[pascalName]) return LucideIcons[pascalName]

  return null
}

export function ActivityIcon({ id, icon }) {
  let Component = getLucideIcon(icon)

  if (!Component && id) {
    Component = ICON_ID_MAP[id]
  }

  if (!Component) {
    Component = LucideIcons.Tag || LucideIcons.Activity
  }

  return <Component size={18} strokeWidth={1.8} />
}

