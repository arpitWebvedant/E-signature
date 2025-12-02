import { useState } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { numberFormatValues } from './constants'

export const NumberFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
  handleErrors,
}: any) => {
  const [showValidation, setShowValidation] = useState(false)

  const handleInput = (field: any, value: string | boolean) => {
    const userValue = field === 'value' ? value : fieldState.value ?? 0
    const userMinValue =
      field === 'minValue' ? Number(value) : Number(fieldState.minValue ?? 0)
    const userMaxValue =
      field === 'maxValue' ? Number(value) : Number(fieldState.maxValue ?? 0)
    const readOnly =
      field === 'readOnly' ? Boolean(value) : Boolean(fieldState.readOnly)
    const required =
      field === 'required' ? Boolean(value) : Boolean(fieldState.required)
    const numberFormat =
      field === 'numberFormat' ? String(value) : fieldState.numberFormat ?? ''
    const fontSize =
      field === 'fontSize' ? Number(value) : Number(fieldState.fontSize ?? 14)
    const characterLimit =
      field === 'characterLimit' ? Number(value) : Number(fieldState.characterLimit ?? 0)

    // const valueErrors = validateNumberField(String(userValue), {
    //   minValue: userMinValue,
    //   maxValue: userMaxValue,
    //   readOnly,
    //   required,
    //   numberFormat,
    //   fontSize,
    //   type: 'number',
    // });
    // handleErrors(valueErrors);

    handleFieldChange(field, value)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <Label>Label</Label>
        <Input
          id='label'
          className='mt-2 bg-background'
          placeholder={`Label`}
          value={fieldState.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
        />
      </div>
      <div>
        <Label className='mt-4'>Placeholder</Label>
        <Input
          id='placeholder'
          className='mt-2 bg-background'
          placeholder={`Placeholder`}
          value={fieldState.placeholder}
          onChange={(e) => handleFieldChange('placeholder', e.target.value)}
        />
      </div>
      <div>
        <Label>Character Limit</Label>
        <Input
          id='characterLimit'
          type='number'
          min={0}
          className='mt-2 bg-background'
          placeholder='Field character limit'
          value={fieldState.characterLimit}
          onChange={(e) => handleInput('characterLimit', e.target.value)}
        />
      </div>
      <div>
        <Label className='mt-4'>Value</Label>
        <Input
          id='value'
          className='mt-2 bg-background'
          placeholder={`Value`}
          value={fieldState.value}
          onChange={(e) => handleInput('value', e.target.value)}
        />
      </div>
      <div>
        <Label>Number format</Label>
        <Select
          value={fieldState.numberFormat}
          onValueChange={(val) => handleInput('numberFormat', val)}
        >
          <SelectTrigger className='mt-2 w-full text-muted-foreground bg-background'>
            <SelectValue placeholder={`Field format`} />
          </SelectTrigger>
          <SelectContent position='popper'>
            {numberFormatValues.map((item, index) => (
              <SelectItem key={index} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Font Size</Label>
        <Input
          id='fontSize'
          type='number'
          className='mt-2 bg-background'
          placeholder={`Field font size`}
          value={fieldState.fontSize}
          onChange={(e) => handleInput('fontSize', e.target.value)}
          min={8}
          max={96}
        />
      </div>

      <div>
        <Label>Text Align</Label>

        <Select
          value={fieldState.textAlign}
          onValueChange={(value) => handleInput('textAlign', value)}
        >
          <SelectTrigger className='mt-2 bg-background'>
            <SelectValue placeholder='Select text align' />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value='left'>Left</SelectItem>
            <SelectItem value='center'>Center</SelectItem>
            <SelectItem value='right'>Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-col gap-4 mt-2'>
        <div className='flex flex-row gap-2 items-center'>
          <Switch
            className='bg-background'
            checked={fieldState.required}
            onCheckedChange={(checked) => handleInput('required', checked)}
          />
          <Label>Required field</Label>
        </div>
        <div className='flex flex-row gap-2 items-center'>
          <Switch
            className='bg-background'
            checked={fieldState.readOnly}
            onCheckedChange={(checked) => handleInput('readOnly', checked)}
          />
          <Label>Read only</Label>
        </div>
      </div>
      <Button
        className='mt-2 border bg-foreground/10 hover:bg-foreground/5 border-foreground/10'
        variant='outline'
        onClick={() => setShowValidation((prev) => !prev)}
      >
        <span className='flex flex-row justify-between w-full'>
          <span className='flex items-center'>Validation</span>
          {showValidation ? <ChevronUp /> : <ChevronDown />}
        </span>
      </Button>
      {showValidation && (
        <div className='flex flex-row gap-x-4 mb-4'>
          <div className='flex flex-col'>
            <Label className='mt-4'>Min</Label>
            <Input
              id='minValue'
              className='mt-2 bg-background'
              placeholder='E.g. 0'
              value={fieldState.minValue}
              onChange={(e) => handleInput('minValue', e.target.value)}
            />
          </div>
          <div className='flex flex-col'>
            <Label className='mt-4'>Max</Label>
            <Input
              id='maxValue'
              className='mt-2 bg-background'
              placeholder='E.g. 100'
              value={fieldState.maxValue}
              onChange={(e) => handleInput('maxValue', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
