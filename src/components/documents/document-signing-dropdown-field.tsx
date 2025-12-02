import { useEffect, useState } from 'react'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { cn } from '../lib/ClsxConnct'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { modifyStepData, upDateText } from './singHelper'

export type DocumentSigningDropdownFieldProps = {
  field: any
  onSignField?: (value: string) => Promise<void>
  onUnsignField?: () => Promise<void>
  isDownloadMod: boolean
  originalField: any
  color?: any
}

export const DocumentSigningDropdownField = ({
  field,
  onSignField,
  onUnsignField,
  isDownloadMod,
  originalField,
  color
}: DocumentSigningDropdownFieldProps) => {
  const isLoading = false
  const { user } = useGlobalContext()
  const params = useParams()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const { updateStepData, getStepData } = usePDFContext()
  const mockStepData = getStepData(3)
  const stepData = modifyStepData(mockStepData, recipient, user?.data?.email)
  const parsedFieldMeta = field.fieldMeta
  const isReadOnly = parsedFieldMeta?.readOnly
  const defaultValue = parsedFieldMeta?.defaultValue
  const signerCustomText = Array.isArray(originalField.customText)
    ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
    : null
  // Parse dropdown options
  const options =
    parsedFieldMeta?.values?.map((item: any) => ({
      value: item.value,
      label: item.value,
    })) || []

  const [selectedValue, setSelectedValue] = useState(defaultValue ?? '')

  const shouldAutoSignField =
    (!signerCustomText && selectedValue) ||
    (!signerCustomText && isReadOnly && defaultValue)

  const handleSelectItem = (value: string) => {
    setSelectedValue(value)

    // Auto-sign if it's a read-only field with a selection
    if (parsedFieldMeta?.readOnly && value) {
      onSign(value)
    }
  }

  const onSign = async (value?: string) => {
    try {
      const selectedValueToSign = value || selectedValue
      if (!selectedValueToSign) {
        return
      }
     const userEmail = recipient || user?.data?.email

      const updatedField = upDateText(
        originalField,
        field,
        selectedValueToSign,
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
        await onSignField(selectedValueToSign)
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

      if (onUnsignField) {
        await onUnsignField()
        return
      }

      setSelectedValue(defaultValue ?? '')
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (shouldAutoSignField) {
      onSign()
    }
  }, [selectedValue])

  const labelDisplay = parsedFieldMeta?.label
  const fieldDisplayName = labelDisplay ? labelDisplay : 'Dropdown'

  return (
    <div className='pointer-events-none'>
      <DocumentSigningFieldContainer
        field={field}
        onSign={onSign}
        isDownloadMod={isDownloadMod}
        onRemove={onRemove}
        type='Dropdown'
        color={color}
      >

        {!signerCustomText && (
          <p className='flex flex-col justify-center items-center duration-200 group-hover:text-primary text-foreground'>
 
            <Select value={selectedValue}  onValueChange={handleSelectItem}>
              <SelectTrigger
                id="mySelect"
                className={cn(
                  'z-10 w-full h-full border-none ring-0 text-foreground focus:border-none focus:ring-0',
                )}
              >
                <SelectValue
                  className='text-[clamp(0.425rem,25cqw,0.825rem)]'
                  placeholder={`Select`}
                />
              </SelectTrigger>
              <SelectContent
                className='w-full ring-0 focus:ring-0'
                position='popper'
              >
                {parsedFieldMeta?.values?.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item.value}
                    className='ring-0 focus:ring-0'
                  >
                    {item.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </p>
        )}

        {signerCustomText && (
          <p className='text-foreground text-[clamp(0.425rem,25cqw,0.825rem)] duration-200'>
            {signerCustomText?.text}
          </p>
        )}
      </DocumentSigningFieldContainer>
    </div>
  )
}
