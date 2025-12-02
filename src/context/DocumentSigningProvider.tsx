import { createContext, useContext, useEffect, useState } from 'react'
import { useGlobalContext } from './GlobalContext'

export type DocumentSigningContextValue = {
  fullName: string
  setFullName: (_value: string) => void
  email: string
  setEmail: (_value: string) => void
  signature: string | null
  setSignature: (_value: string | null) => void
}

const DocumentSigningContext =
  createContext<DocumentSigningContextValue | null>(null)

export const useDocumentSigningContext = () => {
  return useContext(DocumentSigningContext)
}

export const useRequiredDocumentSigningContext = () => {
  const context = useDocumentSigningContext()

  if (!context) {
    throw new Error('Signing context is required')
  }

  return context
}

export interface DocumentSigningProviderProps {
  fullName?: string | null
  email?: string | null
  signature?: string | null
  children: React.ReactNode
}

export const DocumentSigningProvider = ({
  fullName: initialFullName,
  email: initialEmail,
  signature: initialSignature,
  children,
}: DocumentSigningProviderProps) => {
  const { user } = useGlobalContext()

  const [fullName, setFullName] = useState(
    initialFullName || user?.data?.user?.fullName || ''
  )
  const [email, setEmail] = useState(
    initialEmail || user?.data?.user?.email || ''
  )
  const [signature, setSignature] = useState<string | null>(
    initialSignature ?? user?.data?.user?.signature ?? null
  )
useEffect(() => {
  if (!user) return
  setFullName(user?.data?.user?.fullName || '')
  setEmail(user?.data?.user?.email || '')
  setSignature(user?.data?.user?.signature || null)
}, [user])
  return (
    <DocumentSigningContext.Provider
      value={{
        fullName,
        setFullName,
        email,
        setEmail,
        signature,
        setSignature,
      }}
    >
      {children}
    </DocumentSigningContext.Provider>
  )
}

DocumentSigningProvider.displayName = 'DocumentSigningProvider'
