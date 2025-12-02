'use client'

import { PDF_VIEWER_PAGE_SELECTOR } from '@/components/constants/pdf-viewer'
import { DocumentSigningDateField } from '@/components/documents/document-signing-date-field'
import { DocumentSigningEmailField } from '@/components/documents/document-signing-email-field'
import { DocumentSigningInitialsField } from '@/components/documents/document-signing-initials-field'
import { DocumentSigningNameField } from '@/components/documents/document-signing-name-field'
import { DocumentSigningSignatureField } from '@/components/documents/document-signing-signature-field'
import { DocumentSigningTextField } from '@/components/documents/document-signing-text-field'
import { DocumentSigningNumberField } from '@/components/documents/document-signing-number-field'
import { DocumentSigningRadioField } from '@/components/documents/document-signing-radio-field'
import { DocumentSigningCheckboxField } from '@/components/documents/document-signing-checkbox-field'
import { DocumentSigningDropdownField } from '@/components/documents/document-signing-dropdown-field'
import { useGlobalContext } from '@/context/GlobalContext'
import { ElementVisible } from '@/components/formSteps/element-visible'
import { downloadPDF } from '@/components/lib/client-only/download-pdf'
import { PDFViewer } from '@/components/PDFViewer'
import { FieldType } from '@/components/schema/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_DOCUMENT_DATE_FORMAT } from '@/components/ui/date-formats'
import { DEFAULT_DOCUMENT_TIME_ZONE } from '@/components/ui/time-zones'
import { DocumentSigningProvider } from '@/context/DocumentSigningProvider'
import { usePDFContext } from '@/context/PDFContext'
import { useFetchDocument } from '@/services/hooks/documents/useFetchDocument'
import { ChevronLeft, Download, File } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { getModifiedData } from '@/components/documents/singHelper'
import Image from 'next/image'
import CompletedIcon from '@/assets/icons/completed.png'
import PendingIcon from '@/assets/icons/pending.png'
import DraftIcon from '@/assets/icons/draft.png'
import { XCircle, SignatureIcon } from 'lucide-react'
import { useRecipientColors } from '@/components/common/recipient-colors'
interface Document {
  id: string
  title: string
  file?: ArrayBuffer
  fileType?: string
}

const FRIENDLY_STATUS_MAP: Record<StatusKey, FriendlyStatus> = {
  PENDING: {
    label: 'Pending',
    labelExtended: 'Document pending',
    icon: <Image src={PendingIcon} width={18} height={18} alt='Pending' />,
    color: 'text-[#D0A806] bg-[#D0A806]/10 w-fit px-2 py-1 rounded-full',
  },
  COMPLETED: {
    label: 'Completed',
    labelExtended: 'Document completed',
    icon: <Image src={CompletedIcon} width={18} height={18} alt='Completed' />,
    color: 'text-[#2F9449] bg-[#2F9449]/10 w-fit px-2 py-1 rounded-full',
  },
  DRAFT: {
    label: 'Draft',
    labelExtended: 'Document draft',
    icon: <Image src={DraftIcon} width={18} height={18} alt='Draft' />,
    color: 'text-[#6A27D9] bg-[#6A27D9]/10 w-fit px-2 py-1 rounded-full',
  },
  REJECTED: {
    label: 'Rejected',
    labelExtended: 'Document rejected',
    icon: <XCircle size={18} />,
    color: 'text-red-500 dark:text-red-300',
  },
  INBOX: {
    label: 'Inbox',
    labelExtended: 'Document inbox',
    icon: <SignatureIcon size={18} />,
    color: 'text-muted-foreground',
  },
  ALL: {
    label: 'All',
    labelExtended: 'All documents',
    color: 'text-muted-foreground',
  },
}
const Page = ({
  params,
  initialDocument,
}: {
  params: { id: string }
  className?: string
  initialDocument: Document
}) => {
  const [document, setDocument] = useState<Document>(initialDocument)
  const [isDownloading, setIsDownloading] = useState(false)
  const { user } = useGlobalContext()
  const [filteredFields, setFilteredFields] = useState([])
  const { setFields, getStepData } = usePDFContext()
  const stepData = getStepData(3)
  const firstStepData = getStepData(1)
  const step2Data = getStepData(2)

  const { id: documentId } = React.use(params)

  const userId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')?.id
      : undefined

  const { data: documentData } = useFetchDocument(documentId, userId)

  useEffect(() => {
    if (stepData?.fields?.length) {
      // Get signers from step 2 for color mapping
      const signers = step2Data?.signers || []

      // Only keep fields whose signer has status === 'SIGNED'
      const signedFields = stepData.fields.filter((field: any) => {
        const signer = signers.find(
          (s: any) => s.email === field.signerEmail,
        )
        return signer?.status === 'SIGNED'
      })

      const mappedFields = signedFields.map((field: any) => {
        // Find the recipient for this field
        const recipient = signers.find(
          (signer: any) => signer.email === field.signerEmail,
        )

        return {
        type: 'SIGNATURE',
        secondaryId: 'cme9t0nts001zwnd8jt4dvt53',
        documentId: 17,
        templateId: null,
        recipientId: 17,
        page: field?.pageNumber,
        positionX: field?.positionX,
        positionY: field?.positionY,
        width: field?.width,
        height: field?.height,
        customText: field?.customText || '',
        inserted: field?.inserted || false,
        fieldMeta: field?.fieldMeta || null,
        recipient: {
          id: 17,
          documentId: 17,
          templateId: null,
          email: 'harsh125@gmail.com',
          name: 'Harsh',
          token: '2NNV00bWtwADO5rrC4vCE',
          documentDeletedAt: null,
          expired: null,
          signedAt: null,
          authOptions: {
            accessAuth: [],
            actionAuth: [],
          },
          signingOrder: 1,
          rejectionReason: null,
          role: 'SIGNER',
          readStatus: 'NOT_OPENED',
          signingStatus: 'NOT_SIGNED',
          sendStatus: 'NOT_SENT',
        },
        signature: field?.signature || '',
        // Add the original signerEmail for color mapping
        signerEmail: field.signerEmail,
        // Add recipient index for color calculation
        recipientIndex: recipient
          ? signers.findIndex((s: any) => s.email === recipient.email)
          : 0,
        ...field,
      }
    })

      setFilteredFields(mappedFields)
    }
  }, [stepData, step2Data])

  useEffect(() => {
    if (documentData?.data) {
      const data = documentData.data
      setFields(data?.documentSignData)
      setDocument({
        id: data?.id || '',
        title: data?.title || decodeURIComponent(documentId),
        file: data?.documentData?.initialData,
        fileType: data?.documentData?.fileType,
      })
    }
  }, [documentId, documentData, setFields])
  const handleDownload = async (data) => {
    console.log('Document data for download:', data)

    // Extract the actual document data from the response
    const documentDataToDownload =
      data?.data?.documentData || data?.documentData || data

    if (!documentDataToDownload) {
      alert('No document data available for download')
      return
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user?.id
    await downloadPDF({
      documentData: documentDataToDownload,
      documentId: documentId,
      fileName: document?.title || `document-documentId.pdf`,
      userId: userId,
    })
    setIsDownloading(false)
  }
  const onDownloadClick = async () => {
    try {
      setIsDownloading(true)

      // If we already have the data, use it directly
      if (!documentData) {
        return
      }

      // If fetchDocument doesn't return the data, it will trigger the useEffect
      if (documentData.data) {
        await handleDownload(documentData.data)
      }
    } catch (error) {
      console.error('Error fetching document for download:', error)
      alert('Error downloading document')
      setIsDownloading(false)
    }
  }
  const { label, icon, color } =
    FRIENDLY_STATUS_MAP[
      (documentData?.data?.status?.toUpperCase() as StatusKey) || 'ALL'
    ] || FRIENDLY_STATUS_MAP.ALL

  const userEmail = user?.data?.email
  return (
    <DocumentSigningProvider
      email={'email'}
      fullName={'name'}
      signature={undefined}
      typedSignatureEnabled={false}
      uploadSignatureEnabled={false}
      drawSignatureEnabled={false}
    >
      <div className='px-4 mx-auto -mt-4 w-full max-w-screen-xl md:px-8'>
        <Link
          href='/'
          className='flex items-center text-[#7AC455] hover:opacity-80'
        >
          <ChevronLeft className='inline-block mr-2 w-5 h-5' />
          Documents
        </Link>
        <div className='flex justify-between items-end mt-4 w-full'>
          <div className='flex-1'>
            <h1
              className='block max-w-[20rem] truncate text-2xl font-semibold md:max-w-[30rem] md:text-3xl'
              title={document?.title}
            >
              {document?.title}
            </h1>
            <div className='mt-2.5 flex items-center gap-x-6 '>
              <span className='flex gap-1.5 items-center text-muted-foreground'>
                {icon}
                {label}
              </span>
              {/* <DocumentStatus status={documentData?.data?.status} /> */}
            </div>
          </div>
          <Button
            className='w-32'
            onClick={onDownloadClick}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className='mr-2 -ml-1 w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent' />
                Downloading...
              </>
            ) : (
              <>
                <Download className='inline mr-2 -ml-1 w-4 h-4' />
                Download
              </>
            )}
          </Button>
        </div>
        <div className='flex relative flex-col gap-x-6 gap-y-8 mt-4 w-full sm:mt-8 md:flex-row lg:gap-x-8 lg:gap-y-0'>
          <div className='flex-1 mx-auto w-full max-w-5xl'>
            <Card className='rounded-xl before:rounded-xl' gradient>
              <CardContent className='p-6 h-full bg-white'>
                <PDFViewer
                  file={document?.file}
                  fileType={document?.fileType}
                  className='w-full h-full'
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {filteredFields?.length > 0 && (
          <ElementVisible target={PDF_VIEWER_PAGE_SELECTOR}>
            {filteredFields.map((field) => {

              // Calculate recipient index for color
              const signers = step2Data?.signers || []
              const recipientIndex = signers.findIndex(signer => 
                signer.email === field.signerEmail
              )
              const actualIndex = recipientIndex === -1 ? 0 : recipientIndex
              const signerStyles = useRecipientColors(actualIndex)

              const commonProps = {
                key: field.id,
                isDownloadMod: true,
                // isDownloadMod: false, // For multiple signer color view
                originalField: field,
                field: getModifiedData(field, userEmail),
                color: signerStyles,
              }

              switch (field.type) {
                case FieldType.SIGNATURE: {
                  const signatureData = Array.isArray(field.signature)
                    ? field.signature.find(
                        (sig: any) => sig.email === userEmail,
                      )
                    : field.signature

                  const modifiedField = {
                    ...field,
                    inserted:
                      signatureData?.signatureImageAsBase64 ||
                      signatureData?.typedSignature,
                    signature: signatureData,
                  }

                  return (
                    <DocumentSigningSignatureField
                      {...commonProps}
                      field={modifiedField}
                    />
                  )
                }

                case FieldType.INITIALS:
                  return <DocumentSigningInitialsField {...commonProps} />

                case FieldType.NAME:

                  return <DocumentSigningNameField {...commonProps} />

                case FieldType.EMAIL:
                  return <DocumentSigningEmailField {...commonProps} />

                case FieldType.DATE:

                  return (
                    <DocumentSigningDateField
                      {...commonProps}
                      dateFormat={
                        firstStepData?.meta?.dateFormat ||
                        DEFAULT_DOCUMENT_DATE_FORMAT
                      }
                      timezone={
                        firstStepData?.meta?.timezone ||
                        DEFAULT_DOCUMENT_TIME_ZONE
                      }
                    />
                  )

                case FieldType.TEXT:
                  return <DocumentSigningTextField {...commonProps} />

                case FieldType.NUMBER:
                  return <DocumentSigningNumberField {...commonProps} />

                case FieldType.RADIO:
                  return <DocumentSigningRadioField {...commonProps} />

                case FieldType.CHECKBOX:
                  return <DocumentSigningCheckboxField {...commonProps} />

                case FieldType.DROPDOWN:
                  return <DocumentSigningDropdownField {...commonProps} />

                default:
                  return null
              }
            })}
          </ElementVisible>
        )}
      </div>
    </DocumentSigningProvider>
  )
}

export default Page
