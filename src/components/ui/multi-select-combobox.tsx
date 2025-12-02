'use client'

import { AnimatePresence } from 'framer-motion'
import { Check, ChevronsUpDown, Loader, XIcon } from 'lucide-react'
import * as React from 'react'
import { AnimateGenericFadeInOut } from '../animate/animate-generic-fade-in-out'
import { cn } from '../lib/ClsxConnct'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'

type OptionValue = string | number | boolean | null

type ComboBoxOption<T = OptionValue> = {
  label: string
  value: T
  disabled?: boolean
}

type MultiSelectComboboxProps<T = OptionValue> = {
  emptySelectionPlaceholder?: React.ReactElement | string
  enableClearAllButton?: boolean
  enableSearch?: boolean
  className?: string
  contentClassName?: string
  loading?: boolean
  inputPlaceholder?: string
  onChange: (_values: T[]) => void
  options: ComboBoxOption<T>[]
  selectedValues: T[]
  testId?: string
}

export function MultiSelectCombobox<T = OptionValue>({
  emptySelectionPlaceholder = 'Select values...',
  enableClearAllButton,
  enableSearch = true,
  className,
  contentClassName,
  inputPlaceholder,
  loading,
  onChange,
  options,
  selectedValues,
  testId,
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedOption: T) => {
    let newSelectedOptions: T[]

    if (selectedValues.includes(selectedOption)) {
      newSelectedOptions = selectedValues.filter((v) => v !== selectedOption)
    } else {
      newSelectedOptions = [...selectedValues, selectedOption]
    }

    onChange(newSelectedOptions)
  }

  const selectedOptions = React.useMemo(() => {
    return selectedValues.map((value): ComboBoxOption<T> => {
      const foundOption = options.find((option) => option.value === value)

      if (foundOption) {
        return foundOption
      }

      let label = ''
      if (typeof value === 'string' || typeof value === 'number') {
        label = value.toString()
      }

      return { label, value }
    })
  }, [selectedValues, options])

  const buttonLabel = React.useMemo(() => {
    if (loading) return ''
    if (selectedOptions.length === 0) return emptySelectionPlaceholder
    return selectedOptions.map((option) => option.label).join(', ')
  }, [selectedOptions, emptySelectionPlaceholder, loading])

  const showClearButton = enableClearAllButton && selectedValues.length > 0

  return (
    <div className="relative" data-testid={testId}>
      {/* Trigger button */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn('justify-between px-3 w-full', className)}
      >
        <AnimatePresence>
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          ) : (
            <AnimateGenericFadeInOut className="flex justify-between w-full">
              <span className="truncate">{buttonLabel}</span>
              <div
                className={cn('flex flex-row items-center ml-2', {
                  'ml-6': showClearButton,
                })}
              >
                <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
              </div>
            </AnimateGenericFadeInOut>
          )}
        </AnimatePresence>
      </Button>

      {/* Clear button */}
      {showClearButton && !loading && (
        <div className="flex absolute top-0 bottom-0 right-8 justify-center items-center">
          <button
            type="button"
            className="flex justify-center items-center w-4 h-4 bg-gray-300 rounded-full dark:bg-neutral-700"
            onClick={() => onChange([])}
          >
            <XIcon className="text-foreground h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && !loading && (
        <div
          className={cn(
            'absolute mt-1 w-full rounded-md border shadow-lg z-[50000000] bg-popover',
            contentClassName
          )}
        >
          <Command>
            {enableSearch && (
              <CommandInput placeholder={inputPlaceholder || 'Search...'} />
            )}
            <CommandList>
              {options.length === 0 && (
                <CommandEmpty>No value found.</CommandEmpty>
              )}
              <CommandGroup>
                {options.map((option, i) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={i}
                      value={String(option.label)} // 🔑 ensures search works
                      onClick={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 w-4 h-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
