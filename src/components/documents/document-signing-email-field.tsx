import { useState } from 'react'
import { ZNameFieldMeta } from '../formSteps/meta/field-meta'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsLoader,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { upDateText } from './singHelper'

export type DocumentSigningEmailFieldProps = {
  field: FieldWithSignature
  isDownloadMod: boolean
  originalField: FieldWithSignature
  color?: any
}

export const DocumentSigningEmailField = ({
  field,
  originalField,
  isDownloadMod,
  color,
}: DocumentSigningEmailFieldProps) => {
  const isLoading = false

  const safeFieldMeta = ZNameFieldMeta.safeParse(field.fieldMeta)
  const parsedFieldMeta = safeFieldMeta.success ? safeFieldMeta.data : null
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)
  const [showFullNameModal, setShowFullNameModal] = useState(false)
  const [localFullName, setLocalFullName] = useState('')
  const signerCustomText = Array.isArray(originalField.customText)
    ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
    : null
  const onPreSign = () => {
    return true
  }

  /**
   * When the user clicks the sign button in the dialog where they enter their full name.
   */
  const onDialogSignClick = () => {
    setShowFullNameModal(false)
    setLocalFullName(localFullName)
  }

  const onSign = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      const matchedRecipient = field.recipients.find(
        (r) => r.email === recipient || r.email === user?.data?.email,
      )
      const value = matchedRecipient?.email || recipient
      const updatedField = upDateText(originalField,field,value,userEmail) 
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData?.fields.map((f) =>
          f.id === field.id ? updatedField : f,
        )
        updateStepData(3, { fields: updatedFields }, true)
      }
      // if (onSignField) {
      //   await onSignField(value)
      // }
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

      // if (onUnsignField) {
      //   await onUnsignField()
      //   return
      // }
    } catch (err) {
      console.error(err)
    }
  }

  // Check if we should show inserted or uninserted state
  const shouldShowInserted = signerCustomText && signerCustomText.text && signerCustomText.text !== ''

  return (
    <DocumentSigningFieldContainer
      field={field}
      onPreSign={onPreSign}
      onSign={onSign}
      isDownloadMod={isDownloadMod}
      onRemove={onRemove}
      type='Email'
      color={color}
    >
      {isLoading && <DocumentSigningFieldsLoader />}

      {!shouldShowInserted && (
        <DocumentSigningFieldsUninserted>Email</DocumentSigningFieldsUninserted>
      )}

      {shouldShowInserted && (
        <DocumentSigningFieldsInserted 
          textAlign={parsedFieldMeta?.textAlign || 'left'}
          color={color}
          >
          {signerCustomText?.text}
        </DocumentSigningFieldsInserted>
      )}

      <Dialog open={showFullNameModal} onOpenChange={setShowFullNameModal}>
        <DialogContent>
          <DialogTitle>
            Sign as
            <div>
              {'name'} <div className='text-foreground'>({'email'})</div>
            </div>
          </DialogTitle>

          <div>
            <Label htmlFor='signature'>Full Name</Label>

            <Input
              type='text'
              className='mt-2'
              value={localFullName}
              onChange={(e) => setLocalFullName(e.target.value.trimStart())}
            />
          </div>

          <DialogFooter>
            <div className='flex flex-nowrap flex-1 gap-4 w-full'>
              <Button
                type='button'
                className='flex-1'
                variant='secondary'
                onClick={() => {
                  setShowFullNameModal(false)
                  setLocalFullName('')
                }}
              >
                Cancel
              </Button>

              <Button
                type='button'
                className='flex-1'
                disabled={!localFullName}
                onClick={() => onDialogSignClick()}
              >
                Sign
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DocumentSigningFieldContainer>
  )
}
