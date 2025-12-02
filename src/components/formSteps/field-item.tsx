'use client'
import { CopyPlus, Settings2, SquareStack, Trash } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'
import { useRecipientColors } from '../common/recipient-colors'
import { PDF_VIEWER_PAGE_SELECTOR } from '../constants/pdf-viewer'
import { cn } from '../lib/ClsxConnct'
import { FieldContent } from './field/field-content'
import { ZCheckboxFieldMeta, ZRadioFieldMeta } from './meta/field-meta'
import type { TDocumentFlowFormSchema } from './meta/types'
import { useElementBounds } from './meta/use-element-bounds'

type Field = TDocumentFlowFormSchema['fields'][0]
export type FieldItemProps = {
  field: Field
  fieldClassName?: string
  passive?: boolean
  disabled?: boolean
  minHeight?: number
  minWidth?: number
  defaultHeight?: number
  defaultWidth?: number
  onResize?: (_node: HTMLElement) => void
  onMove?: (_node: HTMLElement) => void
  onRemove?: () => void
  onDuplicate?: () => void
  onDuplicateAllPages?: () => void
  onAdvancedSettings?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  recipientIndex?: number
  hasErrors?: boolean
  active?: boolean
  onFieldActivate?: () => void
  onFieldDeactivate?: () => void
}

