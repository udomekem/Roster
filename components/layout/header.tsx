'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Avatar } from '@/components/ui/avatar'
import { Bell, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { data: user } = useUser()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 items-center justify-end gap-x-4 self-stretch lg:gap-x-6">
        <Link
          href="/dashboard/notifications"
          className="relative -m-1.5 flex items-center p-1.5 text-gray-400 hover:text-gray-600"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

        <div className="flex items-center gap-x-3">
          {user && (
            <>
              <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="-m-1.5 flex items-center p-1.5 text-gray-400 hover:text-gray-600"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
