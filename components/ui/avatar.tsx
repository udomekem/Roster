import type { HTMLAttributes } from 'react'
import { cn, getInitials } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  src?: string | null
  size?: keyof typeof sizeClasses
}

export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full object-cover',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-700',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  )
}
