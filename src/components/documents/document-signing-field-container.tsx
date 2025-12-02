import { TooltipArrow } from '@radix-ui/react-tooltip'
import { X } from 'lucide-react'
import React from 'react'
import { RECIPIENT_COLOR_STYLES } from '../common/recipient-colors'
import { FieldRootContainer } from '../formSteps/field/field'
import { cn } from '../lib/ClsxConnct'
import { Field, FieldType } from '../schema/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export type DocumentSigningFieldContainerProps = {
  field: Field
  loading?: boolean
  children: React.ReactNode
  isDownloadMod: boolean
  color?: any

  /**
   * A function that is called before the field requires to be signed, or reauthed.
   *
   * Example, you may want to show a dialog prior to signing where they can enter a value.
   *
   * Once that action is complete, you will need to call `executeActionAuthProcedure` to proceed
   * regardless if it requires reauth or not.
   *
   * If the function returns true, we will proceed with the signing process. Otherwise if
   * false is returned we will not proceed.
   */
  onPreSign?: () => Promise<boolean> | boolean

  /**
   * The function required to be executed to insert the field.
   *
   * The auth values will be passed in if available.
   */
  onSign?: (documentAuthValue) => Promise<void> | void
  onRemove?: (fieldType?: string) => Promise<void> | void
  type?:
    | 'Date'
    | 'Initials'
    | 'Email'
    | 'Name'
    | 'Signature'
    | 'Text'
    | 'Radio'
    | 'Dropdown'
    | 'Number'
    | 'Checkbox'
  tooltipText?: string | null
}

export const DocumentSigningFieldContainer = ({
  field,
  loading,
  onPreSign,
  onSign,
  onRemove,
  isDownloadMod,
  children,
  type,
  tooltipText,
  color,
}: DocumentSigningFieldContainerProps) => {
 
  const readOnlyField = false

  const handleInsertField = async () => {
    if (field.inserted || !onSign) {
      return
    }

    // Bypass reauth for non signature fields.
    if (true) {
      const presignResult = await onPreSign?.()

      if (presignResult === false) {
        return
      }

      await onSign()
      return
    }
  }

  const onRemoveSignedFieldClick = async () => {
    if (!field.inserted) {
      return
    }

    await onRemove?.()
  }

  const onClearCheckBoxValues = async (fieldType?: string) => {
    if (!field.inserted) {
      return
    }

    await onRemove?.(fieldType)
  }

  return (
    <div className={cn('[container-type:size]')}>
      <FieldRootContainer
        color={color || (false ? RECIPIENT_COLOR_STYLES.readOnly : RECIPIENT_COLOR_STYLES.blue)}
        isDownloadMod={isDownloadMod}
        field={field}
      >

        <button
          type='submit'
          className='absolute inset-0 z-10 h-full w-full rounded-[2px]'
          onClick={async () => handleInsertField()}
        />


        {type === 'Checkbox' &&
          field.inserted &&
          !loading &&
          !readOnlyField && (
            <button
              className='flex absolute -bottom-10 justify-evenly items-center bg-gray-900 rounded-md border opacity-0 group-hover:opacity-100'
              onClick={() => void onClearCheckBoxValues(type)}
            >
              <span className='p-1 text-gray-400 rounded-md transition-colors hover:bg-white/10 hover:text-gray-100'>
                <X className='w-4 h-4' />
              </span>
            </button>
          )}

        {type !== 'Checkbox' &&
          !isDownloadMod &&
          field.inserted &&
          !loading &&
          !readOnlyField && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className='absolute inset-0 z-10'
                  onClick={onRemoveSignedFieldClick}
                ></button>
              </TooltipTrigger>

              <TooltipContent
                className='text-orange-900 bg-orange-300 border-0 fill-orange-300'
                sideOffset={2}
              >
                {tooltipText && <p>{tooltipText}</p>}
                Remove
                <TooltipArrow />
              </TooltipContent>
            </Tooltip>
          )}

        {(field.type === FieldType.RADIO ||
          field.type === FieldType.CHECKBOX ||
          field.type === FieldType.DROPDOWN) &&
          field.fieldMeta?.label && (
            <div
              className={cn(
                'absolute right-0 left-0 -top-10 p-2 text-xs text-center text-gray-700 rounded-md',
                {
                  '-top-6 -left-2 p-0.5 px-2 border border-border w-fit': isDownloadMod,
                },
                {
                  'bg-foreground/5 border-border border': !field.inserted,
                },
                {
                  'bg-water-200 border-primary border': field.inserted,
                },
              )}
            >
              {field.fieldMeta.label}
            </div>
          )}

        {children}
      </FieldRootContainer>
    </div>
  )
}
