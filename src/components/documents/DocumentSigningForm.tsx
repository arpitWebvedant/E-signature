'use client'
import { useEffect, useState, useMemo } from 'react'

import { useRequiredDocumentSigningContext } from '@/context/DocumentSigningProvider'
import { useUpdateStatus } from '@/services/hooks/documents/useUploadPdf'
import { useRouter, useSearchParams } from 'next/navigation'
import { DocumentStatus } from '../schema/types'
import { User, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import SignaturePadDialog from '../signature-modal/SignaturePadDialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePDFContext } from '@/context/PDFContext'
import { jwtDecode } from 'jwt-decode'

interface Document {
  file: ArrayBuffer
  fileType: string
  id: number
  type: string
  title: string
}

interface Recipient {
  documentDeletedAt: string
  documentId: number
  email: string
  expiredAt: string
  id: number
  name: string
  readStatus: string
  rejectionReason: string
  role: string
  sendStatus: string
  signedAt: string
  signingOrder: number
  signingStatus: string
  templateId: number
  token: string
}

interface Field {
  customText: string
  documentId: string
  fieldMeta: string
  formId: string
  height: number
  id: number
  inserted: boolean
  recipient: Recipient
  pageHeight: number
  pageWidth: number
  pageNumber: number
  positionX: number
  pageX: number
  pageY: number
  positionY: number
  recipientId: number
  signature: string
  templateId: number
  type: string
  width: number
  signerEmail: string
}

interface TokenPayload {
  recipientEmail: string
  recipientName: string
  iat: number
  exp: number
}

interface DocumentSigningFormProps {
  initialDocument: Document
  isPublicUrl?: boolean
}

const DocumentSigningForm = ({
  initialDocument,
  isPublicUrl = false,
}: DocumentSigningFormProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { getStepData, updateStepData } = usePDFContext()
  const recipient = searchParams.get('recipient')
  const token = searchParams.get('token')
  const checkId = searchParams.get('checkId')
  const stepData = getStepData(3)
  const secondStepData = getStepData(2)
  const settingsData = getStepData(1)
  const [checkIsCompleted, setCheckIsCompleted] = useState(false)

  const { fullName, signature, setFullName, setSignature } =
    useRequiredDocumentSigningContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)
  const [isTokenInvalid, setIsTokenInvalid] = useState(false)
  const [document, setDocument] = useState(initialDocument)

  const { mutateAsync: updateStatus } = useUpdateStatus()

  // Decode token and extract user details
  const tokenData = useMemo(() => {
    if (!token) return null

    try {
      const decoded = jwtDecode<TokenPayload>(token)

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime) {
        console.error('Token has expired')
        setIsTokenInvalid(true)
        return null
      }

      return {
        email: decoded.recipientEmail,
        name: decoded.recipientName,
        token: token,
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      setIsTokenInvalid(true)
      return null
    }
  }, [token])

  // Determine current user info based on token or localStorage
  const currentUserInfo = useMemo(() => {
    if (tokenData) {
      // Token-based user (public signing link)
      return {
        email: tokenData.email,
        name: fullName || tokenData.name,
        id: checkId || null,
        isPublicUser: true,
        token: tokenData.token,
      }
    } else {
      // Logged-in user from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      return {
        email: recipient || userData?.email || '',
        name: userData?.name || '',
        id: userData?.id || null,
        isPublicUser: false,
        token: null,
      }
    }
  }, [tokenData, checkId, recipient, fullName])
