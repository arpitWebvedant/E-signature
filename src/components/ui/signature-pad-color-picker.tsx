import { cn } from '../lib/ClsxConnct'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export type SignaturePadColorPickerProps = {
  selectedColor: string
  setSelectedColor: (color: string) => void
  className?: string
}

export const SignaturePadColorPicker = ({
  selectedColor,
  setSelectedColor,
  className,
}: SignaturePadColorPickerProps) => {
  return (
    <div
      className={cn('absolute top-2 right-2 filter text-foreground', className)}
    >
      <Select
        defaultValue={selectedColor}
        onValueChange={(value) => setSelectedColor(value)}
      >
        <SelectTrigger className='h-auto w-auto border-none p-0.5'>
          <SelectValue placeholder='' />
        </SelectTrigger>

        <SelectContent className='w-[100px]' align='end'>
          <SelectItem value='black'>
            <div className='text-muted-foreground flex items-center text-[0.688rem]'>
              <div className='mr-1 w-4 h-4 bg-black rounded-full border-2 shadow-sm border-border' />
              Black
            </div>
          </SelectItem>

          <SelectItem value='red'>
            <div className='text-muted-foreground flex items-center text-[0.688rem]'>
              <div className='border-border mr-1 h-4 w-4 rounded-full border-2 bg-[red] shadow-sm' />
              Red
            </div>
          </SelectItem>

          <SelectItem value='blue'>
            <div className='text-muted-foreground flex items-center text-[0.688rem]'>
              <div className='border-border mr-1 h-4 w-4 rounded-full border-2 bg-[blue] shadow-sm' />
              Blue
            </div>
          </SelectItem>

          <SelectItem value='green'>
            <div className='text-muted-foreground flex items-center text-[0.688rem]'>
              <div className='border-border mr-1 h-4 w-4 rounded-full border-2 bg-[green] shadow-sm' />
              Green
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
