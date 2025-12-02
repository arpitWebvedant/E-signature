import { KeyboardIcon, SignatureIcon, UploadCloudIcon } from 'lucide-react'
import { HTMLAttributes, useState } from 'react'
import { match } from 'ts-pattern'
import { cn } from '../lib/ClsxConnct'
import { DocumentSignatureType } from '../lib/constants/document'
import { isBase64Image } from '../lib/constants/signatures'
import { SignaturePadDraw } from '../ui/signature-pad-draw'
import { SignaturePadType } from '../ui/signature-pad-type'
import { SignaturePadUpload } from '../ui/signature-pad-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/signature-tabs'

export type SignaturePadValue = {
  type: DocumentSignatureType
  value: string
}

export type SignaturePadProps = Omit<
  HTMLAttributes<HTMLCanvasElement>,
  'onChange'
> & {
  value?: string
  onChange?: (_value: SignaturePadValue) => void

  disabled?: boolean

  typedSignatureEnabled?: boolean
  uploadSignatureEnabled?: boolean
  drawSignatureEnabled?: boolean

  onValidityChange?: (isValid: boolean) => void
}

export const SignaturePad = ({
  value = '',
  onChange,
  disabled = false,
  typedSignatureEnabled = true,
  uploadSignatureEnabled = true,
  drawSignatureEnabled = true,
  recipientColor = '#000000',
}: SignaturePadProps) => {
  const [imageSignature, setImageSignature] = useState(
    isBase64Image(value) ? value : '',
  )
  const [drawSignature, setDrawSignature] = useState(
    isBase64Image(value) ? value : '',
  )
  const [typedSignature, setTypedSignature] = useState(
    isBase64Image(value) ? '' : value,
  )

  /**
   * This is cooked.
   *
   * Get the first enabled tab that has a signature if possible, otherwise just get
   * the first enabled tab.
   */
  const [tab, setTab] = useState(
    ((): 'draw' | 'text' | 'image' => {
      // First passthrough to check to see if there's a signature for a given tab.
      if (drawSignatureEnabled && drawSignature) {
        return 'draw'
      }

      if (typedSignatureEnabled && typedSignature) {
        return 'text'
      }

      if (uploadSignatureEnabled && imageSignature) {
        return 'image'
      }

      // Second passthrough to just select the first avaliable tab.
      if (drawSignatureEnabled) {
        return 'draw'
      }

      if (typedSignatureEnabled) {
        return 'text'
      }

      if (uploadSignatureEnabled) {
        return 'image'
      }      

      if (
        !drawSignatureEnabled &&
        !typedSignatureEnabled &&
        !uploadSignatureEnabled
      ) {
        drawSignatureEnabled = true;
        return 'draw' // Default to 'draw' if none are enabled
      } 

      throw new Error('No signature enabled 1')
    })(),
  )

  const onImageSignatureChange = (value: string) => {
    setImageSignature(value)

    onChange?.({
      type: DocumentSignatureType.UPLOAD,
      value,
    })
  }

  const onDrawSignatureChange = (value: string) => {
    setDrawSignature(value)

    onChange?.({
      type: DocumentSignatureType.DRAW,
      value,
    })
  }

  const onTypedSignatureChange = (value: string) => {
    setTypedSignature(value)

    onChange?.({
      type: DocumentSignatureType.TYPE,
      value,
    })
  }

  const onTabChange = (value: 'draw' | 'text' | 'image') => {
    if (disabled) {
      return
    }

    setTab(value)

    match(value)
      .with('draw', () => {
        onDrawSignatureChange(drawSignature)
      })
      .with('text', () => {
        onTypedSignatureChange(typedSignature)
      })
      .with('image', () => {
        onImageSignatureChange(imageSignature)
      })
      .exhaustive()
  }

  if (
    !drawSignatureEnabled &&
    !typedSignatureEnabled &&
    !uploadSignatureEnabled
  ) {
    return null
  }

  return (
    <Tabs
      defaultValue={tab}
      className={cn({
        'pointer-events-none': disabled,
      })}
      onValueChange={(value) => onTabChange(value as 'draw' | 'text' | 'image')}
    >
      <TabsList>
        {drawSignatureEnabled && (
          <TabsTrigger value='draw'>
            <SignatureIcon className='mr-2 size-4' />
            Draw
          </TabsTrigger>
        )}

        {typedSignatureEnabled && (
          <TabsTrigger value='text'>
            <KeyboardIcon className='mr-2 size-4' />
            Type
          </TabsTrigger>
        )}

        {uploadSignatureEnabled && (
          <TabsTrigger value='image'>
            <UploadCloudIcon className='mr-2 size-4' />
            Upload
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent
        value='draw'
        className='flex relative justify-center items-center text-center rounded-md border border-border aspect-signature-pad dark:bg-background bg-neutral-50'
      >
        <SignaturePadDraw
          className='w-full h-full'
          onChange={onDrawSignatureChange}
          value={drawSignature}
          recipientColor={recipientColor}
        />
      </TabsContent>

      <TabsContent
        value='text'
        className='flex relative justify-center items-center text-center rounded-md border border-border aspect-signature-pad dark:bg-background bg-neutral-50'
      >
        <SignaturePadType
          value={typedSignature}
          onChange={onTypedSignatureChange}
        />
      </TabsContent>

      <TabsContent
        value='image'
        className={cn(
          'relative rounded-md border border-border aspect-signature-pad dark:bg-background bg-neutral-50',
          {
            'bg-white': imageSignature,
          },
        )}
      >
        <SignaturePadUpload
          value={imageSignature}
          onChange={onImageSignatureChange}
        />
      </TabsContent>
    </Tabs>
  )
}
