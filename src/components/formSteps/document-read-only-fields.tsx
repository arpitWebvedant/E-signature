'use client'

import { usePDFContext } from '@/context/PDFContext'
import { Clock, EyeOffIcon, SignatureIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PDF_VIEWER_PAGE_SELECTOR } from '../constants/pdf-viewer'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { PopoverHover } from '../ui/popover'
import { ElementVisible } from './element-visible'
import { FieldRootContainer } from './field/field'
import { FieldContent } from './field/field-content'
import { extractInitials } from './field/recipient-formatter'
import { Field } from '../schema/types'
import { useRecipientColors } from '../common/recipient-colors'

interface FieldWithRecipient extends Field {
  recipient?: {
    id: number
    name: string
    email: string
    signingStatus: string
  }
}

export const DocumentReadOnlyFields = ({
  documentMeta,
  showFieldStatus = true,
  showRecipientTooltip = true,
}: {
  documentMeta?: string
  showFieldStatus?: boolean
  showRecipientTooltip?: boolean
}) => {
  const [filteredFields, setFilteredFields] = useState<FieldWithRecipient[]>([])
  const { getStepData } = usePDFContext()
  const stepData = getStepData(3)
  const step2Data = getStepData(2) // Get signer data from step 2

  useEffect(() => {
    if (
      stepData &&
      Array.isArray(stepData.fields) &&
      stepData.fields.length > 0
    ) {
      const signers = step2Data?.signers || []
      
      const filteredFields = stepData.fields.map((field, index) => {
        // Find the actual recipient for this field by email
        const recipient = signers.find(signer => signer.email === field.signerEmail)
        
        const fieldWithRecipient: FieldWithRecipient = {
          id: index, 
          secondaryId: field.formId || `field-${index}`,
          documentId: 17,
          templateId: null,
          recipientId: recipient?.id || 17,
          type: field.type as any, // Cast to FieldType
          page: field?.pageNumber || 1,
          pageX: field?.pageX?.toString() || '0',
          pageY: field?.pageY?.toString() || '0',
          pageHeight: field?.pageHeight?.toString() || '40',
          pageWidth: field?.pageWidth?.toString() || '100',
          positionX: field?.pageX?.toString() || '0',
          positionY: field?.pageY?.toString() || '0',
          width: field?.pageWidth?.toString() || '100',
          height: field?.pageHeight?.toString() || '40',
          customText: field?.customText || '',
          inserted: field?.inserted || false,
          fieldMeta: field?.fieldMeta || null,
          // recipient: {
          //   id: 17,
          //   documentId: 17,
          //   templateId: null,
          //   email: 'harsh125@gmail.com',
          //   name: 'Harsh',
          //   token: '2NNV00bWtwADO5rrC4vCE',
          //   documentDeletedAt: null,
          //   expired: null,
          //   signedAt: null,
          //   authOptions: {
          //     accessAuth: [],
          //     actionAuth: [],
          //   },
          //   signingOrder: 1,
          //   rejectionReason: null,
          //   role: 'SIGNER',
          //   readStatus: 'NOT_OPENED',
          //   signingStatus: 'NOT_SIGNED',
          //   sendStatus: 'NOT_SENT',
          // },
          // Add recipient data for display purposes
          recipient: recipient ? {
            id: recipient.id,
            name: recipient.name,
            email: recipient.email,
            signingStatus: 'NOT_SIGNED' // Default status for read-only view
          } : undefined
        }

        return fieldWithRecipient
      })

      setFilteredFields(filteredFields)
    }
  }, [stepData, step2Data])

  // const handleHideField = (fieldId: string) => {
  //   setHiddenFieldIds((prev) => ({ ...prev, [fieldId]: true }))
  // }

  return (
    <ElementVisible target={PDF_VIEWER_PAGE_SELECTOR}>
      {Array.isArray(filteredFields) &&
        filteredFields.map((field, index: number) => {
          const signers = step2Data?.signers || []
          
          const fieldRecipientEmail = field.recipient?.email

          // Find the index in signers array
          const recipientIndex = signers.findIndex(signer => signer.email === fieldRecipientEmail)
                    
          const actualIndex = recipientIndex === -1 ? 0 : recipientIndex
          const signerStyles = useRecipientColors(actualIndex)
          

          return (
            <FieldRootContainer 
              field={field} 
              key={field.secondaryId || index} 
              color={signerStyles}
              isDownloadMod={false}
            >
              {showRecipientTooltip && field.recipient && (
                <div className='absolute -top-3 -right-3'>
                  <PopoverHover
                    trigger={
                      <Avatar className='w-6 h-6 border-2 border-solid transition-colors border-gray-200/50 hover:border-gray-200'>
                        <AvatarFallback className='text-xs text-gray-400 bg-neutral-50'>
                          {extractInitials(
                            field.recipient?.name || field.recipient?.email,
                          )}
                        </AvatarFallback>
                      </Avatar>

                    }
                    contentProps={{
                      className: 'relative flex w-fit flex-col p-4 text-sm',
                    }}
                  >
                    {showFieldStatus && (
                      <Badge className='mx-auto mb-1 py-0.5' variant='default'>
                        {field.recipient.signingStatus === 'SIGNED' ? (
                          <>
                            <SignatureIcon className='mr-1 w-3 h-3' />
                            Signed
                          </>
                        ) : (
                          <>
                            <Clock className='mr-1 w-3 h-3' />
                            Pending
                          </>
                        )}
                      </Badge>
                    )}
                    <p className='font-semibold text-center'>
                      <span>{field.type}</span>
                    </p>
                    <p className='mt-1 text-xs text-center text-muted-foreground'>
                      {field.recipient?.name
                        ? `${field.recipient?.name} (${field.recipient?.email})`
                        : field.recipient?.email}{' '}
                    </p>
                    <button
                      className='absolute top-0 right-0 p-2 my-1 focus:outline-none focus-visible:ring-0'
                      // onClick={() => handleHideField(field.secondaryId)}
                      title='Hide field'
                    >
                      <EyeOffIcon className='w-3 h-3' />
                    </button>
                  </PopoverHover>
                </div>
              )}
              <FieldContent field={field} documentMeta={documentMeta} />
            </FieldRootContainer>
          )
        })}
    </ElementVisible>
  )
}
