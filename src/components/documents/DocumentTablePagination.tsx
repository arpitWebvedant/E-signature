'use client'
import React, { useEffect } from 'react'
const DocumentTablePagination = ({
  totalPages,
  currentPage,
  onNext,
  loading,
  onPrevious

}: {
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
}) => {

  return (
    <div className="w-full bottom-0 flex justify-between items-center">
      <div className="text-sm font-medium text-[#344054]">
        {`Page ${currentPage} of ${totalPages}`}
      </div>
      <div className="flex gap-2">
        <button
          className={`
            text-sm font-medium text-[#344054] rounded-xl py-2 px-4 cursor-pointer transition-all duration-200 ease-in border border-[#D0D5DD] shadow-[0px 1px 2px 0px #1018280D]"
            ${currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:border-[#98A2B3] hover:bg-neutral-100 hover:shadow-[0px_2px_4px_0px_#1018281A] hover:-translate-y-[1px]'}
          `}
          onClick={() => { onPrevious && onPrevious() }}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>
        <button
          className={`
            text-sm font-medium text-[#344054] rounded-xl py-2 px-4 cursor-pointer transition-all duration-200 ease-in border border-[#D0D5DD] shadow-[0px 1px 2px 0px #1018280D]"
            ${currentPage === totalPages || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:border-[#98A2B3] hover:bg-neutral-100 hover:shadow-[0px_2px_4px_0px_#1018281A] hover:-translate-y-[1px]'}
          `}
          onClick={() => { onNext && onNext() }}
          disabled={totalPages === currentPage || loading}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default DocumentTablePagination
