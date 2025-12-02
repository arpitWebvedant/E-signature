import { useEffect, useMemo, useState } from 'react'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { cn } from '../lib/ClsxConnct'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { FieldToolTip } from '../ui/field/field-tooltip'
import { checkboxValidationSigns } from '../formSteps/field-items-advanced-settings/constants'
import { upDateText } from './singHelper'

export type DocumentSigningCheckboxFieldProps = {
  field: any
  onSignField?: (value: string[]) => Promise<void>
  onUnsignField?: () => Promise<void>
  isDownloadMod: boolean
  color?: any
}

// Helper functions to convert between checkbox values and stored format
const toCheckboxValue = (values: string[]): string => {
  return values.join('|')
}

const fromCheckboxValue = (value: string | null): string[] => {
  if (!value?.text) return []
  return value?.text.split('|').filter(Boolean)
}

export const DocumentSigningCheckboxField = ({
  field,
  onSignField,
  isDownloadMod,
  onUnsignField,
  originalField,
  color,
}: DocumentSigningCheckboxFieldProps) => {
  const isLoading = false
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)

  const parsedFieldMeta = field.fieldMeta
  const isReadOnly = false
  const signerCustomText = Array.isArray(originalField.customText)
      ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
      : null
  // Parse checkbox field options
  const values =
    parsedFieldMeta?.values?.map((item: any) => ({
      ...item,
      value: item.value?.length > 0 ? item.value : `empty-value-${item.id}`,
    })) || []

  // Get initial checked values from field meta or from stored customText
  const initialCheckedValues = useMemo(() => {
    if (signerCustomText) {
      return fromCheckboxValue(signerCustomText)
    }

    return (
      values
        ?.filter((item: any) => item.checked)
        ?.map((item: any) =>
          item.value.length > 0 ? item.value : `empty-value-${item.id}`,
        ) || []
    )
  }, [signerCustomText, signerCustomText, values])

  const [checkedValues, setCheckedValues] =
    useState<string[]>(initialCheckedValues)

  const checkboxValidationRule = parsedFieldMeta?.validationRule
  const checkboxValidationLength = parsedFieldMeta?.validationLength || 0

  // Validation logic
  const isLengthConditionMet = useMemo(() => {
    if (!checkboxValidationRule) return true

    switch (checkboxValidationRule) {
      case 'atLeast':
        return checkedValues.length >= checkboxValidationLength
      case 'exactly':
        return checkedValues.length === checkboxValidationLength
      case 'atMost':
        return checkedValues.length <= checkboxValidationLength
      default:
        return true
    }
  }, [checkedValues, checkboxValidationRule, checkboxValidationLength])

  const shouldAutoSignField =
    (!signerCustomText && checkedValues.length > 0 && isLengthConditionMet) ||
    (!signerCustomText && isReadOnly && isLengthConditionMet)

  const handleCheckboxChange = (value: string, itemId: number) => {
    const itemValue = value || `empty-value-${itemId}`
    const updatedValues = checkedValues.includes(itemValue)
      ? checkedValues.filter((v) => v !== itemValue)
      : [...checkedValues, itemValue]

    setCheckedValues(updatedValues)

    // Auto-sign if validation conditions are met
    if (updatedValues.length > 0 && isLengthConditionMet) {
      onSign(updatedValues)
    }
  }

  const onSign = async (valuesToSign?: string[]) => {
    try {
      const values = valuesToSign || checkedValues
      if (values.length === 0 || !isLengthConditionMet) {
        return
      }
      const userEmail = recipient || user?.data?.email

      const updatedField = upDateText(
        originalField,
        field,
        toCheckboxValue(values),
        userEmail,
      )

      // Update step 3 data with the signed field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData.fields.map((f: any) =>
          f.id === field.id ? updatedField : f,
        )

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true)
      }

      if (onSignField) {
        await onSignField(values)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onRemove = async () => {
    try {
      const userEmail = recipient || user?.data?.email

      const updatedField = upDateText(originalField, field, '', userEmail)

      // Update step 3 data with the unsigned field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData.fields.map((f: any) =>
          f.id === field.id ? updatedField : f,
        )

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true)
      }
 
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (shouldAutoSignField) {
      onSign()
    }
  }, [checkedValues, isLengthConditionMet])

  const labelDisplay = parsedFieldMeta?.label
  const fieldDisplayName = labelDisplay ? labelDisplay : 'Checkbox'

  // Parse the stored checkbox values for display
  const parsedCheckedValues = useMemo(
    () => fromCheckboxValue(signerCustomText),
    [signerCustomText],
  )

  return (
    <DocumentSigningFieldContainer
      field={field}
      isDownloadMod={isDownloadMod}
      onSign={onSign}
      onRemove={onRemove}
      type='Checkbox'
      color={color}
    >
      {!signerCustomText && (
        <>
          <div
            className={cn(
              'z-50 my-0.5 flex gap-1',
              parsedFieldMeta.direction === 'horizontal'
                ? 'flex-row flex-wrap'
                : 'flex-col gap-y-1',
            )}
          >
            {values?.map(
              (
                item: { id: number; value: string; checked: boolean },
                index: number,
              ) => {
                const itemValue = item.value || `empty-value-${item.id}`

                return (
                  <div key={index} className='flex items-center'>
                    <Checkbox
                      className='w-3 h-3'
                      id={`checkbox-${field.id}-${item.id}`}
                      checked={checkedValues.includes(itemValue)}
                      disabled={isReadOnly}
                      onCheckedChange={() =>
                        handleCheckboxChange(item.value, item.id)
                      }
                    />
                    {!item.value.includes('empty-value-') && item.value && (
                      <Label
                        htmlFor={`checkbox-${field.id}-${item.id}`}
                        className='text-foreground ml-1.5 text-xs font-normal'
                      >
                        {item.value}
                      </Label>
                    )}
                  </div>
                )
              },
            )}
          </div>
        </>
      )}

      {signerCustomText && (
        <div
          className={cn(
            'my-0.5 flex gap-1',
            parsedFieldMeta.direction === 'horizontal'
              ? 'flex-row flex-wrap'
              : 'flex-col gap-y-1',
          )}
        >
          {values?.map(
            (
              item: { id: number; value: string; checked: boolean },
              index: number,
            ) => {
              const itemValue = item.value || `empty-value-${item.id}`

              return (
                <div key={index} className='flex items-center'>
                  <Checkbox
                    className='w-3 h-3'
                    id={`checkbox-${field.id}-${item.id}`}
                    checked={parsedCheckedValues.includes(itemValue)}
                    disabled={isLoading || isReadOnly}
                    onCheckedChange={() =>
                      handleCheckboxChange(item.value, item.id)
                    }
                  />
                  {!item.value.includes('empty-value-') && item.value && (
                    <Label
                      htmlFor={`checkbox-${field.id}-${item.id}`}
                      className='text-foreground ml-1.5 text-xs font-normal'
                    >
                      {item.value}
                    </Label>
                  )}
                </div>
              )
            },
          )}
        </div>
      )}
    </DocumentSigningFieldContainer>
  )
}
