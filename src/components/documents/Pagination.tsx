'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import { useState } from 'react'

export const Pagination = ({
  pagination,
  setPagination,
}: {
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<{
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }>>;
}) => {
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false)
  const [customLimitInput, setCustomLimitInput] = useState('')
  const [isCustomLimitInputVisible, setIsCustomLimitInputVisible] = useState(false)

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleLimitChange = (limit: number) => {
    const totalPages = Math.ceil(pagination.totalItems / limit)
    
    const newPage = Math.min(pagination.page, totalPages || 1)
    
    setPagination((prev) => ({
      ...prev,
      limit,
      page: newPage,
      totalPages,
    }))
    setIsLimitDropdownOpen(false)
    setIsCustomLimitInputVisible(false)
    setCustomLimitInput('')
  }

  const handleCustomLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const limit = parseInt(customLimitInput)
    if (limit > 0) {
      handleLimitChange(limit)
    }
  }

  const commonLimits = [5, 10, 15, 20]

  return (
    <div className='mt-8 w-full'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-4 px-2'>
        <div className='flex-1 text-sm text-muted-foreground'>
          <span>
            Showing {Math.min(pagination.limit, pagination.totalItems - (pagination.page - 1) * pagination.limit)} of {pagination.totalItems} item{pagination.totalItems !== 1 ? 's' : ''}.
          </span>
        </div>

        <div className='flex items-center gap-x-2 relative'>
          <p className='whitespace-nowrap text-sm font-medium'>Rows per page</p>
          <button
            onClick={() => setIsLimitDropdownOpen(!isLimitDropdownOpen)}
            className='flex h-8 w-[70px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background placeholder:text-muted-foreground'
          >
            <section
              className='flex w-full justify-between'
              style={{ opacity: 1 }}
            >
              <span style={{ pointerEvents: 'none' }}>{pagination.limit}</span>
              <ChevronDownIcon
                className='h-4 w-4 opacity-50'
                aria-hidden='true'
              />
            </section>
          </button>

          {isLimitDropdownOpen && (
            <div className="absolute top-10 right-0 z-10 w-[150px] rounded-md border bg-popover text-foreground shadow-md animate-in fade-in-0 zoom-in-95">
              <div className="p-1">
                {commonLimits.map((limit) => (
                  <button
                    key={limit}
                    onClick={() => handleLimitChange(limit)}
                    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                      pagination.limit === limit ? 'bg-accent font-medium' : ''
                    }`}
                  >
                    {limit}
                  </button>
                ))}
                <button
                  onClick={() => setIsCustomLimitInputVisible(true)}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  Custom
                </button>
              </div>
              {isCustomLimitInputVisible && (
                <form onSubmit={handleCustomLimitSubmit} className="p-2 border-t">
                  <input
                    type="number"
                    min="1"
                    value={customLimitInput}
                    onChange={(e) => setCustomLimitInput(e.target.value)}
                    placeholder="Enter number"
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomLimitInputVisible(false)
                        setCustomLimitInput('')
                      }}
                      className="h-8 px-3 py-1 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customLimitInput || parseInt(customLimitInput) <= 0}
                      className="h-8 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-x-6 gap-y-4 lg:gap-x-8'>
          <div className='flex items-center text-sm font-medium md:justify-center'>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className='flex items-center gap-x-2'>
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(1)}
              className='hidden h-8 w-8 items-center justify-center rounded-md border border-input p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background lg:flex'
            >
              <span className='sr-only'>Go to first page</span>
              <ChevronsLeftIcon className='h-4 w-4' />
            </button>
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-input p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background'
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-input p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background'
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon className='h-4 w-4' />
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.totalPages)}
              className='hidden h-8 w-8 items-center justify-center rounded-md border border-input p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background lg:flex'
            >
              <span className='sr-only'>Go to last page</span>
              <ChevronsRightIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}