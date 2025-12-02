"use client";
import { useEffect, useState } from 'react'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'
import { useGlobalContext } from '@/context/GlobalContext'
import { useParams, useSearchParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { upDateText } from './singHelper'

export type DocumentSigningTextFieldProps = {
  field: any
  onSignField?: (value: string) => Promise<void>
  onUnsignField?: () => Promise<void>
  isDownloadMod: boolean
  originalField: any
  color?: any
}

export const DocumentSigningTextField = ({
  field,
  onSignField,
  onUnsignField,
  originalField,
  isDownloadMod,
  color,
}: DocumentSigningTextFieldProps) => {
  const isLoading = false

  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(3)

  const initialErrors = {
    required: [],
    characterLimit: [],
  }
  const [errors, setErrors] = useState(initialErrors)
  const userInputHasErrors = Object.values(errors).some(
    (error) => error.length > 0,
  )

  const parsedFieldMeta = field.fieldMeta
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  const signerCustomText = Array.isArray(originalField.customText)
      ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
      : null

  const shouldAutoSignField =
    (!field.inserted && parsedFieldMeta?.text) ||
    (!field.inserted && parsedFieldMeta?.text && parsedFieldMeta?.readOnly)

  const [showCustomTextModal, setShowCustomTextModal] = useState(false)
  const [localText, setLocalCustomText] = useState(parsedFieldMeta?.text ?? '')

  useEffect(() => {
    if (!showCustomTextModal) {
      setLocalCustomText(parsedFieldMeta?.text ?? '')
      setErrors(initialErrors)
    }
  }, [showCustomTextModal])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (parsedFieldMeta?.characterLimit) {
      const characterLimit = parsedFieldMeta?.characterLimit
      if (text.length > characterLimit) {
        setErrors({
          required: [],
          characterLimit: ['Character limit exceeded'],
        })
        return
      }
    } 
      setLocalCustomText(text)
      if (errors.characterLimit.length > 0) {
        setErrors({
          required: [],
          characterLimit: [],
        })
      }
    // Validation logic can be added here
    // if (parsedFieldMeta) {
    //   const validationErrors = validateTextField(text, parsedFieldMeta, true);
    //   setErrors({
    //     required: validationErrors.filter((error) => error.includes('required')),
    //     characterLimit: validationErrors.filter((error) => error.includes('character limit')),
    //   });
    // }
  }

  /**
   * When the user clicks the sign button in the dialog where they enter the text field.
   */
  const onDialogSignClick = () => {
    // Validation logic can be added here
    // if (parsedFieldMeta) {
    //   const validationErrors = validateTextField(localText, parsedFieldMeta, true);
    //   if (validationErrors.length > 0) {
    //     setErrors({
    //       required: validationErrors.filter((error) => error.includes('required')),
    //       characterLimit: validationErrors.filter((error) => error.includes('character limit')),
    //     });
    //     return;
    //   }
    // }

    setShowCustomTextModal(false)
    onSign() // Call the sign function after closing the modal
  }

  const onPreSign = () => {
    setShowCustomTextModal(true)

    // Validation logic can be added here
    // if (localText && parsedFieldMeta) {
    //   const validationErrors = validateTextField(localText, parsedFieldMeta, true);
    //   setErrors({
    //     required: validationErrors.filter((error) => error.includes('required')),
    //     characterLimit: validationErrors.filter((error) => error.includes('character limit')),
    //   });
    // }

    return false
  }

  const onSign = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      if (!localText || userInputHasErrors) {
        return
      }
      // Update the field with signature data
      const updatedField = upDateText(
        originalField,
        field,
        localText,
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
        await onSignField(localText)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onRemove = async () => {
    try {
      const updatedField = {
        ...field,
        inserted: false,
        customText: null,
      }

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

      setLocalCustomText(parsedFieldMeta?.text ?? '')
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (shouldAutoSignField) {
      console.log('shouldAutoSignField', shouldAutoSignField)
      // You might want to auto-sign here if needed
    }
  }, [shouldAutoSignField])

  const labelDisplay = parsedFieldMeta?.label
  const textDisplay = parsedFieldMeta?.text
  const fieldDisplayName = labelDisplay ? labelDisplay : textDisplay
  const charactersRemaining =
    (parsedFieldMeta?.characterLimit ?? 0) - (localText.length ?? 0)
  console.log('charactersRemaining', field)

  return (
    <DocumentSigningFieldContainer
      field={field}
      onPreSign={onPreSign}
      onSign={onSign}
      isDownloadMod={isDownloadMod}
      onRemove={onRemove}
      type='Text'
      color={color}
    >
      {!signerCustomText && (
        <DocumentSigningFieldsUninserted>Text</DocumentSigningFieldsUninserted>
      )}

      {signerCustomText && (
        <DocumentSigningFieldsInserted 
          textAlign={parsedFieldMeta?.textAlign || 'left'}
          color={color}
        >
          {signerCustomText?.text}
        </DocumentSigningFieldsInserted>
      )}

      <Dialog open={showCustomTextModal} onOpenChange={setShowCustomTextModal}>
        <DialogContent>
          <DialogTitle>
            {parsedFieldMeta?.label ? parsedFieldMeta.label : 'Text'}
          </DialogTitle>

          <div>
            <Textarea
              id='custom-text'
              placeholder={
                parsedFieldMeta?.placeholder ?? `Enter your text here`
              }
              className={cn('mt-2 w-full rounded-md', {
                'border-2 border-red-300 text-left ring-2 ring-red-200 ring-offset-2 ring-offset-red-200 focus-visible:border-red-400 focus-visible:ring-4 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-200':
                  userInputHasErrors,
                'text-center': parsedFieldMeta?.textAlign === 'center',
                'text-right': parsedFieldMeta?.textAlign === 'right',
              })}
              value={localText}
              onChange={handleTextChange}
            />
            {parsedFieldMeta?.characterLimit && (
              <div className='mt-1 text-sm text-muted-foreground'>
                {charactersRemaining} characters remaining
              </div>
            )}
          </div>

          <DialogFooter>
            <div className='flex flex-nowrap flex-1 gap-4 mt-4 w-full'>
              <Button
                type='button'
              className='flex-1 cursor-pointer bg-black/5 hover:bg-black/10'
        variant='outline'
                onClick={() => {
                  setShowCustomTextModal(false)
                  setLocalCustomText(parsedFieldMeta?.text ?? '')
                }}
              >
                Cancel
              </Button>

              <Button
                type='button'
                className='flex-1'
                disabled={!localText || userInputHasErrors}
                onClick={onDialogSignClick}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DocumentSigningFieldContainer>
  )
}
