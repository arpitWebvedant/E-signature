import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Trash } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';



export const RadioFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
  handleErrors,
}: any) => {

  const [showValidation, setShowValidation] = useState(false);
  const [values, setValues] = useState(
    fieldState.values ?? [{ id: 1, checked: false, value: 'Default value' }],
  );
  const [readOnly, setReadOnly] = useState(fieldState.readOnly ?? false);
  const [required, setRequired] = useState(fieldState.required ?? false);

  const addValue = () => {
    const newId = values.length > 0 ? Math.max(...values.map((val) => val.id)) + 1 : 1;
    const newValue = { id: newId, checked: false, value: '' };
    const updatedValues = [...values, newValue];

    setValues(updatedValues);
    handleFieldChange('values', updatedValues);
  };

  const removeValue = (id: number) => {
    if (values.length === 1) return;

    const newValues = values.filter((val) => val.id !== id);
    setValues(newValues);
    handleFieldChange('values', newValues);
  };

  const handleCheckedChange = (checked: boolean, id: number) => {
    const newValues = values.map((val) => {
      if (val.id === id) {
        return { ...val, checked: Boolean(checked) };
      } else {
        return { ...val, checked: false };
      }
    });

    setValues(newValues);
    handleFieldChange('values', newValues);
  };

  const handleToggleChange = (field: any, value: any) => {
    const readOnly = field === 'readOnly' ? Boolean(value) : Boolean(fieldState.readOnly);
    const required = field === 'required' ? Boolean(value) : Boolean(fieldState.required);
    setReadOnly(readOnly);
    setRequired(required);

    // const errors = validateRadioField(String(value), { readOnly, required, values, type: 'radio' });
    // handleErrors(errors);

    handleFieldChange(field, value);
  };

  const handleInputChange = (value: string, id: number) => {
    const newValues = values.map((val) => {
      if (val.id === id) {
        return { ...val, value };
      }
      return val;
    });

    setValues(newValues);
    handleFieldChange('values', newValues);

    return newValues;
  };

  useEffect(() => {
    setValues(fieldState.values ?? [{ id: 1, checked: false, value: 'Default value' }]);
  }, [fieldState.values]);

  // useEffect(() => {
  //   const errors = validateRadioField(undefined, { readOnly, required, values, type: 'radio' });
  //   handleErrors(errors);
  // }, [values]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
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
            Radio values
          </span>
          {showValidation ? <ChevronUp /> : <ChevronDown />}
        </span>
      </Button>

      {showValidation && (
        <div>
          {values.map((value) => (
            <div key={value.id} className="flex gap-4 items-center mt-2">
              <Checkbox
                className="data-[state=checked]:bg-documenso border-foreground/30 data-[state=checked]:ring-primary dark:data-[state=checked]:ring-offset-background h-5 w-5 rounded-full data-[state=checked]:ring-1 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-white"
                checked={value.checked}
                onCheckedChange={(checked) => handleCheckedChange(Boolean(checked), value.id)}
              />
              <Input
                className="w-1/2"
                value={value.value}
                onChange={(e) => handleInputChange(e.target.value, value.id)}
              />
              <button
                type="button"
                className="inline-flex col-span-1 items-center mt-auto w-10 h-10 text-slate-500 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                onClick={() => removeValue(value.id)}
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
            Add another value
          </Button>
        </div>
      )}
    </div>
  );
};