export const FieldItem = ({
  fieldClassName,
  field,
  passive,
  disabled,
  active,
  minHeight,
  minWidth,
  hasErrors,
  recipientIndex,
  onResize,
  onMove,
  onRemove,
  onDuplicate,
  onDuplicateAllPages,
  onAdvancedSettings,
  onFocus,
  onBlur,
  onFieldActivate,
  onFieldDeactivate,
}: FieldItemProps) => {
  const $el = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({
    pageX: 0,
    pageY: 0,
    pageHeight: 0,
    pageWidth: 0,
  })
  const [settingsActive, setSettingsActive] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const signerStyles = useRecipientColors(recipientIndex)

  const $pageBounds = useElementBounds(
    `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.pageNumber}"]`,
  )

  const hasFieldMetaValues = (
    fieldType: string,
    fieldMeta: string,
    parser: typeof ZCheckboxFieldMeta | typeof ZRadioFieldMeta,
  ) => {
    if (field.type !== fieldType || !fieldMeta) {
      return false
    }

    const parsedMeta = parser?.parse(fieldMeta)
    return parsedMeta && parsedMeta.values && parsedMeta.values.length > 0
  }

  const checkBoxHasValues = useMemo(
    () => hasFieldMetaValues('CHECKBOX', field.fieldMeta, ZCheckboxFieldMeta),
    [field.fieldMeta],
  )

  const radioHasValues = useMemo(
    () => hasFieldMetaValues('RADIO', field.fieldMeta, ZRadioFieldMeta),
    [field.fieldMeta],
  )
 
  const advancedField = [
    'NUMBER',
    'RADIO',
    'CHECKBOX',
    'DROPDOWN',
    'TEXT',
    'INITIALS',
    'EMAIL',
    'DATE',
    'NAME',
  ].includes(field.type)
  const fixedSize = checkBoxHasValues || radioHasValues 

  useEffect(() => {
    // Look for .documentEditForm as the container
    const container = document.querySelector<HTMLElement>('.document-edit-form-page')
  
    if (container) {
      
      setPortalTarget(container)
    } else {
      // fallback to body if not found
      setPortalTarget(document.body)
    }
  }, [])
  // If your logic needs "fieldHasCheckedValues", define it here
  const fieldHasCheckedValues = checkBoxHasValues || radioHasValues
  const calculateCoords = useCallback(() => {
    const $page = document.querySelector<HTMLElement>(
      `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.pageNumber}"]`
    )
    const $container = document.querySelector<HTMLElement>('.document-edit-form-page')
  
    if (!$page) return
  
    const pageRect = $page.getBoundingClientRect()
    const containerRect = $container?.getBoundingClientRect()
  
    const height = pageRect.height
    const width = pageRect.width
  
    // If portal is inside .documentEditForm, adjust relative to it
    const top =
      (containerRect ? pageRect.top - containerRect.top : pageRect.top) +
      (containerRect ? 0 : window.scrollY)
    const left =
      (containerRect ? pageRect.left - containerRect.left : pageRect.left) +
      (containerRect ? 0 : window.scrollX)
  
    const pageX = (field.pageX / 100) * width + left
    const pageY = (field.pageY / 100) * height + top
  
    const pageHeight = (field.pageHeight / 100) * height
    const pageWidth = (field.pageWidth / 100) * width
  console.log(pageX, pageY, pageHeight, pageWidth,pageRect,containerRect)
    setCoords({
      pageX,
      pageY,
      pageHeight,
      pageWidth,
    })
  }, [
    field.pageHeight,
    field.pageNumber,
    field.pageWidth,
    field.pageX,
    field.pageY,
  ])
  useEffect(() => {
    const onClickOutsideOfField = (event: MouseEvent) => {
      const isOutsideOfField =
        $el.current && !event.composedPath().includes($el.current)

      setSettingsActive((active) => {
        if (active && isOutsideOfField) {
          return false
        }

        return active
      })

      if (isOutsideOfField) {
        setSettingsActive(false)
        onFieldDeactivate?.()
        onBlur?.()
      }
    }

    document.body.addEventListener('click', onClickOutsideOfField)

    return () => {
      document.body.removeEventListener('click', onClickOutsideOfField)
    }
  }, [onBlur])
  useEffect(() => {
    calculateCoords()
  }, [calculateCoords])

  useEffect(() => {
    const onResize = () => {
      calculateCoords()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize)
    }
  }, [calculateCoords])

  if (coords.pageX === 0 && coords.pageY === 0) {
    return null
  }
  return createPortal(
    <Rnd
      className={cn('dark-mode-disabled group', {
        'pointer-events-none': passive,
        'pointer-events-none cursor-not-allowed opacity-75': disabled,
        'z-[99999]': active && !disabled,
        'z-[99999]': !active && !disabled,
        'z-[99999]': disabled,
      })}
      minHeight={fixedSize ? '' : minHeight || 'auto'}
      minWidth={fixedSize ? '' : minWidth || 'auto'}
      default={{
        x: coords.pageX,
        y: coords.pageY,
        height: fixedSize ? 'auto' : coords.pageHeight,
        width: fixedSize ? 'auto' : coords.pageWidth,
        zIndex: 99999,
      }}
      value={{
        x: coords.pageX,
        y: coords.pageY,
        height: fixedSize ? 'auto' : coords.pageHeight,
        width: fixedSize ? 'auto' : coords.pageWidth,
        zIndex: 99999,
      }}
      maxWidth={
        fixedSize && $pageBounds?.width
          ? $pageBounds.width - coords.pageX
          : undefined
      }
      bounds={`${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.pageNumber}"]`}
      onDragStart={() => onFieldActivate?.()}
      onResizeStart={() => onFieldActivate?.()}
      onMouseEnter={() => onFocus?.()}
      onMouseLeave={() => onBlur?.()}
      onResizeStop={(_e, _d, ref) => {
        onFieldDeactivate?.()
        onResize?.(ref)
      }}
      onDragStop={(_e, d) => {
        onFieldDeactivate?.()
        onMove?.(d.node)
      }}
      enableResizing={!fixedSize}
      resizeHandleStyles={{
        bottom: { bottom: -8, cursor: 'ns-resize' },
        top: { top: -8, cursor: 'ns-resize' },
        left: { cursor: 'ew-resize' },
        zIndex: 99999,
        right: { cursor: 'ew-resize' },
      }}
      style={{
        zIndex: 99999,
      }}
    >
      {(field.type === 'RADIO' || field.type === 'CHECKBOX' || field.type === 'DROPDOWN') &&
        field.fieldMeta?.label && (
          <div
            className={cn(
              'absolute right-0 left-0 -top-10 p-2 text-xs text-center text-gray-700 rounded-md',
              {
                'border bg-foreground/5 border-primary': !fieldHasCheckedValues,
                'border bg-water-200 border-primary': fieldHasCheckedValues,
              },
            )}
          >
            {field.fieldMeta.label}
          </div>
        )}

      <div
        className={cn(
          'group/field-item relative flex h-full w-full items-center justify-center rounded-[2px] bg-white/90 px-2 ring-2 transition-colors',
          !hasErrors && signerStyles.base,
          !hasErrors && signerStyles.fieldItem,
          fieldClassName,
          {
            'rounded-[2px] border bg-red-400/20 shadow-[0_0_0_5px_theme(colors.red.500/10%),0_0_0_2px_theme(colors.red.500/40%),0_0_0_0.5px_theme(colors.red.500)] ring-red-400':
              hasErrors,
          },
          !fixedSize && '[container-type:size]',
        )}
        style={
          signerStyles.inlineStyles ? {
            '--tw-ring-color': signerStyles.inlineStyles.ringColor,
            backgroundColor: signerStyles.inlineStyles.backgroundColor + '20',
          } as React.CSSProperties : undefined
        }
        onClick={(e) => {
          e.stopPropagation()
          setSettingsActive((prev) => !prev)
          onFieldActivate?.()
          onFocus?.()
        }}
        ref={$el}
        data-field-id={field.nativeId}
      >
        <FieldContent field={field} />

        <div className='hidden absolute top-0 -right-5 z-20 justify-center items-center w-5 h-full group-hover:flex'>
          <div
            className={cn(
              'flex h-5 w-5 flex-col items-center justify-center rounded-r-md text-[0.5rem] font-bold text-white opacity-0 transition duration-200 group-hover/field-item:opacity-100',
              signerStyles.fieldItemInitials,
              {
                '!opacity-50': disabled || passive,
              },
            )}
            style={
              signerStyles.inlineStyles ? {
                backgroundColor: signerStyles.inlineStyles.backgroundColor,
              } : undefined
            }
            
          >
            {(field.signerEmail?.charAt(0)?.toUpperCase() ?? '') +
              (field.signerEmail?.charAt(1)?.toUpperCase() ?? '')}
          </div>
        </div>

      </div>
      {!disabled && settingsActive && (
        <div className='absolute z-[60] mt-1 flex w-full items-center justify-center'>
          <div className='group flex items-center justify-evenly gap-x-1 rounded-md border bg-gray-900 p-0.5'>
            {advancedField && (
              <button
                title={`Advanced settings`}
                className='rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-100'
                onClick={onAdvancedSettings}
                onTouchEnd={onAdvancedSettings}
              >
                <Settings2 className='w-3 h-3' />
              </button>
            )}

            <button
              title={`Duplicate`}
              className='rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-100'
              onClick={onDuplicate}
              onTouchEnd={onDuplicate}
            >
              <CopyPlus className='w-3 h-3' />
            </button>

            <button
              title={`Duplicate on all pages`}
              className='rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-100'
              onClick={onDuplicateAllPages}
              onTouchEnd={onDuplicateAllPages}
            >
              <SquareStack className='w-3 h-3' />
            </button>

            <button
              title={`Remove`}
              className='rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-100'
              onClick={onRemove}
              onTouchEnd={onRemove}
            >
              <Trash className='w-3 h-3' />
            </button>
          </div>
        </div>
      )}
    </Rnd>,
    portalTarget,
  )
}