useEffect(() => {
  if (
    stepData &&
    Array.isArray(stepData?.fields) &&
    stepData?.fields.length > 0
  ) {
    const filteredFields = stepData.fields.map((field) => ({ ...field }))
    const signerEmail = currentUserInfo?.email?.trim()?.toLowerCase()

    // Filter fields by signerEmail
    const filteredEmail = filteredFields.filter(
      (item) => item.signerEmail?.trim()?.toLowerCase() === signerEmail,
    )

    const keyCheck =
      secondStepData?.signingOrder === 'SEQUENTIAL'
        ? filteredEmail
        : filteredFields

    // ✅ Completion check
    const checkCompletion = (item) => {
      if (item.type === 'SIGNATURE') {
        if (Array.isArray(item.signature)) {
          return item.signature.some(
            (sig) =>
              sig?.email?.trim()?.toLowerCase() === signerEmail &&
              ((sig?.signatureImageAsBase64 &&
                sig?.signatureImageAsBase64?.trim() !== '') ||
                (sig?.typedSignature && sig?.typedSignature?.trim() !== '')),
          )
        } else if (typeof item.signature === 'object') {
          return (
            item.signature?.typedSignature ||
            item.signature?.signatureImageAsBase64
          )
        } else if (typeof item.signature === 'string') {
          return item.signature.trim() !== ''
        }
        return false
      }

      // ✅ Handle customText (string or array)
      if (typeof item.customText === 'string') {
        return item.customText.trim() !== ''
      } else if (Array.isArray(item.customText)) {
        return item.customText.some(
          (txt) =>
            txt?.text !== '' && txt?.text !== null && txt?.text !== undefined,
        )
      }

      return false
    }

    // If single signer
    if (secondStepData?.signers.length === 1) {
      const allValid = keyCheck.every(checkCompletion)
      setCheckIsCompleted(allValid)
    } else {
      // Multiple signers
      const allValid = keyCheck.every(checkCompletion)
      setCheckIsCompleted(allValid)
    }
  }
}, [stepData, currentUserInfo?.email, secondStepData?.signingOrder])


  useEffect(() => {
    setDocument(initialDocument)
  }, [initialDocument])

  // Set initial fullName from token if available
  useEffect(() => {
    if (tokenData && tokenData.name && !fullName) {
      setFullName(tokenData.name)
    }
  }, [tokenData, fullName, setFullName])

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      // Construct the reject URL 
      const rejectUrl = `/reject-document/${initialDocument.id}/reject?checkId=${checkId}&action=reject&token=${encodeURIComponent(token || '')}&recipient=${encodeURIComponent(recipient || '')}&isClose=true`;
      
      // Redirect to the reject endpoint
      router.push(rejectUrl);
      
    } catch (error) {
      console.error('Error rejecting document:', error);
    } 
  }
  const finalName = fullName || currentUserInfo?.name
  const signerEmail = currentUserInfo?.email?.trim()?.toLowerCase()

  const test = async () => {
    await updateStatus({
      data: {
        documentId: document?.id,
        email: currentUserInfo?.email,
        userId: currentUserInfo?.id,
        status: DocumentStatus.COMPLETED,
        recipients: currentUserInfo?.email,
        signature,
        token: currentUserInfo?.token || undefined,
      },
    })

    setSuccessDialog({
      documentId: document?.id,
      name: finalName,
      email: currentUserInfo?.email,
      userId: currentUserInfo?.id,
      status: DocumentStatus.COMPLETED,
      recipients: currentUserInfo?.email,
      signature,
    })
  }

  const handleComplete = async () => {
    if (!checkIsCompleted) {
      return
    }
    try {
      setIsSubmitting(true)

      if (!currentUserInfo?.email) {
        console.error('User email is required')
        return
      }

      if (!currentUserInfo?.name && !fullName) {
        console.error('User name is required')
        return
      }

      // Use fullName from input or fallback to currentUserInfo?.name


      const updatedSigners = secondStepData?.signers?.map((signer: any) => {
        if (signer?.email?.toLowerCase() === signerEmail) {
          return {
            ...signer,
            status: 'SIGNED',
          }
        }
        return signer
      })

      updateStepData(
        2,
        {
          ...secondStepData,
          signers: updatedSigners,
          isComplete: true,
        },
        false,
        (resp: any) => {
          if (!resp.isError) {
            console.log('✅ Document updated successfully')
            test()
          } else {
            console.error('❌ Failed to update document')
          }
        }
      )

    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogClose = () => {
    setSuccessDialog(false)

    // For public URLs, stay on the page (dialog is unclosable)
    // For private routes, navigate to dashboard
    if (!isPublicUrl) {
      router.push('/dashboard')
    }
  }

  const handleCancel = () => {
    // For public URLs, prevent navigation
    if (isPublicUrl) {
      console.log('Cannot navigate away from public signing page')
      return
    }

    // For private routes, navigate back
    router.back()
  }

  // Get recipient color from step data
  const getRecipientColor = () => {
    const signerEmail = currentUserInfo?.email?.trim()?.toLowerCase()
    const signer = secondStepData?.signers?.find(
      (s: any) => s.email?.trim()?.toLowerCase() === signerEmail
    )
    return signer?.color || '#000000' // Fallback to black if no color found
  }

  const recipientColor = getRecipientColor()

  return (
    <>
      {isTokenInvalid ? (
        <div className='flex flex-col justify-center items-center p-8 h-full text-center'>
          <div className='flex justify-center items-center mb-4 w-16 h-16 bg-red-100 rounded-full border border-red-200 dark:bg-red-950/30 dark:border-red-800'>
            <XCircle className='w-8 h-8 text-red-600 dark:text-red-400' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-color-title'>
            Invalid or Expired Link
          </h3>
          <p className='max-w-md text-sm text-muted-foreground'>
            This signing link is invalid or has expired. Please contact the
            document sender for a new link.
          </p>
        </div>
      ) : (
        <>
          <div className='flex flex-col h-full'>
            <div className='flex overflow-y-auto overflow-x-hidden flex-col flex-1 px-2 -mx-2 custom-scrollbar'></div>
            <div className='flex flex-col flex-1'>
              <fieldset
                disabled={isSubmitting}
                className='flex overflow-y-auto flex-col flex-1 gap-4 px-2 -mx-2'
              >
                <div className='flex flex-col flex-1 gap-y-4'>
                  <div>
                    <Label className='mb-0 text-black' htmlFor='full-name'>
                      Full Name
                    </Label>
                    <Input
                      type='text'
                      id='full-name'
                      className='mt-1 bg-background'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value.trimStart())}
                      placeholder={
                        currentUserInfo?.isPublicUser
                          ? 'Enter your full name'
                          : ''
                      }
                    />
                  </div>
                  <div>
                    <Label className='mb-0 text-black' htmlFor='Signature'>
                      Signature
                    </Label>
                    <SignaturePadDialog
                      className='mt-1'
                      disabled={isSubmitting}
                      onChange={(v) => setSignature(v ?? '')}
                      value={signature ?? ''}
                      typedSignatureEnabled={settingsData?.meta?.signatureTypes.includes(
                        'typed',
                      )}
                      uploadSignatureEnabled={settingsData?.meta?.signatureTypes.includes(
                        'draw_upload',
                      )}
                      drawSignatureEnabled={settingsData?.meta?.signatureTypes.includes(
                        'handwritten',
                      )}
                      recipientColor={recipientColor}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
            <div className='flex flex-col gap-4 mt-6 md:flex-row'>
              {isPublicUrl ? null : ( // For public URLs, hide the cancel button
                // For private routes, show functional cancel button
                <Button
                  type='button'
                  className='w-full d bg-black/5 hover:bg-black/10'
                  variant='secondary'
                  size='lg'
                  disabled={
                    typeof window !== 'undefined' && window.history.length <= 1
                  }
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
              <div className="flex flex-col w-full">
                <Button
                  className='w-full'
                  type='button'
                  size='lg'
                  disabled={!checkIsCompleted}
                  loading={isSubmitting}
                  onClick={handleComplete}
                >
                  Complete
                </Button>
                <Button
                  className='mt-3 w-full font-bold text-white bg-red-600 hover:bg-red-700'
                  type='button'
                  size='lg'
                  disabled={isTokenInvalid}
                  loading={isRejecting}
                  onClick={handleReject}
                >
                  Reject Document
                </Button>
              </div>
            </div>
          </div>
          <Dialog
            open={!!successDialog}
            className='sm:max-w-xl'
            onOpenChange={(open) => {
              // Prevent closing for public URLs
              if (isPublicUrl && !open) {
                return
              }
              if (!open) {
                handleDialogClose()
              }
            }}
          >
            <DialogContent
              className='!space-y-0.5 sm:max-w-xl gap-2.5'
              onPointerDownOutside={(e) => {
                // Prevent closing by clicking outside for public URLs
                if (isPublicUrl) {
                  e.preventDefault()
                }
              }}
              onEscapeKeyDown={(e) => {
                // Prevent closing with ESC key for public URLs
                if (isPublicUrl) {
                  e.preventDefault()
                }
              }}
            >
              <DialogHeader>
                <div className='flex justify-center items-center w-12 h-12 bg-green-100 rounded-full border border-green-200 dark:bg-green-950/30 dark:border-green-800'>
                  <CheckCircle2 className='w-6 h-6 text-green-600 dark:text-green-400' />
                </div>

                <DialogTitle>Document Signed Successfully!</DialogTitle>
                <p className='text-sm text-muted-foreground'>
                  You have successfully signed the document?.
                </p>
              </DialogHeader>
              <div className='flex justify-between items-center'>
                <h3 className='text-base font-semibold text-color-title'>
                  Documents
                </h3>
              </div>
              <div className='grid grid-cols-1 gap-2'>
                <div className='flex gap-2 items-center px-4 py-2 rounded-md border'>
                  <Avatar className='w-10 h-10 text-xs font-semibold border shadow-sm transition-transform  border-[#787878]/50 group-hover:scale-105'>
                    <AvatarFallback className='bg-[#787878]/15'>
                      <User
                        fill='#000'
                        strokeWidth={1}
                        className='w-5 h-5 color-title stroke-[#000]'
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className='text-sm font-semibold text-color-title'>
                      Signed by : {successDialog.name || 'Unknown User'}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {successDialog.email || 'Unknown User'}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex gap-2 rounded-xs items-center border-l-2 border-[#2F9449] py-2 px-2 bg-[#2F9449]/5 '>
                <div>
                  <div className='flex justify-center items-center w-8 h-8 bg-green-100 rounded-full border border-green-200 dark:bg-green-950/30 dark:border-green-800'>
                    <AlertCircle className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                </div>
                <div>
                  <h4 className='text-xs font-semibold text-[#2F9449]'>
                    A confirmation email has been sent to your inbox with the
                    signed document?.
                  </h4>
                </div>
              </div>
              {!isPublicUrl && (
                <DialogFooter className='flex gap-2 justify-end mt-4'>
                  <Button onClick={handleDialogClose}>
                    {isPublicUrl ? 'Close' : 'Back to Dashboard'}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}

export default DocumentSigningForm
