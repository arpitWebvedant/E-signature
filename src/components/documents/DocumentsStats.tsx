'use client'

import Image from 'next/image';
import { usePDFContext } from '@/context/PDFContext';



const DocumentsStats = ({ loading = false }: { loading?: boolean }) => {
  const {pagination} = usePDFContext()
  const documentStats = [
    {
      id: 'total-folders',
      label: 'Total Folders',
      count: pagination?.statusCounts?.folderCount || 0,
      src: '/assets/img/folder-icon.svg',
      class: 'bg-[#0000001A]'
    },
    {
      id: 'total-documents',
      label: 'Total Documents',
      // count: pagination?.totalItems || 0,
      count: pagination?.statusCounts?.all || 0,
      src: '/assets/img/doc-icon.svg',
      class: 'bg-[#3353F81A]'
    },
    {
      id: 'completed-documents',
      label: 'Completed Documents',
      count: pagination?.statusCounts?.completed || 0,
      src: '/assets/img/complete-doc-icon.svg',
      class: 'bg-[#2F94491A]'
    },
    {
      id: 'pending-documents',
      label: 'Pending Documents',
      count: pagination?.statusCounts?.pending || 0,
      src: '/assets/img/pending-doc-icon.svg',
      class: 'bg-[#D499001A]'
    },
    {
      id: 'draft-documents',
      label: 'Draft Documents',
      count: pagination?.statusCounts?.draft || 0,
      src: '/assets/img/file-icon.svg',
      class: 'bg-[#6A27D91A]'
    },
    {
      id: 'rejected-documents',
      label: 'Rejected Documents',
      count: pagination?.statusCounts?.rejected || 0,
      src: '/assets/img/rejected-doc-icon.svg',
      class: 'bg-[#D117171A]'
    }
  ]
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {
        (loading ? Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className='bg-white rounded-lg border border-[#EAECF0] p-4 flex justify-between gap-2 animate-pulse'>
            <div className='flex flex-col gap-3 justify-between w-full'>
              <div className='h-4 w-28 bg-gray-200 rounded'></div>
              <div className='h-8 w-16 bg-gray-200 rounded'></div>
            </div>
            <div className='border border-[#0000000D] w-10 h-10 flex justify-center items-center rounded-lg bg-gray-200'></div>
          </div>
        )) : documentStats.map((doc) => (
          <div key={doc.id} className='bg-white rounded-lg border border-[#EAECF0] px-4 py-3 flex justify-between gap-1'>
            <div className='flex flex-col gap-2 justify-between'>
              <p className='text-[#5F5E5E] font-inter text-sm'>{doc.label}</p>
              <p className='text-3xl font-bold text-[#000000] text-2xl'>{doc.count}</p>
            </div>
            <div className={`${doc.class} border border-[#0000000D] w-10 h-10 flex justify-center items-center rounded-lg`}>
              <Image src={doc.src} alt={doc.id} height={24} width={24} />
            </div>
          </div>
        )))
      }
    </div>
  )
}

export default DocumentsStats
