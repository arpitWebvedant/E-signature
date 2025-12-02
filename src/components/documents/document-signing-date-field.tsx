import { usePDFContext } from '@/context/PDFContext'
import { Loader } from 'lucide-react'
import { ZDateFieldMeta } from '../formSteps/meta/field-meta'
import { cn } from '../lib/ClsxConnct'
import {
  convertToLocalSystemFormat,
  DEFAULT_DOCUMENT_DATE_FORMAT,
} from '../ui/date-formats'
import { DEFAULT_DOCUMENT_TIME_ZONE } from '../ui/time-zones'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import { upDateText } from './singHelper'
import { useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/context/GlobalContext'

export type DocumentSigningDateFieldProps = {
  field: ArrayBuffer
  isDownloadMod: boolean
  dateFormat?: string | null
  timezone?: string | null
  color?: any
}

export const DocumentSigningDateField = ({
  field,
  isDownloadMod,
  dateFormat = DEFAULT_DOCUMENT_DATE_FORMAT,
  timezone = DEFAULT_DOCUMENT_TIME_ZONE,
  originalField,
  color,
}: DocumentSigningDateFieldProps) => {
  const isLoading = false
  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)
  const firstStepData = getStepData(1)
  const safeFieldMeta = ZDateFieldMeta.safeParse(field.fieldMeta)
  const parsedFieldMeta = safeFieldMeta.success ? safeFieldMeta.data : null
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const localDateString = convertToLocalSystemFormat(
    field.customText,
    dateFormat,
    timezone,
  )
  const isDifferentTime = field.inserted && localDateString !== field.customText
  const tooltipText = `"${
    field.customText
  }" will appear on the document as it has a timezone of "${timezone || ''}".`
  const signerCustomText = Array.isArray(originalField.customText)
    ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
    : null
  const onSign = async () => {
    const userEmail = recipient || user?.data?.email
    const value = new Date()
    if (!value) {
      return
    }

    // Format date to string before updating
    // const formattedDate = value.toString() 
    
    // const updatedField = upDateText(originalField, field, formattedDate, userEmail)

    const updatedField = upDateText(originalField, field, value, userEmail)
    if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
      const updatedFields = stepData?.fields.map((f) =>
        f.id === field.id ? updatedField : f,
      )

      // Update step 3 with the modified fields array
      updateStepData(3, { fields: updatedFields }, true)
    }
  }

  const onRemove = async () => {
    const userEmail = recipient || user?.data?.email
    const updatedField = upDateText(originalField, field, '', userEmail)
    if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
      const updatedFields = stepData?.fields.map((f) =>
        f.id === field.id ? updatedField : f,
      )

      // Update step 3 with the modified fields array
      updateStepData(3, { fields: updatedFields }, true)
    }
  }

  // Check if we should show inserted or uninserted state
  const shouldShowInserted = signerCustomText && signerCustomText.text && signerCustomText.text !== ''

  return (
    <DocumentSigningFieldContainer
      field={field}
      onSign={onSign}
      isDownloadMod={isDownloadMod}
      onRemove={onRemove}
      type='Date'
      tooltipText={isDifferentTime ? tooltipText : undefined}
      color={color}
    >
      {isLoading && (
        <div className='flex absolute inset-0 justify-center items-center rounded-md bg-background'>
          <Loader className='w-5 h-5 animate-spin text-primary md:h-8 md:w-8' />
        </div>
      )}

      {!shouldShowInserted && (
        <p className='group-hover:text-primary text-foreground  text-[clamp(0.425rem,25cqw,0.825rem)] duration-200'>
          Date
        </p>
      )}

      {shouldShowInserted && (
        <div className='flex items-center w-full h-full'>
          <p
            className={cn(
              'text-foreground w-full whitespace-nowrap text-left text-[clamp(0.425rem,25cqw,0.825rem)] duration-200',
              {
                '!text-center': parsedFieldMeta?.textAlign === 'center',
                '!text-right': parsedFieldMeta?.textAlign === 'right',
              },
            )}
            style={color?.inlineStyles ? { color: color.inlineStyles.ringColor } : undefined}
          >
            {convertToLocalSystemFormat(signerCustomText?.text) || 'Date'}
          </p>
        </div>
      )}
    </DocumentSigningFieldContainer>
  )
}
