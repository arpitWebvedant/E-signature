import { ChevronDown } from 'lucide-react'

import {
  DEFAULT_DOCUMENT_DATE_FORMAT,
  convertToLocalSystemFormat,
} from '@/components/ui/date-formats'

import { fromCheckboxValue } from './field-checkbox'

import { cn } from '@/components/lib/ClsxConnct'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FRIENDLY_FIELD_TYPE } from '../meta/types'
import Image from 'next/image'

function normalizeToText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (value == null) return undefined
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.email === 'string') return obj.email
    if (typeof obj.name === 'string') return obj.name
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

type FieldIconProps = {
  /**
   * Loose field type since this is used for partial fields.
   */
  field: {
    inserted?: boolean
    customText?: string
    type: string
    fieldMeta?: string | null
    signature?: string | null
  }
  documentMeta?: string
}

/**
 * Renders the content inside field containers prior to sealing.
 */
export const FieldContent = ({ field, documentMeta }: FieldIconProps) => {
  const { type, fieldMeta } = field

  // Render checkbox layout for checkbox fields, even if no values exist yet
  if (field.type === 'CHECKBOX' && field.fieldMeta?.type === 'checkbox') {
    let checkedValues: string[] = []

    try {
      checkedValues = fromCheckboxValue(field.customText ?? '')
    } catch (err) {
      // Do nothing.

      console.error(err)
    }

    // If no values exist yet, show a placeholder checkbox
    if (!field.fieldMeta.values || field.fieldMeta.values.length === 0) {
      return (
        <div
          className={cn(
            'flex gap-1 py-0.5',
            field.fieldMeta.direction === 'horizontal'
              ? 'flex-row flex-wrap'
              : 'flex-col gap-y-1',
          )}
        >
          <div className='flex items-center'>
            <Checkbox className='w-3 h-3' disabled />
            <Label className='text-foreground ml-1.5 text-xs font-normal opacity-50'>
              Checkbox option
            </Label>
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'flex gap-1 py-0.5',
          field.fieldMeta.direction === 'horizontal'
            ? 'flex-row flex-wrap'
            : 'flex-col gap-y-1',
        )}
      >
        {field.fieldMeta.values.map((item, index) => (
          <div key={index} className='flex items-center'>
            <Checkbox
              className='w-3 h-3'
              id={`checkbox-${index}`}
              checked={checkedValues.includes(
                item.value === '' ? `empty-value-${index + 1}` : item.value, // I got no idea...
              )}
            />

            {item.value && (
              <Label
                htmlFor={`checkbox-${index}`}
                className='text-foreground ml-1.5 text-xs font-normal'
              >
                {item.value}
              </Label>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Only render radio if values exist, otherwise render the empty radio field content.
  if (
    field.type === 'RADIO' &&
    field.fieldMeta?.type === 'radio' &&
    field.fieldMeta.values &&
    field.fieldMeta.values.length > 0
  ) {
    return (
      <div className='flex flex-col gap-y-2 py-0.5'>
        <RadioGroup className='gap-y-1'>
          {field.fieldMeta.values.map((item, index) => (
            <div key={index} className='flex items-center'>
              <RadioGroupItem
                className='w-3 h-3 pointer-events-none'
                value={item.value}
                id={`option-${index}`}
                checked={item.value === field.customText}
              />
              {item.value && (
                <Label
                  htmlFor={`option-${index}`}
                  className='text-foreground ml-1.5 text-xs font-normal'
                >
                  {item.value}
                </Label>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  if (
    field.type === 'DROPDOWN' &&
    field.fieldMeta?.type === 'dropdown' &&
    !field.inserted
  ) {
    return (
      <div className='text-field-card-foreground flex flex-row items-center py-0.5 text-[clamp(0.07rem,25cqw,0.825rem)] text-sm'>
        <p>Select</p>
        <ChevronDown className='w-4 h-4' />
      </div>
    )
  }

  if (
    field.type === 'SIGNATURE' &&
    field.signature?.signatureImageAsBase64 &&
    field.inserted
  ) {
    return (
      <Image
      src={field.signature.signatureImageAsBase64}
      alt="Signature"
      className="object-contain w-full h-full"
      width={500}        
      height={200}       
      unoptimized={true} 
    />
    )
  }

  const labelToDisplay = fieldMeta?.label || FRIENDLY_FIELD_TYPE[type] || ''
  const safeLabelToDisplay = normalizeToText(labelToDisplay)
  let textToDisplay: string | undefined

  const isSignatureField =
    field.type === 'SIGNATURE' || field.type === 'FREE_SIGNATURE'

  if (
    field.type === 'TEXT' &&
    field.fieldMeta?.type === 'text' &&
    field.fieldMeta?.text
  ) {
    textToDisplay = normalizeToText(field.fieldMeta.text)
  }

  if (field.inserted) {
    if (field.customText) {
      textToDisplay = normalizeToText(field.customText)
    }

    if (field.type === 'DATE') {
      textToDisplay = convertToLocalSystemFormat(
        field.customText ?? '',
        documentMeta?.dateFormat ?? DEFAULT_DOCUMENT_DATE_FORMAT,
      )
    }

    if (isSignatureField && field.signature?.typedSignature) {
      textToDisplay = field.signature.typedSignature
    }
  }

  const textAlign =
    fieldMeta && 'textAlign' in fieldMeta ? fieldMeta.textAlign : 'left'

  return (
    <div className='flex overflow-hidden items-center w-full h-full'>
      <p
        className={cn(
          'text-foreground w-full whitespace-pre-wrap text-left text-[clamp(0.07rem,25cqw,0.825rem)] duration-200',
          {
            '!text-center': textAlign === 'center' || !textToDisplay,
            '!text-right': textAlign === 'right',
            'font-signature text-[clamp(0.07rem,25cqw,1.125rem)]':
              isSignatureField,
          },
        )}
      >
        {textToDisplay || safeLabelToDisplay}
      </p>
    </div>
  )
}
