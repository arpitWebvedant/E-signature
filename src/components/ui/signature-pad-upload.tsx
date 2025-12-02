import { removeBackground } from '@imgly/background-removal'
import { motion } from 'framer-motion'
import { Loader2, UploadCloudIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useUnsafeEffectOnce } from '../lib/client-only/hooks/use-effect-once'
import { cn } from '../lib/ClsxConnct'
import { SIGNATURE_CANVAS_DPI } from '../lib/constants/signatures'

const loadImage = async (file: File | undefined): Promise<HTMLImageElement> => {
  if (!file) throw new Error('No file selected')
  if (!file.type.startsWith('image/')) throw new Error('Invalid file type')
  if (file.size > 5 * 1024 * 1024)
    throw new Error('Image size should be less than 5MB')

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

const loadImageOntoCanvas = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): ImageData => {
  const scale = Math.min(
    (canvas.width * 0.8) / image.width,
    (canvas.height * 0.8) / image.height,
  )

  const x = (canvas.width - image.width * scale) / 2
  const y = (canvas.height - image.height * scale) / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(image, x, y, image.width * scale, image.height * scale)
  ctx.restore()

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export type SignaturePadUploadProps = {
  className?: string
  value: string
  onChange: (_signatureDataUrl: string) => void
}

export const SignaturePadUpload = ({
  className,
  value,
  onChange,
  ...props
}: SignaturePadUploadProps) => {
  const $el = useRef<HTMLCanvasElement>(null)
  const $imageData = useRef<ImageData | null>(null)
  const $fileInput = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setLoading(true) // show loading

      // remove background (this returns Blob)
      const blob = await removeBackground(file)

      // convert Blob -> Object URL -> HTMLImageElement
      const img = await loadImage(
        new File([blob], file.name, { type: 'image/png' }),
      )

      if (!$el.current) return
      const ctx = $el.current.getContext('2d')
      if (!ctx) return

      $imageData.current = loadImageOntoCanvas(img, $el.current, ctx)

      // store final PNG with transparent background
      onChange?.($el.current.toDataURL('image/png'))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false) // hide loading
    }
  }

  useUnsafeEffectOnce(() => {
    if ($el.current) {
      $el.current.width = $el.current.clientWidth * SIGNATURE_CANVAS_DPI
      $el.current.height = $el.current.clientHeight * SIGNATURE_CANVAS_DPI
    }

    if ($el.current && value) {
      const ctx = $el.current.getContext('2d')
      const { width, height } = $el.current

      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(
          img,
          0,
          0,
          Math.min(width, img.width),
          Math.min(height, img.height),
        )
        $imageData.current = ctx?.getImageData(0, 0, width, height) || null
      }
      img.src = value
    }
  })

  return (
    <div className={cn('relative w-full h-full', className)}>
      <canvas
        data-testid='signature-pad-upload'
        ref={$el}
        className='w-full h-full dark:hue-rotate-180 dark:invert'
        style={{ touchAction: 'none' }}
        {...props}
      />

      <input
        ref={$fileInput}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleImageUpload}
      />

      <motion.button
        className='flex absolute inset-0 justify-center items-center w-full h-full'
        onClick={() => $fileInput.current?.click()}
      >
        {!value && !loading && (
          <motion.div>
            <div className='flex flex-col justify-center items-center text-muted-foreground'>
              <div className='flex flex-col items-center'>
                <UploadCloudIcon className='w-8 h-8' />
                <span className='text-lg font-semibold'>Upload Signature</span>
              </div>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className='flex absolute inset-0 flex-col justify-center items-center text-white rounded-lg bg-black/40'>
            <Loader2 className='w-10 h-10 animate-spin' />
            <span className='mt-2'>Removing background...</span>
          </div>
        )}
      </motion.button>
    </div>
  )
}
