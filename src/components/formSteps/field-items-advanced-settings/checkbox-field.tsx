import { useEffect, useState } from 'react'

import { ChevronDown, ChevronUp, Trash } from 'lucide-react'

// import { validateCheckboxField } from '@documenso/lib/advanced-fields-validation/validate-checkbox';
// import { type TCheckboxFieldMeta as CheckboxFieldMeta } from '@documenso/lib/types/field-meta';

import { checkboxValidationLength, checkboxValidationRules } from './constants'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export const CheckboxFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
  handleErrors,
}: any) => {
  const [showValidation, setShowValidation] = useState(false)
  const [values, setValues] = useState(
    fieldState.values ?? [{ id: 1, checked: false, value: '' }],
  )
  const [readOnly, setReadOnly] = useState(fieldState.readOnly ?? false)
  const [required, setRequired] = useState(fieldState.required ?? false)
  const [validationLength, setValidationLength] = useState(
    fieldState.validationLength ?? 0,
  )
  const [validationRule, setValidationRule] = useState(
    fieldState.validationRule ?? '',
  )
  const [direction, setDirection] = useState<'vertical' | 'horizontal'>(
    fieldState.direction ?? 'vertical',
  )

  const handleToggleChange = (field: keyof any, value: string | boolean) => {
    const readOnly =
      field === 'readOnly' ? Boolean(value) : Boolean(fieldState.readOnly)
    const required =
      field === 'required' ? Boolean(value) : Boolean(fieldState.required)
    const validationRule =
      field === 'validationRule'
        ? String(value)
        : String(fieldState.validationRule)
    const validationLength =
      field === 'validationLength'
        ? Number(value)
        : Number(fieldState.validationLength)
    const currentDirection =
      field === 'direction' && String(value) === 'horizontal'
        ? 'horizontal'
        : 'vertical'

    setReadOnly(readOnly)
    setRequired(required)
    setValidationRule(validationRule)
    setValidationLength(validationLength)
    setDirection(currentDirection)

    // const errors = validateCheckboxField(
    //   values.map((item) => item.value),
    //   {
    //     readOnly,
    //     required,
    //     validationRule,
    //     validationLength,
    //     direction: currentDirection,
    //     type: 'checkbox',
    //   },
    // );
    // handleErrors(errors);

    handleFieldChange(field, value)
  }

  const addValue = () => {
    const newId =
      values.length > 0 ? Math.max(...values.map((val) => val.id)) + 1 : 1
    setValues([...values, { id: newId, checked: false, value: '' }])
  }

  useEffect(() => {
    // const errors = validateCheckboxField(
    //   values.map((item) => item.value),
    //   {
    //     readOnly,
    //     required,
    //     validationRule,
    //     validationLength,
    //     direction: direction,
    //     type: 'checkbox',
    //   },
    // );
    // handleErrors(errors);
    handleFieldChange('values', values)
  }, [values])

  const removeValue = (index: number) => {
    if (values.length === 1) return

    const newValues = [...values]
    newValues.splice(index, 1)
    setValues(newValues)
    handleFieldChange('values', newValues)
  }

  const handleCheckboxValue = (
    index: number,
    property: 'value' | 'checked',
    newValue: string | boolean,
  ) => {
    const newValues = [...values]

    if (property === 'checked') {
      newValues[index].checked = Boolean(newValue)
    } else if (property === 'value') {
      newValues[index].value = String(newValue)
    }

    setValues(newValues)
    handleFieldChange('values', newValues)
  }

  useEffect(() => {
    setValues(fieldState.values ?? [{ id: 1, checked: false, value: '' }])
  }, [fieldState.values])

  return (
    <div className='flex flex-col gap-4'>
      <div className='mb-2'>
        <Label>Label</Label>
        <Input
          id='label'
          className='mt-2 bg-background'
          placeholder={`Field label`}
          value={fieldState.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
        />
      </div>

      <div className='mb-2'>
        <Label>Direction</Label>
        <Select
          value={fieldState.direction ?? 'vertical'}
          onValueChange={(val) => handleToggleChange('direction', val)}
        >
          <SelectTrigger className='mt-2 w-full text-muted-foreground bg-background'>
            <SelectValue placeholder={`Select direction`} />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value='vertical'>Vertical</SelectItem>
            <SelectItem value='horizontal'>Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-row gap-x-4 items-center'>
        <div className='flex flex-col w-2/3'>
          <Label>Validation</Label>
          <Select
            value={fieldState.validationRule}
            onValueChange={(val) => handleToggleChange('validationRule', val)}
          >
            <SelectTrigger className='mt-2 w-full text-muted-foreground bg-background'>
              <SelectValue placeholder={`Select at least`} />
            </SelectTrigger>
            <SelectContent position='popper'>
              {checkboxValidationRules.map((item, index) => (
                <SelectItem key={index} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col mt-3 w-1/3'>
          <Select
            value={
              fieldState.validationLength
                ? String(fieldState.validationLength)
                : ''
            }
            onValueChange={(val) => handleToggleChange('validationLength', val)}
          >
            <SelectTrigger className='mt-2 w-full text-muted-foreground bg-background'>
              <SelectValue placeholder={`Pick a number`} />
            </SelectTrigger>
            <SelectContent position='popper'>
              {checkboxValidationLength.map((item, index) => (
                <SelectItem key={index} value={String(item)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-row gap-2 items-center'>
          <Switch
            className='bg-background'
            checked={fieldState.required}
            onCheckedChange={(checked) =>
              handleToggleChange('required', checked)
            }
          />
          <Label>Required field</Label>
        </div>
        <div className='flex flex-row gap-2 items-center'>
          <Switch
            className='bg-background'
            checked={fieldState.readOnly}
            onCheckedChange={(checked) =>
              handleToggleChange('readOnly', checked)
            }
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
          <span className='flex items-center'>Checkbox values</span>
          {showValidation ? <ChevronUp /> : <ChevronDown />}
        </span>
      </Button>

      {showValidation && (
        <div>
          {values.map((value, index) => (
            <div key={index} className='flex gap-4 items-center mt-2'>
              <Checkbox
                className='data-[state=checked]:bg-primary border-foreground/30 h-5 w-5'
                checked={value.checked}
                onCheckedChange={(checked) =>
                  handleCheckboxValue(index, 'checked', checked)
                }
              />
              <Input
                className='w-1/2'
                value={value.value}
                onChange={(e) =>
                  handleCheckboxValue(index, 'value', e.target.value)
                }
              />
              <button
                type='button'
                className='inline-flex col-span-1 items-center mt-auto w-10 h-10 text-slate-500 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50'
                onClick={() => removeValue(index)}
              >
                <Trash className='w-5 h-5' />
              </button>
            </div>
          ))}
          <Button
            className='mt-4 ml-9 border bg-foreground/10 hover:bg-foreground/5 border-foreground/10'
            variant='outline'
            onClick={addValue}
          >
            Add another value
          </Button>
        </div>
      )}
    </div>
  )
}
