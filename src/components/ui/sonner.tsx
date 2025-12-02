"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: '#262626',
          border: '1px solid #383838',
          color: '#f5f5f5',
        },
        classNames: {
          toast: '!rounded-lg !font-sans !shadow-lg',
          success: '!border-emerald-500/30',
          error: '!border-rose-500/30',
          warning: '!border-amber-500/30',
          info: '!border-blue-500/30',
          closeButton: '!text-gray-400 hover:!text-white',
        }
      }}
      style={
        {
          "--normal-bg": "#262626",
          "--normal-text": "#f5f5f5",
          "--normal-border": "#383838",
          "--success-bg": "#262626",
          "--success-text": "#f5f5f5",
          "--success-border": "rgba(16, 185, 129, 0.3)",
          "--error-bg": "#262626",
          "--error-text": "#f5f5f5",
          "--error-border": "rgba(244, 63, 94, 0.3)",
          "--warning-bg": "#262626",
          "--warning-text": "#f5f5f5",
          "--warning-border": "rgba(245, 158, 11, 0.3)",
          "--info-bg": "#262626",
          "--info-text": "#f5f5f5",
          "--info-border": "rgba(59, 130, 246, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }