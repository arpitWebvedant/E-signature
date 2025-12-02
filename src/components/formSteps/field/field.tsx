'use client'
import { cn } from '@/components/lib/ClsxConnct'
import { type Field } from '@prisma/client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFieldPageCoords } from './meta/use-field-page-coords'
import { PDF_VIEWER_PAGE_SELECTOR } from '@/components/constants/pdf-viewer'
import { FieldType } from '@/components/schema/types'
import { useElementBounds } from '../meta/use-element-bounds'
import { isFieldUnsignedAndRequired } from './advanced-fields-helpers'

export type FieldContainerPortalProps = {
  field: Field
  className?: string
  children: React.ReactNode
}

export function FieldContainerPortal({
  field,
  children,
  className = '',
}: FieldContainerPortalProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const coords = useFieldPageCoords(field, portalTarget) // Pass portalTarget to hook
  const $pageBounds = useElementBounds(
    `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.page}"]`,
    false,
    portalTarget // Pass portalTarget for relative calculations
  )

  // Find portal target
  useEffect(() => {
    const findPortalTarget = () => {
      // First try alternative portal root, then fallback to .document-edit-form-page
      const alternativePortalRoot = document.getElementById('document-field-portal-root')
      const container = alternativePortalRoot || 
                       document.querySelector<HTMLElement>('.document-edit-form-page')
      setPortalTarget(container || document.body)
    }

    findPortalTarget()

    const observer = new MutationObserver(findPortalTarget)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  const maxWidth = $pageBounds?.width ? $pageBounds.width - coords.x : undefined
  const isCheckboxOrRadioField = field.type === 'CHECKBOX' || field.type === 'RADIO'

  const style = useMemo(() => {
    if (!portalTarget) return {}

    const bounds = {
      top: `${coords.y + 27}px`,
      left: `${coords.x + 27}px`,
      ...(!isCheckboxOrRadioField
        ? {
            height: `${coords.height}px`,
            width: `${coords.width}px`,
          }
        : {
            maxWidth: `${maxWidth}px`,
          }),
          zIndex: 9999,
    }

    return bounds
  }, [coords, maxWidth, isCheckboxOrRadioField, portalTarget])

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div className={cn('absolute', className)} style={style}>
      {children}
    </div>,
    portalTarget
  )
}

export type FieldRootContainerProps = {
  field: Field
  color?: any
  children: React.ReactNode
  className?: string
  isDownloadMod: boolean
}

export function FieldRootContainer({
  field,
  children,
  color,
  isDownloadMod,
  className,
}: FieldRootContainerProps) {
  const [isValidating, setIsValidating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const observer = new MutationObserver(() => {
      if (ref.current) {
        setIsValidating(ref.current.getAttribute('data-validate') === 'true')
      }
    })

    observer.observe(ref.current, {
      attributes: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <FieldContainerPortal field={field}>
      {isDownloadMod ? (
        <div className='dark-mode-disabled text-foreground'>{children}</div>
      ) : (
        <div
          id={`field-${field.id}`}
          ref={ref}
          data-field-type={field.type}
          data-inserted={field.inserted ? 'true' : 'false'}
          className={cn(
            'field--FieldRootContainer field-card-container dark-mode-disabled group relative z-20 flex h-full w-full items-center rounded-[2px] bg-white/90 ring-2 ring-gray-200 transition-all',
            color?.base, // Use the color base class
            {
              'px-2':
                field.type !== FieldType.SIGNATURE &&
                field.type !== FieldType.FREE_SIGNATURE,
              'justify-center': !field.inserted,
              'ring-orange-300':
                isValidating && isFieldUnsignedAndRequired(field),
            },
            className,
          )}
          style={
            color?.inlineStyles ? {
              '--tw-ring-color': color.inlineStyles.ringColor,
              backgroundColor: color.inlineStyles.backgroundColor + '20',
            } as React.CSSProperties : undefined
          }
        >
          {children}
        </div>
      )}
    </FieldContainerPortal>
  )
}