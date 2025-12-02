

// import { validateTextField } from '@documenso/lib/advanced-fields-validation/validate-text';
// import { type TTextFieldMeta as TextFieldMeta } from '@documenso/lib/types/field-meta';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';



export const TextFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
  handleErrors,
}: any) => {

  const handleInput = (field: any, value: any) => {
    const text = field === 'text' ? String(value) : (fieldState.text ?? '');
    const limit =
      field === 'characterLimit' ? Number(value) : Number(fieldState.characterLimit ?? 0);
    const fontSize = field === 'fontSize' ? Number(value) : Number(fieldState.fontSize ?? 14);
    const readOnly = field === 'readOnly' ? Boolean(value) : Boolean(fieldState.readOnly);
    const required = field === 'required' ? Boolean(value) : Boolean(fieldState.required);

    // const textErrors = validateTextField(text, {
    //   characterLimit: Number(limit),
    //   readOnly,
    //   required,
    //   fontSize,
    //   type: 'text',
    // });

    // handleErrors(textErrors);
    handleFieldChange(field, value);
  };

  return (
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
      <div>
        <Label className="mt-4">
          Placeholder
        </Label>
        <Input
          id="placeholder"
          className="mt-2 bg-background"
          placeholder="Field placeholder"
          value={fieldState.placeholder}
          onChange={(e) => handleFieldChange('placeholder', e.target.value)}
        />
      </div>

      <div>
        <Label className="mt-4">
          Add text
        </Label>
        <Textarea
          id="text"
          className="mt-2 bg-background"
          placeholder="Add text to the field"
          value={fieldState.text}
          onChange={(e) => handleInput('text', e.target.value)}
        />
      </div>

      <div>
        <Label>
          Character Limit
        </Label>
        <Input
          id="characterLimit"
          type="number"
          min={0}
          className="mt-2 bg-background"
          placeholder="Field character limit"
          value={fieldState.characterLimit}
          onChange={(e) => handleInput('characterLimit', e.target.value)}
        />
      </div>

      <div>
        <Label>
          Font Size
        </Label>
        <Input
          id="fontSize"
          type="number"
          className="mt-2 bg-background"
          placeholder="Field font size"
          value={fieldState.fontSize}
          onChange={(e) => handleInput('fontSize', e.target.value)}
          min={8}
          max={96}
        />
      </div>

      <div>
        <Label>
            Text Align
        </Label>

        <Select
          value={fieldState.textAlign}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            handleInput('textAlign', value);
          }}
        >
          <SelectTrigger className="mt-2 bg-background">
            <SelectValue placeholder="Select text align" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-row gap-2 items-center">
          <Switch
            className="bg-background"
            checked={fieldState.required}
            onCheckedChange={(checked) => handleInput('required', checked)}
          />
          <Label>
            Required field
          </Label>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Switch
            className="bg-background"
            checked={fieldState.readOnly}
            onCheckedChange={(checked) => handleInput('readOnly', checked)}
          />
          <Label>
            Read only
          </Label>
        </div>
      </div>
    </div>
  );
};
