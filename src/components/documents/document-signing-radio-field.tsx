import { useEffect, useState } from 'react'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { upDateText } from './singHelper'

export type DocumentSigningRadioFieldProps = {
  field: any
  onSignField?: (value: string) => Promise<void>
  onUnsignField?: () => Promise<void>
  isDownloadMod: boolean
  originalField: any
  color?: any
}

export const DocumentSigningRadioField = ({
  field,
  onSignField,
  originalField,
  isDownloadMod,
  onUnsignField,
  color,
}: DocumentSigningRadioFieldProps) => {
  const isLoading = false
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)

  const parsedFieldMeta = field.fieldMeta
  const isReadOnly = parsedFieldMeta?.readOnly
  const signerCustomText = Array.isArray(originalField.customText)
      ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
      : null

  // Parse radio field options
  const values =
    parsedFieldMeta?.values?.map((item: any) => ({
      ...item,
      value: item.value?.length > 0 ? item.value : `empty-value-${item.id}`,
    })) || []

  const checkedItem = values?.find((item: any) => item.checked)
  const defaultValue = !signerCustomText && checkedItem ? checkedItem.value : ''

  const [selectedOption, setSelectedOption] = useState(defaultValue)

  const shouldAutoSignField =
    (!signerCustomText && selectedOption) ||
    (!signerCustomText && defaultValue) ||
    (!signerCustomText && parsedFieldMeta?.readOnly && defaultValue)

  const handleSelectItem = (selectedValue: string) => {
    setSelectedOption(selectedValue)

    // Auto-sign if it's a read-only field with a selection
    if (parsedFieldMeta?.readOnly && selectedValue) {
      onSign(selectedValue)
    }
  }

  const onSign = async (value?: string) => {
    try {
      const selectedValue = value || selectedOption
      if (!selectedValue) {
        return
      }
      const userEmail = recipient || user?.data?.email

      const updatedField = upDateText(
        originalField,
        field,
        selectedValue,
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
        await onSignField(selectedValue)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onRemove = async () => {
    try {

      const userEmail = recipient || user?.data?.email
      const updatedField = upDateText(
        originalField,
        field,
        '',
        userEmail,
      )
      // Update step 3 data with the unsigned field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData.fields.map((f: any) =>
          f.id === field.id ? updatedField : f,
        )

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true)
      }

      if (onUnsignField) {
        await onUnsignField()
        return
      }

      setSelectedOption(defaultValue)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (shouldAutoSignField) {
      onSign()
    }
  }, [selectedOption])

  const labelDisplay = parsedFieldMeta?.label
  const fieldDisplayName = labelDisplay ? labelDisplay : 'Radio'
console.log(signerCustomText,"signerCustomText")
  return (
    <DocumentSigningFieldContainer
      field={field}
      onSign={() => onSign()}
      onRemove={onRemove}
      isDownloadMod={isDownloadMod}
      type='Radio'
      color={color}
    >
      {!signerCustomText?.text && (
        <div className='flex flex-col gap-2'>
          <DocumentSigningFieldsUninserted>
            {fieldDisplayName}
          </DocumentSigningFieldsUninserted>

          <RadioGroup
            value={selectedOption}
            onValueChange={handleSelectItem}
            className='z-10 gap-y-2'
          >
            {values.map((item: any, index: number) => (
              <div key={index} className='flex items-center space-x-2'>
                <RadioGroupItem
                  value={item.value}
                  id={`option-${field.id}-${item.id}`}
                  disabled={isReadOnly}
                />
                {!item.value.includes('empty-value-') && item.value && (
                  <Label
                    htmlFor={`option-${field.id}-${item.id}`}
                    className='text-sm font-normal cursor-pointer'
                  >
                    {item.value}
                  </Label>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {signerCustomText?.text && (
        <div className='flex flex-col gap-2'>
          {!isDownloadMod && (
    <DocumentSigningFieldsInserted color={color}>
            {fieldDisplayName}
          </DocumentSigningFieldsInserted>
          )}
      

          {(() => {
            const selectedText = signerCustomText?.text
            const displayValues = isDownloadMod
              ? values.filter((item: any) => item.value === selectedText)
              : values

            if (isDownloadMod) {
              return (
                <div className='gap-y-2'>
                  {displayValues.map((item: any, index: number) => (
                    !item.value.includes('empty-value-') && item.value && (
                      <div key={index} className='flex items-center'>
                        <span className='text-sm font-normal'>
                          {item.value}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )
            }

            return (
              <RadioGroup
                value={selectedText || ''}
                className='gap-y-2'
              >
                {displayValues.map((item: any, index: number) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value={item.value}
                      id={`option-signed-${field.id}-${item.id}`}
                      checked={item.value === selectedText}
                      disabled={true}
                    />
                    {!item.value.includes('empty-value-') && item.value && (
                      <Label
                        htmlFor={`option-signed-${field.id}-${item.id}`}
                        className='text-sm font-normal'
                      >
                        {item.value}
                      </Label>
                    )}
                  </div>
                ))}
              </RadioGroup>
            )
          })()}
        </div>
      )}
    </DocumentSigningFieldContainer>
  )
}
