import { forwardRef, useEffect, useState } from 'react';

import { match } from 'ts-pattern';

import { CheckboxFieldAdvancedSettings } from './field-items-advanced-settings/checkbox-field';
import { DateFieldAdvancedSettings } from './field-items-advanced-settings/date-field';
import { DropdownFieldAdvancedSettings } from './field-items-advanced-settings/dropdown-field';
import { EmailFieldAdvancedSettings } from './field-items-advanced-settings/email-field';
import { InitialsFieldAdvancedSettings } from './field-items-advanced-settings/initials-field';
import { NameFieldAdvancedSettings } from './field-items-advanced-settings/name-field';
import { NumberFieldAdvancedSettings } from './field-items-advanced-settings/number-field';
import { RadioFieldAdvancedSettings } from './field-items-advanced-settings/radio-field';
import { TextFieldAdvancedSettings } from './field-items-advanced-settings/text-field';
import { DocumentFlowFormContainerActions, DocumentFlowFormContainerContent, DocumentFlowFormContainerFooter, DocumentFlowFormContainerHeader } from './DocumentFlowRoot';
import { FieldItem } from './field-item';
import { FieldType } from '../schema/types';
import { useAutoSave } from '@/hooks/use-autosave';
import { ZFieldMetaSchema } from './meta/field-meta';




const getDefaultState = (fieldType: FieldType): any => {
  switch (fieldType) {
    case FieldType.INITIALS:
      return {
        type: 'initials',
        fontSize: 14,
        textAlign: 'left',
      };
    case FieldType.NAME:
      return {
        type: 'name',
        fontSize: 14,
        textAlign: 'left',
      };
    case FieldType.EMAIL:
      return {
        type: 'email',
        fontSize: 14,
        textAlign: 'left',
      };
    case FieldType.DATE:
      return {
        type: 'date',
        fontSize: 14,
        textAlign: 'left',
      };
    case FieldType.TEXT:
      return {
        type: 'text',
        label: '',
        placeholder: '',
        text: '',
        characterLimit: 0,
        fontSize: 14,
        required: false,
        readOnly: false,
        textAlign: 'left',
      };
    case FieldType.NUMBER:
      return {
        type: 'number',
        label: '',
        placeholder: '',
        numberFormat: '',
        characterLimit: 0,
        value: '0',
        minValue: 0,
        maxValue: 0,
        required: false,
        readOnly: false,
        fontSize: 14,
        textAlign: 'left',
      };
    case FieldType.RADIO:
      return {
        type: 'radio',
        values: [],
        required: false,
        readOnly: false,
      };
    case FieldType.CHECKBOX:
      return {
        type: 'checkbox',
        values: [],
        validationRule: '',
        validationLength: 0,
        required: false,
        readOnly: false,
        direction: 'vertical',
      };
    case FieldType.DROPDOWN:
      return {
        type: 'dropdown',
        values: [],
        defaultValue: '',
        required: false,
        readOnly: false,
      };
    default:
      throw new Error(`Unsupported field type: ${fieldType}`);
  }
};

export const FieldAdvancedSettings = forwardRef<HTMLDivElement, any>(
  (
    {
      title,
      description,
      field,
      fields,
      onAdvancedSettings,
      isDocumentPdfLoaded = true,
      onSave,
      onAutoSave,
    },
    ref,
  ) => {


    const [errors, setErrors] = useState<string[]>([]);

    const fieldMeta = field?.fieldMeta;

    const localStorageKey = `field_${field.formId}_${field.type}`;

    const defaultState: FieldMeta = getDefaultState(field.type);

    const [fieldState, setFieldState] = useState(() => {
      const savedState = localStorage.getItem(localStorageKey);
      return savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;
    });

    useEffect(() => {
      if (fieldMeta && typeof fieldMeta === 'object') {
        const parsedFieldMeta = ZFieldMetaSchema.parse(fieldMeta);

        setFieldState({
          ...defaultState,
          ...parsedFieldMeta,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldMeta]);

    const { scheduleSave } = useAutoSave(onAutoSave || (async () => {}));

    const handleAutoSave = () => {
      if (errors.length === 0) {
        scheduleSave(fieldState);
      }
    };

    // Auto-save to localStorage and schedule remote save when fieldState changes
    useEffect(() => {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(fieldState));
        handleAutoSave();
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, [fieldState, localStorageKey, handleAutoSave]);

    const handleFieldChange = (
      key: string,
      value:
        | string
        | { checked: boolean; value: string }[]
        | { value: string }[]
        | boolean
        | number,
    ) => {
      setFieldState((prevState: FieldMeta) => {
        if (
          ['characterLimit', 'minValue', 'maxValue', 'validationLength', 'fontSize'].includes(key)
        ) {
          const parsedValue = Number(value);

          return {
            ...prevState,
            [key]: isNaN(parsedValue) ? undefined : parsedValue,
          };
        } else {
          return {
            ...prevState,
            [key]: value,
          };
        }
      });
    };

    const handleOnGoNextClick = () => {
      try {
        if (errors.length > 0) {
          return;
        } else {
          localStorage.setItem(localStorageKey, JSON.stringify(fieldState));

          onSave?.(fieldState);
          onAdvancedSettings?.();
        }
      } catch (error) {
        console.error('Failed to save to localStorage:', error);

        toast({
          title: `Error`,
          description: `Failed to save settings.`,
          variant: 'destructive',
        });
      }
    };

    return (
      <div ref={ref} className="flex flex-col h-full">
        <DocumentFlowFormContainerHeader title={title} description={description} />

        <DocumentFlowFormContainerContent>
          {isDocumentPdfLoaded &&
            fields.map((localField, index) => (
              <span key={index} className="opacity-75 active:pointer-events-none">
                <FieldItem
                  key={index}
                  field={localField}
                  disabled={true}
                  fieldClassName={
                    localField.formId === field.formId ? 'ring-red-400' : 'ring-neutral-200'
                  }
                />
              </span>
            ))}

          {match(field.type)
            .with(FieldType.INITIALS, () => (
              <InitialsFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.NAME, () => (
              <NameFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.EMAIL, () => (
              <EmailFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.DATE, () => (
              <DateFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))

            .with(FieldType.TEXT, () => (
              <TextFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.NUMBER, () => (
              <NumberFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.RADIO, () => (
              <RadioFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.CHECKBOX, () => (
              <CheckboxFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .with(FieldType.DROPDOWN, () => (
              <DropdownFieldAdvancedSettings
                fieldState={fieldState}
                handleFieldChange={handleFieldChange}
                handleErrors={setErrors}
              />
            ))
            .otherwise(() => null)}

          {errors.length > 0 && (
            <div className="mt-4">
              <ul>
                {errors.map((error, index) => (
                  <li className="text-sm text-red-500" key={index}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DocumentFlowFormContainerContent>

        <DocumentFlowFormContainerFooter
          className="mt-auto"
          data-testid="field-advanced-settings-footer"
        >
          <DocumentFlowFormContainerActions
            goNextLabel={`Save`}
            goBackLabel={`Cancel`}
            onGoBackClick={onAdvancedSettings}
            onGoNextClick={handleOnGoNextClick}
            disableNextStep={errors.length > 0}
          />
        </DocumentFlowFormContainerFooter>
      </div>
    );
  },
);

FieldAdvancedSettings.displayName = 'FieldAdvancedSettings';
