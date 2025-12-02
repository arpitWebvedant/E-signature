import { useRequiredDocumentSigningContext } from '@/context/DocumentSigningProvider'
import { usePDFContext } from '@/context/PDFContext'
import { Loader, Minus, Plus, Settings } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { DocumentSigningFieldContainer } from './document-signing-field-container'
import { Field } from '../schema/types'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/context/GlobalContext'

type SignatureFieldState = 'empty' | 'signed-image' | 'signed-text'

export type DocumentSigningSignatureFieldProps = {
  field: Field
  originalField: Field
  onSignField?: (value) => Promise<void> | void
  onUnsignField?: (value) => Promise<void> | void
  typedSignatureEnabled?: boolean
  isDownloadMod?: boolean
  color?: any
}
interface SignatureData {
  id: number
  created: string
  recipientId: number
  fieldId: string | number
  signatureImageAsBase64: string | null
  typedSignature: string | null
  fontSize?: number
  imageScale?: number
  email: string
}

interface Field {
  id: string | number
  signature?: any[] | SignatureData
  recipients?: any[]
  recipientId?: number
  inserted?: boolean
}

export const DocumentSigningSignatureField = ({
  field,
  originalField,
  onSignField,
  onUnsignField,
  typedSignatureEnabled,
  isDownloadMod,
  color,
}: DocumentSigningSignatureFieldProps) => {
  const signatureRef = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(1.5)
  const [imageScale, setImageScale] = useState(1)
  const [showSizeControls, setShowSizeControls] = useState(false)
  const { updateStepData, getStepData } = usePDFContext()
  const stepTwoData = getStepData(2)
  const searchParams = useSearchParams()
  const { user } = useGlobalContext()
  const recipient = searchParams.get('recipient')
  const stepData = getStepData(3)
  const { signature } = field
  const { signature: providedSignature } = useRequiredDocumentSigningContext()
  const signerCustomSign = Array.isArray(originalField.signature)
    ? originalField.signature.find((ct) => ct.email === originalField?.signerEmail)
    : null

  let signatureImageAsBase64 = '';
  let typedSignature = '';
  if(originalField.signature && Array.isArray(originalField.signature)){
      for(const item of originalField.signature){
      if(item.email === originalField.signerEmail){
          signatureImageAsBase64 = item.signatureImageAsBase64 || '';
          typedSignature = item.typedSignature || '';
          break;
      }
      }
  }else{
      signatureImageAsBase64 = originalField.signature?.signatureImageAsBase64 || '';
      typedSignature = originalField.signature?.typedSignature || '';
  }
  const isLoading = false

  // const [showSignatureModal, setShowSignatureModal] = useState(false)
  // const [localSignature, setLocalSignature] = useState<string | null>(null)
  const state = useMemo<SignatureFieldState>(() => {
    if (!signatureImageAsBase64 && !typedSignature) {
      return 'empty'
    }

    if (signatureImageAsBase64) {
      return 'signed-image'
    }

    return 'signed-text'
  }, [signatureImageAsBase64, typedSignature])

  const onPreSign = () => {
    if (!providedSignature) {
      // setShowSignatureModal(true)
      return false
    }

    return true
  }

  const onSign = async (authOptions, signatureValue?: string) => {
    try {
      const userEmail = recipient || user?.data?.email
      const value = signatureValue || providedSignature

      if (!value) return

      const isTypedSignature = !value.startsWith('data:image')

      if (isTypedSignature && typedSignatureEnabled === false) return

      const signatureData = {
        id: Date.now(),
        created: new Date().toISOString(),
        recipientId: field.recipientId || 18,
        fieldId: field.id,
        signatureImageAsBase64: isTypedSignature ? null : value,
        typedSignature: isTypedSignature ? value : null,
        fontSize: isTypedSignature ? fontSize : undefined,
        imageScale: !isTypedSignature ? imageScale : undefined,
        email: userEmail,
      }
      const mapData = Array.isArray(originalField.signature)
        ? originalField.signature
        : field.recipients

      const updatedSignature =
        field.recipients?.length !== 1
          ? mapData.map((item: any) => {
              return item.email === userEmail
                ? { ...signatureData }
                : {
                    id: item.id || null,
                    created: item.created || null,
                    recipientId: item.recipientId || null,
                    fieldId: item.fieldId || null,
                    signatureImageAsBase64: item.signatureImageAsBase64 || null,
                    typedSignature: item.typedSignature || null,
                    fontSize: item.fontSize || undefined,
                    imageScale: item.imageScale || undefined,
                    email: item.email || '',
                  }
            })
          : { ...signatureData }

      const updatedField = {
        ...field,
        inserted: true,
        signature: updatedSignature,
      }

      // Update step 3 data
      if (stepData?.fields && Array.isArray(stepData.fields)) {
        const updatedFields = stepData.fields.map((f) =>
          f.id === field.id ? updatedField : f,
        )
        updateStepData(3, { fields: updatedFields }, true)
      }

      if (onSignField) await onSignField(value)
    } catch (err) {
      console.error(err)
    }
  }

  const onRemove = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      const signatureData = {
        id: Date.now(),
        created: new Date().toISOString(),
        recipientId: field.recipientId || 18,
        fieldId: field.id,
        signatureImageAsBase64: null,
        typedSignature: null,
        fontSize: undefined,
        imageScale: undefined,
        email: userEmail,
      }
      const mapData = Array.isArray(originalField.signature)
        ? originalField.signature
        : field.recipients

      const updatedSignature =
        field.recipients?.length !== 1
          ? mapData.map((item: any) => {
              return item.email === userEmail
                ? { ...signatureData }
                : {
                    id: item.id || null,
                    created: item.created || null,
                    recipientId: item.recipientId || null,
                    fieldId: item.fieldId || null,
                    signatureImageAsBase64: item.signatureImageAsBase64 || null,
                    typedSignature: item.typedSignature || null,
                    fontSize: item.fontSize || undefined,
                    imageScale: item.imageScale || undefined,
                    email: item.email || '',
                  }
            })
          : { ...signatureData }

      const updatedField = {
        ...field,
        inserted: false,
        signature: updatedSignature,
      }
      // Update step 3 data
      if (stepData?.fields && Array.isArray(stepData.fields)) {
        const updatedFields = stepData.fields.map((f) =>
          f.id === field.id ? updatedField : f,
        )
        updateStepData(3, { fields: updatedFields })
      }

      if (onUnsignField) {
        await onUnsignField(userEmail) // Pass email for which signature was removed
      }
    } catch (err) {
      console.error(err)
    }
  }

  const increaseFontSize = () => {
    const newSize = Math.min(4, fontSize + 0.2) // Limit max font size to 4rem
    setFontSize(newSize)
    updateSignatureSize(newSize, imageScale)
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(0.8, fontSize - 0.2) // Limit min font size to 0.8rem
    setFontSize(newSize)
    updateSignatureSize(newSize, imageScale)
  }

  const increaseImageScale = () => {
    const newScale = Math.min(2, imageScale + 0.1) // Limit max scale to 2x
    setImageScale(newScale)
    updateSignatureSize(fontSize, newScale)
  }

  const decreaseImageScale = () => {
    const newScale = Math.max(0.5, imageScale - 0.1) // Limit min scale to 0.5x
    setImageScale(newScale)
    updateSignatureSize(fontSize, newScale)
  }

  const updateSignatureSize = (newFontSize: number, newImageScale: number) => {
    if (state === 'signed-text' && signatureRef.current) {
      signatureRef.current.style.fontSize = `${newFontSize}rem`
    }

    if (state === 'signed-image' && imageRef.current) {
      imageRef.current.style.transform = `scale(${newImageScale})`
    }

    // Update the field data with new size values
    if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
      const updatedFields = stepData.fields.map((f) => {
        if (f.id === field.id && f.signature) {
          return {
            ...f,
            signature: {
              ...f.signature,
              fontSize:
                state === 'signed-text' ? newFontSize : f.signature.fontSize,
              imageScale:
                state === 'signed-image'
                  ? newImageScale
                  : f.signature.imageScale,
            },
          }
        }
        return f
      })

      updateStepData(3, { fields: updatedFields })
    }
  }

  useLayoutEffect(() => {
    // Initialize sizes from field data if available
    if (signature?.fontSize) {
      setFontSize(signature.fontSize)
    }
    if (signature?.imageScale) {
      setImageScale(signature.imageScale)
    }

    if (
      !signatureRef.current ||
      !containerRef.current ||
      !signature?.typedSignature
    ) {
      return
    }

    const adjustTextSize = () => {
      const container = containerRef.current
      const text = signatureRef.current

      if (!container || !text) {
        return
      }

      // Use saved fontSize or auto-adjust
      let size = signature?.fontSize || 2
      text.style.fontSize = `${size}rem`

      // Auto-adjust if no saved size
      if (!signature?.fontSize) {
        while (
          (text.scrollWidth > container.clientWidth ||
            text.scrollHeight > container.clientHeight) &&
          size > 0.8
        ) {
          size -= 0.1
          text.style.fontSize = `${size}rem`
        }
        setFontSize(size)
      }
    }

    const resizeObserver = new ResizeObserver(adjustTextSize)
    resizeObserver.observe(containerRef.current)

    adjustTextSize()

    return () => resizeObserver.disconnect()
  }, [signature?.typedSignature, signature?.fontSize])

  // Check if we should show signature or "Signature" text
  const shouldShowSignature = state !== 'empty'

  return (
    <DocumentSigningFieldContainer
      field={field}
      onPreSign={onPreSign}
      onSign={onSign}
      onRemove={onRemove}
      isDownloadMod={isDownloadMod}
      type='Signature'
      onSettingsToggle={() => setShowSizeControls(!showSizeControls)}
      showSettings={showSizeControls}
      color={color}
    >
      {isLoading && (
        <div className='flex absolute inset-0 justify-center items-center rounded-md bg-background'>
          <Loader className='w-5 h-5 animate-spin text-primary md:h-8 md:w-8' />
        </div>
      )}

      {showSizeControls && shouldShowSignature && (
        <div className='absolute top-0 -right-1 z-[99999] p-2 bg-background  rounded-md border border-gray-200 shadow-lg transform translate-x-full'>
          <div className='flex flex-col space-y-2'>
            <span className='text-xs font-medium text-center'>Adjust Size</span>
            <div className='flex items-center space-x-2'>
              <Button
                type='button'
                onClick={
                  state === 'signed-text'
                    ? decreaseFontSize
                    : decreaseImageScale
                }
                className='p-1 rounded-md bg-primary'
                title='Decrease size'
              >
                <Minus className='w-3 h-3' />
              </Button>

              <span className='w-12 text-xs text-center'>
                {state === 'signed-text'
                  ? `${fontSize.toFixed(1)}rem`
                  : `${(imageScale * 100).toFixed(0)}%`}
              </span>

              <Button
                type='button'
                onClick={
                  state === 'signed-text'
                    ? increaseFontSize
                    : increaseImageScale
                }
                className='p-1 rounded-md bg-primary'
                title='Increase size'
              >
                <Plus className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {!shouldShowSignature && (
        <p className='font-signature text-muted-foreground group-hover:text-recipient-blue text-[clamp(0.575rem,25cqw,1.2rem)] text-xl duration-200'>
          Signature
        </p>
      )}
      {state === 'signed-image' && (
        <div className='flex overflow-hidden justify-center items-center w-full h-full'>
          <Image
            ref={imageRef as any} // Next/Image doesn’t fully support ref directly on the img, cast if needed
            src={signatureImageAsBase64}
            alt='Signature'
            className='object-contain transition-transform duration-200'
            style={{ transform: `scale(${imageScale})` }}
            unoptimized
            width={500} // adjust based on container or desired size
            height={200} // adjust based on container or desired size
          />
        </div>
      )}

      {state === 'signed-text' && (
        <div
          ref={containerRef}
          className='flex overflow-hidden justify-center items-center p-2 w-full h-full'
        >
          <p
            ref={signatureRef}
            className='overflow-hidden w-full leading-tight text-center break-all duration-200 font-signature text-muted-foreground'
            // style={{ fontSize: `${fontSize}rem` }}
            style={
              color?.inlineStyles
                ? { fontSize: `${fontSize}rem`, color: color.inlineStyles.ringColor }
                : { fontSize: `${fontSize}rem` }
            }

          >
            {typedSignature}
          </p>
        </div>
      )}

      {shouldShowSignature && !isDownloadMod && (
        <button
          type='button'
          className='absolute top-0 right-0 -mr-6 z-[99999] p-1 rounded-md shadow-sm transition-colors bg-primary text-white'
          onClick={() => setShowSizeControls(!showSizeControls)}
          title='Adjust signature size'
        >
          <Settings className='w-3 h-3' />
        </button>
      )}
    </DocumentSigningFieldContainer>
  )
}
