import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "../lib/ClsxConnct"

// Root + Trigger
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

// Content
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { className, align = "center", sideOffset = 6, children, ...props },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[9999] w-72 rounded-md border bg-popover p-4 shadow-md outline-none",
          "data-[state=open]:animate-in",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          className
        )}
        {...props}
      >
        {children}

        {/* Optional arrow */}
        <PopoverPrimitive.Arrow className="fill-popover" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Hover helper (optional)
const PopoverHover = ({
  trigger,
  children,
  side = "top",
  contentProps,
}: {
  trigger: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
  contentProps?: React.ComponentPropsWithoutRef<typeof PopoverContent>
}) => {
  const [open, setOpen] = React.useState(false)
  let timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="flex cursor-pointer"
        >
          {trigger}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...contentProps}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverHover }
