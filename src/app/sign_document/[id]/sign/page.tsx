"use client"
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
import EnableSigningOrderDialog from '@/components/common/EnableSigningOrderDialog'

import DocumentSigningForm from '@/components/documents/DocumentSigningForm'
import { ElementVisible } from '@/components/formSteps/element-visible'
import {
  ZCheckboxFieldMeta,
  ZDropdownFieldMeta,
  ZNumberFieldMeta,
  ZRadioFieldMeta,
  ZTextFieldMeta,
} from '@/components/formSteps/meta/field-meta'
import { cn } from '@/components/lib/ClsxConnct'
import { PDFViewer } from '@/components/PDFViewer'
import { FieldType } from '@/components/schema/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_DOCUMENT_DATE_FORMAT } from '@/components/ui/date-formats'
import { DEFAULT_DOCUMENT_TIME_ZONE } from '@/components/ui/time-zones'
import { DocumentSigningProvider } from '@/context/DocumentSigningProvider'
import { usePDFContext } from '@/context/PDFContext'
import { useFetchDocument } from '@/services/hooks/documents/useFetchDocument'
import { LucideChevronDown, LucideChevronUp, XCircle, AlertTriangle } from 'lucide-react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import { match } from 'ts-pattern'
import { useGlobalContext } from '@/context/GlobalContext'
import { getModifiedData } from '@/components/documents/singHelper'
import { jwtDecode } from 'jwt-decode'
import UnauthorizedDialogUi from '@/components/common/UnauthorizedDialogUi'

interface Document {
  id: string
  title: string
  file?: ArrayBuffer
}

interface DocumentEditFormProps {

  params: { id: string }
  className?: string
  initialDocument: Document
}

interface TokenPayload {
  recipientEmail: string
  recipientName: string
  iat: number
  exp: number
}

