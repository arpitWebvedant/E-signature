import type { HTMLAttributes } from 'react'
import React from 'react'

import { motion } from 'framer-motion'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'
import ESignatureStepper from '../common/ESignatureStepper'

export type DocumentFlowFormContainerProps = HTMLAttributes<HTMLFormElement> & {
  children?: React.ReactNode
}

export const DocumentFlowFormContainer = ({
  children,
  id = 'document-flow-form-container',
  className,
  ...props
}: DocumentFlowFormContainerProps) => {
  return (
    <form
      id={id}
      className={cn(
        'flex overflow-hidden sticky top-0 flex-col px-4 py-6 w-full bg-white rounded-xl border hover:overflow-auto h-fit min-h-[36rem] max-h-[calc(100vh-21vh)]',
        className,
      )}
      {...props}
    >
      <div className={cn('flex flex-col flex-1 px-2 -mx-2')}>{children}</div>
    </form>
  )
}
export const DocumentFlowStepper = ({
  currentStepIndex,
}: {
  currentStepIndex: number
}) => {
  return (
    <ESignatureStepper
      stepLabels={[
        'General',
        'Add Signers',
        'Add Fields',
        'Distribute',
      ]}
      currentStepIndex={currentStepIndex} // Active step (zero-based index)
    />
  )
}
export type DocumentFlowFormContainerHeaderProps = {
  title: string
  description: string
  disableLine?: boolean
}

export const DocumentFlowFormContainerHeader = ({
  title,
  disableLine,
  description,
}: DocumentFlowFormContainerHeaderProps) => {
  return (
    <div className='mt-2.5'>
      <h3 className='text-xl font-bold text-color-title'>{title}</h3>

      <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>

      <hr className={cn('my-2.5 border-border', disableLine && 'hidden')} />
    </div>
  )
}

export type DocumentFlowFormContainerContentProps =
  HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode
  }

export const DocumentFlowFormContainerContent = ({
  children,
  className,
  ...props
}: DocumentFlowFormContainerContentProps) => {
  return (
    <div
      className={cn(
        'flex overflow-y-auto flex-col flex-1 px-2 -mx-2 custom-scrollbar',
        className,
      )}
      {...props}
    >
      <div className='flex flex-col flex-1'>{children}</div>
    </div>
  )
}

export type DocumentFlowFormContainerFooterProps =
  HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode
  }

export const DocumentFlowFormContainerFooter = ({
  children,
  className,
  ...props
}: DocumentFlowFormContainerFooterProps) => {
  return (
    <div className={cn('flex-shrink-0 mt-4', className)} {...props}>
      {children}
    </div>
  )
}

export type DocumentFlowFormContainerStepProps = {
  step: number
  maxStep: number
}

export const DocumentFlowFormContainerStep = ({
  step,
  maxStep,
}: DocumentFlowFormContainerStepProps) => {
  return (
    <div>
      <p className='text-sm text-muted-foreground'>
        Step <span>{`${step} of ${maxStep}`}</span>
      </p>

      <div className='bg-muted relative mt-4 h-[2px] rounded-md'>
        <motion.div
          layout='size'
          layoutId='document-flow-container-step'
          className='bg-[#a2e771] absolute inset-y-0 left-0'
          style={{
            width: `${(100 / maxStep) * step}%`,
          }}
        />
      </div>
    </div>
  )
}

export type DocumentFlowFormContainerActionsProps = {
  canGoBack?: boolean
  canGoNext?: boolean
  goNextLabel?: string
  goBackLabel?: string
  onGoBackClick?: () => void
  onGoNextClick?: () => void
  loading?: boolean
  disabled?: boolean
  disableNextStep?: boolean
}

export const DocumentFlowFormContainerActions = ({
  canGoBack = true,
  canGoNext = true,
  goNextLabel = `Continue`,
  goBackLabel = `Go Back`,
  onGoBackClick,
  onGoNextClick,
  loading,
  disabled,
  disableNextStep = false,
}: DocumentFlowFormContainerActionsProps) => {
  return (
    <div className='flex gap-x-4 w-full'>
      <Button
        type='button'
        className='flex-1 cursor-pointer bg-black/5 hover:bg-black/10'
        variant='outline'
        size='lg'
        disabled={disabled || loading || !canGoBack || !onGoBackClick}
        onClick={onGoBackClick}
      >
        {goBackLabel}
      </Button>

      <Button
        type='button'
        className='flex-1 cursor-pointer bg-primary'
        size='lg'
        disabled={disabled || disableNextStep || loading || !canGoNext}
        loading={loading}
        onClick={onGoNextClick}
      >
        {goNextLabel}
      </Button>
    </div>
  )
}
