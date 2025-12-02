import { usePDFContext } from '@/context/PDFContext'
import { ZInitialsFieldMeta } from '../formSteps/meta/field-meta'
import { Field } from '../schema/types'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsLoader,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { upDateText } from './singHelper'
import { useRequiredDocumentSigningContext } from '@/context/DocumentSigningProvider'

export type DocumentSigningInitialsFieldProps = {
  field: Field
  isDownloadMod: boolean
  color?: any
  onSignField?: (
    value: TSignFieldWithTokenMutationSchema,
  ) => Promise<void> | void
  onUnsignField?: (
    value: TRemovedSignedFieldWithTokenMutationSchema,
  ) => Promise<void> | void
}

export const DocumentSigningInitialsField = ({
  field,
  onSignField,
  isDownloadMod,
  originalField,
  onUnsignField,
  color,
}: DocumentSigningInitialsFieldProps) => {
  const isLoading = false
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)
  const safeFieldMeta = ZInitialsFieldMeta.safeParse(field.fieldMeta)

  const { fullName } = useRequiredDocumentSigningContext()
  console.log("field in Initials 1:", field);
  const parsedFieldMeta = safeFieldMeta.success ? safeFieldMeta.data : null
  console.log("safeFieldMeta in Initials:", safeFieldMeta);
  console.log('originalField in Initials:', originalField);
  console.log('parsedFieldMeta in Initials:', parsedFieldMeta);

  console.log('Current fullName from context:', fullName);
  const signerCustomText = Array.isArray(originalField.customText)
      ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
      : null
  const getInitials = (name: string) => {
    if (!name) return 'NA'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  const onSign = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      // Use the current fullName from context instead of recipient name
      const value = getInitials(fullName || '')

      // console.log("Generating initials for:", {
      //   fullNameFromContext: fullName,
      //   recipientName: field.recipients.find(r => r.email === userEmail)?.name,
      //   userEmail: userEmail,
      //   generatedInitials: value
      // })

      // Update the field with signature data
      const updatedField = upDateText(originalField,field,value,userEmail) 
     
      // Update step 3 data with the signed field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData?.fields.map((f) =>
          f.id === field.id ? updatedField : f,
        )

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true)
      }
      if (onSignField) {
        await onSignField(value)
      }
    } catch (err) {
      console.error('Error during signing:', err)
    }
  }

  const onRemove = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      const updatedField = upDateText(originalField, field, '', userEmail)

      // Update step 3 data with the unsigned field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData?.fields.map((f) =>
          f.id === field.id ? updatedField : f,
        )

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true)
      }

      if (onUnsignField) {
        await onUnsignField()
        return
      }
    } catch (err) {
      console.error(err)
    }
  }

  const shouldShowInserted = signerCustomText && signerCustomText.text && signerCustomText.text !== ''

  return (
    <DocumentSigningFieldContainer
      field={field}
      onSign={onSign}
      isDownloadMod={isDownloadMod}
      onRemove={onRemove}
      type='Initials'
      color={color}
    >
      {isLoading && <DocumentSigningFieldsLoader />}

      {!shouldShowInserted && (
        <DocumentSigningFieldsUninserted>
          Initials
        </DocumentSigningFieldsUninserted>
      )}
      {shouldShowInserted && (
        <DocumentSigningFieldsInserted 
          textAlign={parsedFieldMeta?.textAlign || 'left'}
          color={color}
          >
          {signerCustomText.text}
        </DocumentSigningFieldsInserted>
      )}
    </DocumentSigningFieldContainer>
  )
}