const Page = ({ initialDocument, className }: DocumentEditFormProps) => {

  const [document, setDocument] = useState<Document>(initialDocument)
  const [documentApiData, setDocumentApiData] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unauthorizedState, setUnauthorizedState] = useState<{
    isOpen: boolean
    reason: 'access_denied' | 'already_signed' | 'already_rejected' | 'token_invalid'
    rejectData: any
  }>({
    isOpen: false,
    reason: 'access_denied',
    rejectData: null,
  })

  const [filteredFields, setFilteredFields] = useState([])
  const { setFields, getStepData, setDocId } = usePDFContext()
  const stepData = getStepData(3)
  const { user } = useGlobalContext()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const documentId = params.id as string
  const folderId = params.folderId as string
  const recipient = searchParams.get('recipient')
  const checkId = searchParams.get('checkId')
  const token = searchParams.get('token')
  const firstStepData = getStepData(1)
  const secondStepData = getStepData(2)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isShowField, setIsShowField] = useState(false)

  // Determine if this is a public signing URL (has token)
  const isPublicUrl = useMemo(() => {
    return !!token
  }, [token])

  // Decode token and extract user details
  const tokenData = useMemo(() => {
    if (!token) return null

    try {
      const decoded = jwtDecode<TokenPayload>(token)

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded?.exp && decoded?.exp < currentTime) {
        console.error('Token has expired')
        setUnauthorizedState({
          isOpen: true,
          reason: 'token_invalid'
        })
        return null
      }

      return {
        email: decoded?.recipientEmail,
        name: decoded?.recipientName,
        token: token
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      setUnauthorizedState({
        isOpen: true,
        reason: 'token_invalid'
      })
      return null
    }
  }, [token])

  // Determine current user details (token-based or localStorage-based)
  const currentUserData = useMemo(() => {
    if (tokenData) {
      return {
        id: checkId || null,
        email: tokenData?.email,
        name: tokenData?.name
      }
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      id: userData?.id,
      email: recipient || userData?.email,
      name: userData?.name
    }
  }, [tokenData, checkId, recipient])

  const userId = currentUserData?.id
  const userEmail = currentUserData?.email
  const userName = currentUserData?.name

  // Fetch document with token if available
  const { data: documentData, isLoading: isDocumentLoading, error: documentError } = useFetchDocument(
    documentId,
    userId,
    folderId,
    tokenData?.token
  )

  useEffect(() => {
    if (filteredFields?.length > 0) {
      setTimeout(() => {
        setIsShowField(true)
      }, 5000)
    }
  }, [filteredFields])

  useEffect(() => {
    if (secondStepData?.signingOrder !== "SEQUENTIAL" || !secondStepData?.signers?.length) return

    const signerEmail = userEmail?.trim()?.toLowerCase()

    // Sort signers by signingOrder
    const sortedSigners = [...secondStepData?.signers].sort(
      (a, b) => a?.signingOrder - b?.signingOrder
    )

    // Find the current user's signer object
    const currentSigner = sortedSigners.find(
      (s) => s?.role === "SIGNER" && s?.email?.trim()?.toLowerCase() === signerEmail
    )

    if (!currentSigner) return

    // Check all previous signers
    const previousSigners = sortedSigners.filter(s => s?.signingOrder < currentSigner?.signingOrder && s?.role === "SIGNER")

    const firstPendingSigner = previousSigners.find(s => s?.status !== "SIGNED")

    if (firstPendingSigner) {
      setIsDialogOpen(firstPendingSigner?.email)
    } else {
      setIsDialogOpen(null)
    }
  }, [secondStepData, userEmail])

  // Handle recipient validation and signing status
  useEffect(() => {
    if (!documentData?.data || !userEmail) return

    const data = documentData?.data

    if(!data?.recipients?.length) return
    const recipientChecked = data?.recipients?.find(
      (recipient: any) => recipient?.email === userEmail,
    )

    // Check if recipient is authorized
    if (!recipientChecked) {
      setUnauthorizedState({
        isOpen: true,
        reason: 'access_denied'
      })
      return
    }

    // Check if already rejected
    if (recipientChecked?.signingStatus === 'REJECTED') {
      setUnauthorizedState({
        isOpen: true,
        reason: 'already_rejected',
        rejectData: data?.documentSignData?.rejection || null,
      })
      return
    }

    // Check if already signed
    if (recipientChecked?.signingStatus === 'SIGNED') {
      setUnauthorizedState({
        isOpen: true,
        reason: 'already_signed',
        rejectData: null,
      })
      return
    }
  }, [documentData, userEmail])

  useEffect(() => {
    if (
      documentApiData &&
      stepData &&
      Array.isArray(stepData.fields) &&
      stepData.fields.length > 0
    ) {
      const data = documentData?.data

      const filteredFields = stepData.fields.map((field) => ({
        type: '',
        secondaryId: 'cme9t0nts001zwnd8jt4dvt53',
        documentId: 17,
        templateId: null,
        recipientId: 17,
        page: field?.pageNumber,
        positionX: field?.positionX,
        positionY: field?.positionY,
        width: field?.width,
        height: field?.height,
        recipients: data?.recipients || field?.recipient || [],
        customText: field?.customText || '',
        inserted: field?.inserted || false,
        fieldMeta: field?.fieldMeta || null,
        signature: field?.signature || '',

        ...field,
      }))

      const signerEmail = userEmail?.trim()?.toLowerCase()

      // Filter fields by signerEmail
      const filteredEmail = filteredFields.filter((item) =>
        item.signerEmail?.trim()?.toLowerCase() === signerEmail
      )

      setFilteredFields(secondStepData?.signingOrder === "SEQUENTIAL" ? filteredEmail : filteredFields)
    }
  }, [stepData, documentApiData, documentData, userEmail])

  useEffect(() => {
    if (documentId) {
      setDocId(documentId)
    }
  }, [documentId])

  useEffect(() => {
    if (documentData?.data && userEmail) {
      const data = documentData?.data

      setFields(data?.documentSignData)
      setDocumentApiData(data)
      setDocument({
        id: data?.id || '',
        // title: data?.title || decodeURIComponent(documentId),
        title: data?.documentSignData?.["0"]?.data?.title?.trim() || data?.title || decodeURIComponent(documentId),
        file: data?.documentData?.initialData,
        fileType: data?.documentData?.fileType,
      })
    }
  }, [documentId, documentData, userEmail])

  // Handle dialog close action
  const handleUnauthorizedClose = () => {
    setUnauthorizedState({ ...unauthorizedState, isOpen: false })

    // For public URLs, dialog is unclosable (this won't be called)
    // For private routes, navigate to dashboard
    if (!isPublicUrl) {
      router.push('/dashboard')
    }
  }

  const handleSigningOrderDialogClose = () => {
    setIsDialogOpen(false)

    // For public URLs, don't navigate
    // For private routes, navigate to dashboard
    if (!isPublicUrl) {
      router.push('/dashboard')
    }
  }

  return (
    <DocumentSigningProvider
      email={userEmail}
      fullName={userName}
      signature={undefined}
      typedSignatureEnabled={true}
      uploadSignatureEnabled={true}
      drawSignatureEnabled={true}
    >
      {/* Loading State */}
      {isDocumentLoading && (
        <div className={cn('p-4 w-full h-screen rounded-md border sm:p-6', className)}>
          <div className='flex flex-col justify-center items-center space-y-4 h-full'>
            <div className='w-12 h-12 rounded-full border-4 animate-spin border-primary border-t-transparent' />
            <p className='text-sm text-muted-foreground'>Loading document...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isDocumentLoading && documentError && (
        <div className={cn('p-4 w-full h-screen rounded-md border sm:p-6', className)}>
          <div className='flex flex-col justify-center items-center space-y-4 h-full'>
            <div className='flex justify-center items-center w-16 h-16 bg-red-100 rounded-full border border-red-200 dark:bg-red-950/30 dark:border-red-800'>
              <XCircle className='w-8 h-8 text-red-600 dark:text-red-400' />
            </div>
            <h3 className='text-xl font-semibold text-color-title'>Failed to Load Document</h3>
            <p className='max-w-md text-sm text-center text-muted-foreground'>
              We couldn't load the document. Please try again later or contact support.
            </p>
            {!isPublicUrl && (
              <Button onClick={() => router.push('/dashboard')} variant='outline'>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty Document State */}
      {!isDocumentLoading && !documentError && (!document || !document.file) && (
        <div className={cn('p-4 w-full rounded-md border sm:p-6', className)}>
          <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
            <div className='flex justify-center items-center w-16 h-16 bg-amber-100 rounded-full border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'>
              <AlertTriangle className='w-8 h-8 text-amber-600 dark:text-amber-400' />
            </div>
            <h3 className='text-xl font-semibold text-color-title'>No Document Available</h3>
            <p className='max-w-md text-sm text-center text-muted-foreground'>
              The document you're looking for is not available or hasn't been uploaded yet.
            </p>
            {!isPublicUrl && (
              <Button onClick={() => router.push('/dashboard')} variant='outline'>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Document Content */}
      {!isDocumentLoading && !documentError && document && document.file && (
        <div className={cn('p-4 w-full rounded-md border sm:p-6', className)}>
          <h1
            className='block max-w-[20rem] truncate text-xl font-semibold text-color-title  md:max-w-[30rem] md:text-2xl'
            title={document?.title || 'pdf dummy.pdf'}
          >
            {document?.title || 'pdf dummy.pdf'}
          </h1>

          {documentApiData && (
            <div className='flex flex-wrap gap-y-2 justify-between items-center mt-0.5 sm:gap-y-0'>
              <div className=''>
                <span className='text-[#667085] text-sm'>
                  <span className='font-semibold text-color-title'>
                    Sender Name:
                  </span>{' '}
                  {documentApiData?.user?.name} |{' '}
                  <span className='font-semibold text-color-title'>
                    Sender Email:
                  </span>{' '}
                  {documentApiData?.user?.email}
                </span>
              </div>
            </div>
          )}

          <div className='flex relative flex-col gap-x-6 gap-y-8 mt-4 md:flex-row lg:gap-x-8 lg:gap-y-0'>
            <div className='flex-1 h-full'>
              <Card className='rounded-xl before:rounded-xl' gradient>
                <CardContent className='p-6 flex flex-col h-full min-h-[900px]'>
                  {document?.file ? (
                    <PDFViewer
                      file={document.file}
                      fileType={document?.fileType}
                      className='w-full h-full'
                    />
                  ) : (
                    <div className='flex justify-center items-center h-64 text-muted-foreground'>
                      No PDF document available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div
              key={isExpanded ? 'expanded' : 'collapsed'}
              className='group/document-widget sticky bottom-8 left-0 z-50 h-fit max-h-[calc(100dvh-2rem)] w-full flex-shrink-0 px-4 md:sticky md:bottom-[unset] md:top-4 md:z-auto md:max-w-lg md:w-full md:px-0'
              data-expanded={isExpanded || undefined}
            >
              <div className='flex flex-col px-4 py-4 w-full rounded-xl border border-border md:py-6'>
                <div className='flex gap-x-2 justify-between items-center'>
                  <h3 className='text-xl font-semibold text-foreground md:text-2xl'>
                    Sign Document
                  </h3>
                  <Button variant='outline' className='p-0 w-8 h-8 md:hidden'>
                    {isExpanded ? (
                      <LucideChevronDown
                        className='w-5 h-5 text-muted-foreground'
                        onClick={() => setIsExpanded(false)}
                      />
                    ) : (
                      <LucideChevronUp
                        className='w-5 h-5 text-muted-foreground'
                        onClick={() => setIsExpanded(true)}
                      />
                    )}
                  </Button>
                </div>
                <div className='hidden group-data-[expanded]/document-widget:block md:block'>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Please review the document before signing.
                  </p>
                  <hr className='mt-4 mb-8 border-border' />
                </div>
                <div className='-mx-2 hidden px-2 group-data-[expanded]/document-widget:block md:block'>
                  <DocumentSigningForm
                    initialDocument={document}
                    isPublicUrl={isPublicUrl}
                  />
                </div>
              </div>
            </div>
          </div>
          {filteredFields.length && isShowField && (
            <ElementVisible target={PDF_VIEWER_PAGE_SELECTOR}>
              {filteredFields?.map((field) =>
                match(field.type)
                  .with(FieldType.SIGNATURE, () => {
                    const signatureData = Array.isArray(field.signature)
                      ? field.signature.find(
                        (signature: any) => signature.email === userEmail,
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
                        key={field.id}
                        originalField={field}
                        field={modifiedField}
                      />
                    )
                  })
                  .with(FieldType.INITIALS, () => {
                    return (
                      <DocumentSigningInitialsField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.NAME, () => {
                    return (
                      <DocumentSigningNameField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.EMAIL, () => {
                    return (
                      <DocumentSigningEmailField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.DATE, () => {
                    return (
                      <DocumentSigningDateField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                        dateFormat={firstStepData?.meta?.dateFormat ? firstStepData?.meta?.dateFormat : DEFAULT_DOCUMENT_DATE_FORMAT}
                        timezone={firstStepData?.meta?.timezone ? firstStepData?.meta?.timezone : DEFAULT_DOCUMENT_TIME_ZONE}
                      />
                    )
                  })
                  .with(FieldType.TEXT, () => {
                    return (
                      <DocumentSigningTextField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.NUMBER, () => {
                    return (
                      <DocumentSigningNumberField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.RADIO, () => {
                    return (
                      <DocumentSigningRadioField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.CHECKBOX, () => {
                    return (
                      <DocumentSigningCheckboxField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .with(FieldType.DROPDOWN, () => {
                    return (
                      <DocumentSigningDropdownField
                        key={field.id}
                        field={getModifiedData(field, userEmail)}
                        originalField={field}
                      />
                    )
                  })
                  .otherwise(() => null),
              )}
            </ElementVisible>
          )}
        </div>
      )}

      {/* Dialogs - Always rendered */}
      {unauthorizedState.isOpen && (
        <UnauthorizedDialogUi
          isOpen={unauthorizedState.isOpen}
          // onClose={handleUnauthorizedClose}
          reason={unauthorizedState.reason}
          rejectData={unauthorizedState.rejectData}
          isLoading={false}
          isPublicUrl={isPublicUrl}
        />
      )}
      <EnableSigningOrderDialog
        isOpen={!!isDialogOpen}
        onClose={handleSigningOrderDialogClose}
        onConfirm={handleSigningOrderDialogClose}
        documentTitle="Contract Agreement"
        firstSignerEmail={isDialogOpen}
        isPublicUrl={isPublicUrl}
      />
    </DocumentSigningProvider>
  )
}

export default Page