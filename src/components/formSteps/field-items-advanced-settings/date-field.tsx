import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'


export const DateFieldAdvancedSettings = ({
  fieldState,
  handleFieldChange,
}: any) => {


  // const handleInput = (field: keyof DateFieldMeta, value: string | boolean) => {
  //   if (field === 'fontSize') {
  //     const fontSize = value === '' ? '' : Number(value);
  //     if (typeof fontSize === 'number' && !Number.isNaN(fontSize)) {
  //       const errors = validateDateFields({
  //         fontSize,
  //         type: 'date',
  //       });
  //       handleErrors(errors);
  //       handleFieldChange(field, fontSize.toString());
  //     } else {
  //       handleErrors(['Invalid font size']);
  //     }
  //   } else {
  //     handleFieldChange(field, value);
  //   }
  // };

  const handleInput = (field: keyof any, value: string | boolean) => {
    const fontSize = field === 'fontSize' ? Number(value) : Number(fieldState.fontSize ?? 14);

    // const errors = validateDateFields({
    //   fontSize,
    //   type: 'date',
    // });

    // handleErrors(errors);
    handleFieldChange(field, value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>
          Font Size
        </Label>
        <Input
          id="fontSize"
          type="number"
          className="mt-2 bg-background"
          placeholder={`Field font size`}
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
          onValueChange={(value) => handleInput('textAlign', value)}
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
    </div>
  );
};
