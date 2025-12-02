'use client'

import * as React from 'react'
import { cn } from '../lib/ClsxConnct'

type Variant = 'default' | 'neutral' | 'secondary' | 'destructive' | 'warning'
type Padding = 'tighter' | 'tight' | 'default'

const variantClasses: Record<Variant, string> = {
  default:
    'bg-green-50 text-green-700 [&_.alert-title]:text-green-800 [&>svg]:text-green-400',
  neutral:
    'bg-gray-50 dark:bg-neutral-900/20 text-muted-foreground [&_.alert-title]:text-foreground',
  secondary:
    'bg-blue-50 text-blue-700 [&_.alert-title]:text-blue-800 [&>svg]:text-blue-400',
  destructive:
    'bg-red-50 text-red-700 [&_.alert-title]:text-red-800 [&>svg]:text-red-400',
  warning:
    'bg-yellow-50 text-yellow-700 [&_.alert-title]:text-yellow-800 [&>svg]:text-yellow-400',
}

const paddingClasses: Record<Padding, string> = {
  tighter: 'p-2',
  tight: 'px-4 py-2',
  default: 'p-4',
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  padding?: Padding
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', padding = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role='alert'
        className={cn(
          'relative w-full rounded-lg [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-8 space-y-2',
          variantClasses[variant],
          paddingClasses[padding],
          className,
        )}
        {...props}
      />
    )
  },
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('alert-title text-base font-medium', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
