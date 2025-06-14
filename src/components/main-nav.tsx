
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
}

interface MainNavProps {
  items: NavItem[]
  className?: string
}

export function MainNav({ items, className }: MainNavProps) {
  const location = useLocation()

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.href
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
