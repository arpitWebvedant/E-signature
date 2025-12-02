import React, { useEffect, useState } from 'react'

export type ElementVisibleProps = {
  target: string
  children: React.ReactNode
  delay?: number // optional debounce delay
}

export const ElementVisible = ({
  target,
  children,
  delay = 100,
}: ElementVisibleProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const checkVisibility = () => {
      const exists = !!document.querySelector(target)

      if (delay > 0) {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setVisible(exists)
        }, delay)
      } else {
        setVisible(exists)
      }
    }

    const observer = new MutationObserver(checkVisibility)

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // initial check
    checkVisibility()

    return () => {
      observer.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [target, delay])

  if (!visible) return null

  return <>{children}</>
}
