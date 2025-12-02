import { useEffect, useState } from 'react';
import { DocumentSigningFieldContainer } from './document-signing-field-container';
import {
  DocumentSigningFieldsInserted,
  DocumentSigningFieldsUninserted,
} from './document-signing-fields';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '../lib/ClsxConnct';
import { Button } from '../ui/button';
import { useGlobalContext } from '@/context/GlobalContext';
import { useParams, useSearchParams } from 'next/navigation';
import { usePDFContext } from '@/context/PDFContext';
import { upDateText } from './singHelper';

export type DocumentSigningNumberFieldProps = {
  field: any;
  onSignField?: (value: string) => Promise<void>;
  onUnsignField?: () => Promise<void>;
  isDownloadMod: boolean
  color?: any
};

export const DocumentSigningNumberField = ({
  field,
  onSignField,
  isDownloadMod,
  originalField,
  onUnsignField,
  color,
}: DocumentSigningNumberFieldProps) => {
  const isLoading = false;
  const { user } = useGlobalContext();
  const params = useParams();
  const { updateStepData, getStepData } = usePDFContext();
  const stepData = getStepData(3);

  const parsedFieldMeta = field.fieldMeta;

  const [showNumberModal, setShowNumberModal] = useState(false);
  const [localNumber, setLocalNumber] = useState(
    parsedFieldMeta?.value ? String(parsedFieldMeta.value) : ''
  );
  const signerCustomText = Array.isArray(originalField.customText)
      ? originalField.customText.find((ct) => ct.email === originalField?.signerEmail)
      : null

  type ValidationErrors = {
    isNumber: string[];
    required: string[];
    minValue: string[];
    maxValue: string[];
    numberFormat: string[];
    characterLimit: string[];
  };

  const initialErrors: ValidationErrors = {
    isNumber: [],
    required: [],
    minValue: [],
    maxValue: [],
    numberFormat: [],
    characterLimit: [],
  };

  const [errors, setErrors] = useState(initialErrors);
  const userInputHasErrors = Object.values(errors).some((error) => error.length > 0);
    const charactersRemaining =
    (parsedFieldMeta?.characterLimit ?? 0) - (localNumber.length ?? 0)
    console.log('charactersRemaining', parsedFieldMeta)
  console.log('charactersRemaining', field)
  const searchParams = useSearchParams()
  const recipient = searchParams.get('recipient')
  useEffect(() => {
    if (!showNumberModal) {
      setLocalNumber(parsedFieldMeta?.value ? String(parsedFieldMeta.value) : '');
      setErrors(initialErrors);
    }
  }, [showNumberModal]);

  const validateNumberField = (value: string, fieldMeta?: any, checkRequired = false): string[] => {
    const validationErrors: string[] = [];

    // Check if empty and required
    if (checkRequired && fieldMeta?.required && !value.trim()) {
      validationErrors.push('This field is required');
    }

    // Check if it's a valid number
    if (value && !/^-?\d*\.?\d+$/.test(value)) {
      validationErrors.push('Please enter a valid number');
    }

    // Convert to number for min/max validation
    const numericValue = parseFloat(value);
    
    // Check min value
    if (fieldMeta?.minValue !== undefined && !isNaN(numericValue) && numericValue < fieldMeta.minValue) {
      validationErrors.push(`Value must be at least ${fieldMeta.minValue}`);
    }

    // Check max value
    if (fieldMeta?.maxValue !== undefined && !isNaN(numericValue) && numericValue > fieldMeta.maxValue) {
      validationErrors.push(`Value must be at most ${fieldMeta.maxValue}`);
    }

    // Check number format (decimals)
    if (fieldMeta?.decimalPlaces !== undefined && value.includes('.')) {
      const decimalPart = value.split('.')[1];
      if (decimalPart.length > fieldMeta.decimalPlaces) {
        validationErrors.push(`Maximum ${fieldMeta.decimalPlaces} decimal places allowed`);
      }
    }

    return validationErrors;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
          if (parsedFieldMeta?.characterLimit) {
            const characterLimit = parsedFieldMeta?.characterLimit
            if (value.length > characterLimit) {
              setErrors({
                required: [],
                characterLimit: ['Character limit exceeded'],
              })
              return
            }
          } 
    setLocalNumber(value);

    if (parsedFieldMeta) {
      const validationErrors = validateNumberField(value, parsedFieldMeta, true);
      
      setErrors({
        isNumber: validationErrors.filter((error) => 
          error.includes('valid number') || error.includes('decimal places')
        ),
        // required: validationErrors.filter((error) => error.includes('required')),
        // minValue: validationErrors.filter((error) => error.includes('at least')),
        // maxValue: validationErrors.filter((error) => error.includes('at most')),
        numberFormat: validationErrors.filter((error) => error.includes('format')),
      });
    }
  };

  /**
   * When the user clicks the sign button in the dialog where they enter the number.
   */
  const onDialogSignClick = () => {
    // if (parsedFieldMeta) {
    //   const validationErrors = validateNumberField(localNumber, parsedFieldMeta, true);

    //   if (validationErrors.length > 0) {
    //     setErrors({
    //       isNumber: validationErrors.filter((error) => 
    //         error.includes('valid number') || error.includes('decimal places')
    //       ),
    //       required: validationErrors.filter((error) => error.includes('required')),
    //       minValue: validationErrors.filter((error) => error.includes('at least')),
    //       maxValue: validationErrors.filter((error) => error.includes('at most')),
    //       numberFormat: validationErrors.filter((error) => error.includes('format')),
    //     });
    //     return;
    //   }
    // }

    setShowNumberModal(false);
    onSign(); // Call the sign function after closing the modal
  };

  const onPreSign = () => {
    setShowNumberModal(true);

    // if (localNumber && parsedFieldMeta) {
    //   const validationErrors = validateNumberField(localNumber, parsedFieldMeta, true);
    //   setErrors({
    //     isNumber: validationErrors.filter((error) => 
    //       error.includes('valid number') || error.includes('decimal places')
    //     ),
    //     required: validationErrors.filter((error) => error.includes('required')),
    //     minValue: validationErrors.filter((error) => error.includes('at least')),
    //     maxValue: validationErrors.filter((error) => error.includes('at most')),
    //     numberFormat: validationErrors.filter((error) => error.includes('format')),
    //   });
    // }

    return false;
  };

  const onSign = async () => {
    try {
      if (!localNumber || userInputHasErrors) {
        return;
      }

      const userEmail = recipient || user?.data?.email
      const updatedField = upDateText(originalField, field, localNumber, userEmail)


      // Update step 3 data with the signed field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData.fields.map((f: any) =>
          f.id === field.id ? updatedField : f
        );

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true);
      }

      if (onSignField) {
        await onSignField(localNumber);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onRemove = async () => {
    try {
      const userEmail = recipient || user?.data?.email
      const updatedField = upDateText(originalField, field, '', userEmail)

      // Update step 3 data with the unsigned field
      if (stepData && stepData?.fields && Array.isArray(stepData?.fields)) {
        const updatedFields = stepData.fields.map((f: any) =>
          f.id === field.id ? updatedField : f
        );

        // Update step 3 with the modified fields array
        updateStepData(3, { fields: updatedFields }, true);
      }

      // Reset local state
      setLocalNumber('')
      // setErrors(initialErrors)

      if (onUnsignField) {
        await onUnsignField();
        return;
      }

      setLocalNumber(parsedFieldMeta?.value ? String(parsedFieldMeta.value) : '');
    } catch (err) {
      console.error(err);
    }
  };

  const labelDisplay = parsedFieldMeta?.label;
  const fieldDisplayName = labelDisplay ? labelDisplay : 'Number';

  // Add this check to properly handle empty/removed state
  const shouldShowInserted = signerCustomText && signerCustomText.text && signerCustomText.text !== ''

  return (
    <DocumentSigningFieldContainer
      field={field}
      isDownloadMod={isDownloadMod}
      onPreSign={onPreSign}
      onSign={onSign}
      onRemove={onRemove}
      type="Number"
      color={color}
    >
      {!shouldShowInserted && (
        <DocumentSigningFieldsUninserted>
          {fieldDisplayName}
        </DocumentSigningFieldsUninserted>
      )}

      {shouldShowInserted && (
        <DocumentSigningFieldsInserted 
          textAlign={parsedFieldMeta?.textAlign || 'left'}
          color={color}
          >
          {signerCustomText?.text}
        </DocumentSigningFieldsInserted>
      )}

      <Dialog open={showNumberModal} onOpenChange={setShowNumberModal}>
        <DialogContent>
          <DialogTitle>
            {parsedFieldMeta?.label ? parsedFieldMeta.label : 'Number'}
          </DialogTitle>

          <div>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={parsedFieldMeta?.placeholder ?? 'Enter a number'}
              className={cn('mt-2 w-full rounded-md', {
                'border-2 border-red-300 ring-2 ring-red-200 ring-offset-2 ring-offset-red-200 focus-visible:border-red-400 focus-visible:ring-4 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-200':
                  userInputHasErrors,
                'text-center': parsedFieldMeta?.textAlign === 'center',
                'text-right': parsedFieldMeta?.textAlign === 'right',
              })}
              value={localNumber}
              onChange={handleNumberChange}
            />
                     {parsedFieldMeta?.characterLimit && (
              <div className='mt-1 text-sm text-muted-foreground'>
                {charactersRemaining} characters remaining
              </div>
            )}
          </div>

          {userInputHasErrors && (
            <div className="mt-2 space-y-1">
              {errors.isNumber?.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
              {errors.required?.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
              {errors.minValue?.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
              {errors.maxValue?.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
              {errors.numberFormat?.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>
          )}

          <DialogFooter>
            <div className="flex flex-nowrap flex-1 gap-4 mt-4 w-full">
              <Button
                type="button"
                className='flex-1 cursor-pointer bg-black/5 hover:bg-black/10'
                variant='outline'
                onClick={() => {
                  setShowNumberModal(false);
                  setLocalNumber(parsedFieldMeta?.value ? String(parsedFieldMeta.value) : '');
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="flex-1"
                disabled={!localNumber || userInputHasErrors}
                onClick={onDialogSignClick}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DocumentSigningFieldContainer>
  );
};