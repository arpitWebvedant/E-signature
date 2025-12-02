'use client'

import * as React from 'react'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import RejectForm from '@/components/ui/reject-form'
import { useRejectDocument } from '@/services/hooks/documents/useRejectDocument'
import { useFetchDocument } from '@/services/hooks/documents/useFetchDocument'
import { toast } from '@/components/ui/use-toast'
import { jwtDecode } from 'jwt-decode'
import { useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import UnauthorizedDialogUi from '@/components/common/UnauthorizedDialogUi'

interface TokenPayload {
  recipientEmail: string
  recipientName: string
  iat: number
  exp: number
}
export default function RejectDocumentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()

  const documentId = params.id as string
  const folderId = params.folderId as string
  const recipient = searchParams.get('recipient')
  const checkId = searchParams.get('checkId')
  const token = searchParams.get('token') 
  const isClose = searchParams.get('isClose')
  const [unauthorizedState, setUnauthorizedState] = React.useState<{
    isOpen: boolean
    reason: 'access_denied' | 'already_signed' | 'already_rejected' | 'token_invalid'
    rejectData : any
  }>({
    isOpen: false,
    reason: 'access_denied',
    rejectData : null
  })
  const [open, setOpen] = React.useState(true)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false)
  const [lastRejectDetails, setLastRejectDetails] = React.useState<{
    subject: string
    reason: string
    category: string
  } | null>(null)
  // Decode token and extract user details

  const { mutateAsync, isPending } = useRejectDocument() as any

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
          reason: 'token_invalid',
        })
        return null
      }

      return {
        email: decoded?.recipientEmail,
        name: decoded?.recipientName,
        token: token,
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      setUnauthorizedState({
        isOpen: true,
        reason: 'token_invalid',
      })
      return null
    }
  }, [token])
  const currentUserData = useMemo(() => {
    if (tokenData) {
      return {
        id: checkId || null,
        email: tokenData?.email,
        name: tokenData?.name,
      }
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      id: userData?.id,
      email: recipient || userData?.email,
      name: userData?.name,
    }
  }, [tokenData, checkId, recipient])

  const userId = currentUserData?.id
  const userEmail = currentUserData?.email
  const userName = currentUserData?.name

  // Add document fetch hook
  const { data: documentData, isLoading: isDocumentLoading } = useFetchDocument(
    documentId,
    userId,
    folderId,
    tokenData?.token
  )

  // Add effect to check if document is already rejected
  useEffect(() => {
    debugger
    if (!documentData?.data || !userEmail) return

    const data = documentData.data
    const recipientData = data?.recipients?.find(
      (recipient: any) => recipient?.email === userEmail
    )

    // Check if recipient is authorized
    if (!recipientData) {
      setUnauthorizedState({
        isOpen: true,
        reason: 'access_denied'
      })
      return
    }

    // Check if already rejected
    if (recipientData?.signingStatus === 'REJECTED') {
      setUnauthorizedState({
        isOpen: true,
        reason: 'already_rejected',
        rejectData : data?.documentSignData?.rejection
      })
      return
    }

    // Check if already signed 
    if (recipientData?.signingStatus === 'SIGNED') {
      setUnauthorizedState({
        isOpen: true,
        reason: 'already_signed'
      })
      return
    }
  }, [documentData, userEmail])

  const handleSubmit = async ({
    reason,
    subject,
    category,
    notifySender,
  }: {
    reason: string
    subject: string
    category: string
    notifySender: boolean
  }) => {
    try {
      const payload = {
        documentId,
        userId,
        email: userEmail,
        reason,
        subject,
        category,
        notifySender,
      }
      await mutateAsync(payload)
      setLastRejectDetails({ subject, reason, category })
      toast({
        title: 'Document rejected',
        description: 'The sender will be notified.',
      })
      // Close reject form dialog and show success popup
      setOpen(false)
      setIsSuccessDialogOpen(true)
    } catch (e: any) {
      toast({
        title: 'Failed to reject',
        description: e?.message || 'Please try again.',
        variant: 'destructive' as any,
      })
    }
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      const signUrl = `/sign_document/${documentId}/sign?checkId=${checkId}&action=sign&token=${encodeURIComponent(token || '')}&recipient=${encodeURIComponent(recipient || '')}`;
      router.push(signUrl)
    }
  }

  // Add handler for unauthorized dialog close
  const handleUnauthorizedClose = () => {
    setUnauthorizedState({ ...unauthorizedState, isOpen: false })
    router.push('/dashboard')
  }

  return (
    <div className='p-4'>
      {/* Show loading state while fetching document */}
      {isDocumentLoading && (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='text-center'>
            <div className='mx-auto mb-4 w-8 h-8 rounded-full border-4 animate-spin border-primary border-t-transparent'></div>
            <p className='text-sm text-muted-foreground'>Checking document status...</p>
          </div>
        </div>
      )}

      {/* Show reject form only if document is loaded and not already rejected/signed */}
      {!isDocumentLoading && !unauthorizedState.isOpen && (
        <RejectForm
          open={open}
          onOpenChange={handleOpenChange}
          isClose={() => console.log('close')}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          title='Reject document'
          description='Please provide a reason for rejecting this document.'
        />
      )}

      {/* Unauthorized Dialog */}
      {unauthorizedState.isOpen && (
        <UnauthorizedDialogUi
          isOpen={unauthorizedState.isOpen}
          onClose={handleUnauthorizedClose}
          reason={unauthorizedState.reason}
          rejectData={unauthorizedState.rejectData}
          isLoading={false}
        />
      )}

      {/* Success dialog after rejection */}
      <Dialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Document rejected</DialogTitle>
            <DialogDescription>
              The document has been successfully rejected and the sender has
              been notified.
            </DialogDescription>
          </DialogHeader>
          {lastRejectDetails && (
            <div className='mt-4 space-y-2 text-sm text-gray-700'>
              <div>
                <span className='font-medium text-gray-800'>Subject: </span>
                <span className='text-gray-700'>{lastRejectDetails.subject}</span>
              </div>
              <div>
                <span className='font-medium text-gray-800'>Category: </span>
                <span className='text-gray-700'>
                  {lastRejectDetails.category === 'WRONG_RECIPIENT'
                    ? 'Wrong recipient'
                    : lastRejectDetails.category === 'WRONG_VERSION'
                    ? 'Wrong version'
                    : lastRejectDetails.category === 'MISSING_INFO'
                    ? 'Missing information'
                    : lastRejectDetails.category === 'OTHER'
                    ? 'Other'
                    : lastRejectDetails.category}
                </span>
              </div>
              <div>
                <span className='font-medium text-gray-800'>Reason: </span>
                <span className='text-gray-700'>{lastRejectDetails.reason}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
