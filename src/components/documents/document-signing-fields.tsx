import { Loader } from 'lucide-react'
import { cn } from '../lib/ClsxConnct'

export const DocumentSigningFieldsLoader = () => {
  return (
    <div className='flex absolute inset-0 justify-center items-center rounded-md bg-background'>
      <Loader className='w-5 h-5 animate-spin text-primary md:h-8 md:w-8' />
    </div>
  )
}

export const DocumentSigningFieldsUninserted = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <p className='text-foreground group-hover:text-recipient-blue whitespace-pre-wrap text-[clamp(0.425rem,25cqw,0.825rem)] duration-200'>
      {children}
    </p>
  )
}

type DocumentSigningFieldsInsertedProps = {
  children: React.ReactNode

  /**
   * The text alignment of the field.
   *
   * Defaults to left.
   */
  textAlign?: 'left' | 'center' | 'right'
  color?: any
}

export const DocumentSigningFieldsInserted = ({
  children,
  textAlign = 'left',
  color,
}: DocumentSigningFieldsInsertedProps) => {
  return (
    <div className='flex overflow-hidden items-center w-full h-full'>
      <p
        className={cn(
          'text-foreground w-full whitespace-pre-wrap text-left text-[clamp(0.425rem,25cqw,0.825rem)] duration-200',
          {
            '!text-center': textAlign === 'center',
            '!text-right': textAlign === 'right',
          },
        )}
        style={color?.inlineStyles ? { color: color.inlineStyles.ringColor } : undefined}
      >
        {children}
      </p>
    </div>
  )
}
