import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
  completed: boolean
  active: boolean
}

interface ESignatureStepperProps {
  stepLabels: string[] // Receive array of labels
  currentStepIndex: number // Which step is active (zero-based)
}

const ESignatureStepper: React.FC<ESignatureStepperProps> = ({
  stepLabels,
  currentStepIndex,
}) => {
  // Build steps array automatically
  const steps: Step[] = stepLabels.map((label, index) => ({
    id: `${index + 1}`,
    label,
    completed: index < currentStepIndex,
    active: index === currentStepIndex,
  }))

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = step.completed
        const isLast = index === steps.length - 1

        return (
          <div className="flex relative flex-1 items-center" key={step.id}>
            {/* Connector Line - Before Circle */}
            {index !== 0 && (
              <div
                className={`absolute top-4 left-0 right-1/2 h-0.5 ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}

            {/* Step Circle + Label */}
            <div className="flex z-10 flex-col items-center w-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'text-white bg-blue-600' : 'text-white bg-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-3 text-sm font-medium whitespace-nowrap ${
                  isCompleted ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line - After Circle */}
            {!isLast && (
              <div
                className={`absolute top-4 bottom-3 left-1/2 right-0 h-0.5 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ESignatureStepper
