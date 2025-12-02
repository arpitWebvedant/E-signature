import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../lib/ClsxConnct'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = ({
  children,
  position = 'start',
  ...props
}: DialogPrimitive.DialogPortalProps & {
  position?: 'start' | 'end' | 'center'
}) => (
  <DialogPrimitive.Portal {...props}>
    <div
      className={cn(
        'fixed inset-0 z-[1000] flex justify-center sm:items-center',
        {
          'items-start': position === 'start',
          'items-end': position === 'end',
          'items-center': position === 'center',
        },
      )}
    >
      {children}
    </div>
  </DialogPrimitive.Portal>
)

DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'bg-black/60 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-50 backdrop-blur-sm transition-all duration-100',
      className,
    )}
    {...props}
  />
))

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// VisuallyHidden component for hiding content from sighted users but keeping it accessible
const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'overflow-hidden absolute p-0 -m-px w-px h-px whitespace-nowrap border-0',
      'sr-only', // common screen-reader only class
      className,
    )}
    {...props}
  />
))

VisuallyHidden.displayName = 'VisuallyHidden'

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    position?: 'start' | 'end' | 'center'
    hideClose?: boolean
    onOpenChange?: (open: boolean) => void
    hideTitle?: boolean // New prop to optionally hide the title visually
    overlayClassName?: string
    closeButtonClassName?: string
  }
>(
  (
    {
      className,
      children,
      overlayClassName,
      closeButtonClassName,
      position = 'start',
      hideClose = false,
      hideTitle = false, // Default to showing title
      onOpenChange,
      ...props
    },
    ref,
  ) => {
    // Check if DialogTitle is present in children
    const hasTitle = React.Children.toArray(children).some(
      (child) =>
        React.isValidElement(child) &&
        (child.type === DialogTitle ||
          (child as any).type?.displayName === 'DialogTitle'),
    )

    // Warn in development if no title is provided
    React.useEffect(() => {
      if (process.env.NODE_ENV !== 'production' && !hasTitle) {
        console.warn(
          'DialogContent requires a DialogTitle for accessibility. ' +
            'If you want to hide the title, use the hideTitle prop or wrap DialogTitle with VisuallyHidden.',
        )
      }
    }, [hasTitle])

    return (
      <DialogPortal position={position}>
        <DialogOverlay className={cn(overlayClassName)} />
        <DialogPrimitive.Content
          ref={ref}
          id={props.id}
          className={cn(
            'bg-background animate-in data-[state=open]:fade-in-90 sm:zoom-in-90 data-[state=open]:slide-in-from-bottom-10 data-[state=open]:sm:slide-in-from-bottom-0 fixed z-50 grid w-full gap-4 border p-6 shadow-lg sm:max-w-lg rounded-lg',
            className,
          )}
          {...props}
        >
          {/* Ensure title exists for accessibility */}
          {!hasTitle && (
            <VisuallyHidden>
              <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
            </VisuallyHidden>
          )}

          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              (child.type === DialogTitle ||
                (child as any).type?.displayName === 'DialogTitle') &&
              hideTitle
            ) {
              return <VisuallyHidden>{child}</VisuallyHidden>
            }
            return child
          })}

          {!hideClose && (
            <DialogPrimitive.Close asChild>
              <button
                type='button'
                onMouseDown={(e) => {
                  // ✅ handle before blur happens
                  e.preventDefault()
                  onOpenChange?.(false)
                }}
                className={cn(
                  'absolute top-4 right-4 z-50 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  closeButtonClassName,
                )}
              >
                <X className='w-4 h-4' />
                <span className='sr-only'>Close</span>
              </button>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  },
)

DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)

DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse space-y-2 space-y-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0',
      className,
    )}
    {...props}
  />
)

DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold tracking-tight truncate text-color-title',
      className,
    )}
    {...props}
  />
))

DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))

DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden, // Export VisuallyHidden for manual use
}
