
export interface SidebarNavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
}
