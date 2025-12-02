import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Trash } from 'lucide-react';
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


export const DropdownFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
  handleErrors,
}: any) => {

  const [showValidation, setShowValidation] = useState(false);
  const [values, setValues] = useState(fieldState.values ?? [{ value: 'Option 1' }]);
  const [readOnly, setReadOnly] = useState(fieldState.readOnly ?? false);
  const [required, setRequired] = useState(fieldState.required ?? false);
  const [defaultValue, setDefaultValue] = useState(fieldState.defaultValue ?? 'Option 1');

  const addValue = () => {
    setValues([...values, { value: 'New option' }]);
    handleFieldChange('values', [...values, { value: 'New option' }]);
  };

  const removeValue = (index: number) => {
    if (values.length === 1) return;

    const newValues = [...values];
    newValues.splice(index, 1);
    setValues(newValues);
    handleFieldChange('values', newValues);
  };

  const handleToggleChange = (field: keyof any, value: string | boolean) => {
    const readOnly = field === 'readOnly' ? Boolean(value) : Boolean(fieldState.readOnly);
    const required = field === 'required' ? Boolean(value) : Boolean(fieldState.required);
    setReadOnly(readOnly);
    setRequired(required);

    // const errors = validateDropdownField(undefined, {
    //   readOnly,
    //   required,
    //   values,
    //   type: 'dropdown',
    // });
    // handleErrors(errors);

    handleFieldChange(field, value);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedValues = [...values];
    updatedValues[index].value = newValue;
    setValues(updatedValues);
    handleFieldChange('values', updatedValues);
  };

  // useEffect(() => {
  //   const errors = validateDropdownField(undefined, {
  //     readOnly,
  //     required,
  //     values,
  //     type: 'dropdown',
  //   });
  //   handleErrors(errors);
  // }, [values]);

  useEffect(() => {
    setValues(fieldState.values ?? [{ value: 'Option 1' }]);
  }, [fieldState.values]);

  useEffect(() => {
    setDefaultValue(fieldState.defaultValue ?? 'Option 1');
  }, [fieldState.defaultValue]);

  return (
    <div className="flex flex-col gap-4 text-dark">
        <div>
                <Label>
                  Label
                </Label>
                <Input
                  id="label"
                  className="mt-2 bg-background"
                  placeholder="Field label"
                  value={fieldState.label}
                  onChange={(e) => handleFieldChange('label', e.target.value)}
                />
              </div>
      <div>
        <Label>
          Select default option
        </Label>
        <Select
          value={defaultValue}
          onValueChange={(val) => {
            if (!val) {
              return;
            }

            setDefaultValue(val);
            handleFieldChange('defaultValue', val);
          }}
        >
          <SelectTrigger className="mt-2 w-full text-muted-foreground bg-background">
            <SelectValue defaultValue={defaultValue} placeholder={`-- Select --`} />
          </SelectTrigger>
          <SelectContent position="popper">
            {values.map((item, index) => (
              <SelectItem
                key={index}
                value={item.value && item.value.length > 0 ? item.value.toString() : String(index)}
              >
                {item.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 items-center">
          <Switch
            className="bg-background"
            checked={fieldState.required}
            onCheckedChange={(checked) => handleToggleChange('required', checked)}
          />
          <Label>
            Required field
          </Label>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Switch
            className="bg-background"
            checked={fieldState.readOnly}
            onCheckedChange={(checked) => handleToggleChange('readOnly', checked)}
          />
          <Label>
            Read only
          </Label>
        </div>
      </div>
      <Button
        className="mt-2 border bg-foreground/10 hover:bg-foreground/5 border-foreground/10"
        variant="outline"
        onClick={() => setShowValidation((prev) => !prev)}
      >
        <span className="flex flex-row justify-between w-full">
          <span className="flex items-center">
            Dropdown options
          </span>
          {showValidation ? <ChevronUp /> : <ChevronDown />}
        </span>
      </Button>

      {showValidation && (
        <div>
          {values.map((value, index) => (
            <div key={index} className="flex gap-4 items-center mt-2">
              <Input
                className="w-1/2"
                value={value.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
              />
              <button
                type="button"
                className="inline-flex col-span-1 items-center mt-auto w-10 h-10 text-slate-500 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => removeValue(index)}
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
          <Button
            className="mt-4 ml-9 border bg-foreground/10 hover:bg-foreground/5 border-foreground/10"
            variant="outline"
            onClick={addValue}
          >
            Add another option
          </Button>
        </div>
      )}
    </div>
  );
};
