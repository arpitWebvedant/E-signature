'use client'

import * as React from "react"
import type { DialogProps } from "@radix-ui/react-dialog"
import { Search } from "lucide-react"
import { cn } from "../lib/ClsxConnct"
import { Dialog, DialogContent } from "./dialog"

/* ---------------- Command Root ---------------- */
const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex overflow-hidden flex-col w-full h-full rounded-md bg-popover text-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = "Command"

/* ---------------- Command Dialog ---------------- */
type CommandDialogProps = DialogProps & {
  commandProps?: React.HTMLAttributes<HTMLDivElement>
}

const CommandDialog = ({ children, commandProps, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent
      className="z-[9999999999] w-11/12 overflow-hidden rounded-lg p-0 shadow-2xl lg:mt-0"
      position="center"
      overlayClassName="bg-background/60"
    >
      <Command
        {...commandProps}
        className=" [&_[data-command-group-heading]]:px-0 [&_[data-command-group-heading]]:font-medium
                  [&_[data-command-group-heading]]:text-muted-foreground 
                  [&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 
                  [&_[data-command-group]]:px-2"
      >
        {children}
      </Command>
    </DialogContent>
  </Dialog>
)

/* ---------------- Input ---------------- */
const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex items-center px-3 border-b" data-command-input-wrapper="">
    <Search className="mr-2 w-4 h-4 opacity-50 shrink-0" />
    <input
      ref={ref}
      className={cn(
        "py-3 w-full h-11 text-sm bg-transparent outline-none placeholder:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = "CommandInput"

/* ---------------- List ---------------- */
const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-y-auto overflow-x-hidden max-h-[300px]", className)}
    {...props}
  />
))
CommandList.displayName = "CommandList"

/* ---------------- Empty ---------------- */
const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-6 text-sm text-center text-muted-foreground", className)}
    {...props}
  />
))
CommandEmpty.displayName = "CommandEmpty"

/* ---------------- Group ---------------- */
const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { heading?: string }
>(({ className, heading, children, ...props }, ref) => (
  <div
    ref={ref}
    data-command-group=""
    className={cn(
      "overflow-hidden border-b p-1 text-foreground last:border-0",
      "[&_[data-command-group-heading]]:mt-2 [&_[data-command-group-heading]]:px-0 [&_[data-command-group-heading]]:py-2 [&_[data-command-group-heading]]:text-xs [&_[data-command-group-heading]]:font-normal [&_[data-command-group-heading]]:opacity-50",
      className
    )}
    {...props}
  >
    {heading && (
      <div data-command-group-heading className="px-2 py-1 text-xs font-medium">
        {heading}
      </div>
    )}
    {children}
  </div>
))
CommandGroup.displayName = "CommandGroup"

/* ---------------- Separator ---------------- */
const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
))
CommandSeparator.displayName = "CommandSeparator"

/* ---------------- Item ---------------- */
const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }
>(({ className, disabled, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : 0}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "hover:bg-[#F9FAFF] hover:text-primary",
      "aria-selected:bg-[#E1E6FE] aria-selected:text-primary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = "CommandItem"

/* ---------------- Shortcut ---------------- */
const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
    {...props}
  />
)
CommandShortcut.displayName = "CommandShortcut"

/* ---------------- Exports ---------------- */
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
