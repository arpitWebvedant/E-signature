
import { cn } from '../lib/ClsxConnct'

export type SignaturePadTypeProps = {
  className?: string
  value?: string
  onChange: (_value: string) => void
}

export const SignaturePadType = ({
  className,
  value,
  onChange,
}: SignaturePadTypeProps) => {
  // Colors don't actually work for text.


  return (
    <div
      className={cn(
        'flex justify-center items-center w-full h-full',
        className,
      )}
    >
      <input
        data-testid='signature-pad-type-input'
        placeholder='Type your signature'
        className='px-4 w-full text-7xl text-center text-black bg-transparent font-signature placeholder:text-4xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white'
       
        value={value}
        onChange={(event) => onChange(event.target.value.trimStart())}
      />

    </div>
  )
}
