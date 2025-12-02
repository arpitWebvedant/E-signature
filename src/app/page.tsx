// 'use client'

// import { DocumentsHeader } from '@/components/documents/DocumentsHeader'
// import { DocumentsTable } from '@/components/documents/DocumentsTable'
// import { Filters } from '@/components/documents/Filters'
// import { Pagination } from '@/components/documents/Pagination'
// import { usePDFContext } from '@/context/PDFContext'
// import { useSearchParams } from 'next/navigation'
// import { useCallback, useEffect, useState } from 'react'
// interface Recipient {
//   id: string
//   name: string
//   email: string
// }
// interface Document {
//   id: string
//   createdAt: string
//   title: string
//   sender: string
//   recipient: Recipient[]
//   status: 'pending' | 'completed' | 'draft'
// }

// const DocumentsPage = () => {
//   const { resetSteps } = usePDFContext()
//   const searchParams = useSearchParams()
//   const statusFilter = searchParams.get('status') || 'ALL'
//   const period = searchParams.get('period') || 'all'
//   const query = searchParams.get('q') || ''
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     totalItems: 0,
//     totalPages: 0,
//   })
//   const [loading, setLoading] = useState(false)
//   const [documents, setDocuments] = useState([
//     {
//       id: '15',
//       createdAt: '8/11/2025, 6:15 PM',
//       title: 'Harsh Resume_240503_215025.pdf',
//       sender: 'Harsh',
//       recipient: [
//         {
//           id: '15',
//           name: 'Harsh',
//           email: 'harsh@omnisai.io',
//         },
//       ],
//       status: 'draft',
//     },
//   ] as Document[])

//   useEffect(() => {
//     resetSteps()
//   }, [resetSteps])
//   const fetchDocuments = useCallback(async () => {
//     try {
//       setLoading(true)
//       const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
  
//       const params = new URLSearchParams({
//         userId: currentUserId,
//         page: pagination.page.toString(),
//         limit: pagination.limit.toString(),
//       })
  
//       if (statusFilter !== 'ALL') params.append('status', statusFilter)
//       if (period !== 'all') params.append('period', period)
//       if (query) params.append('q', query)
  
//       const response = await fetch(
//         `https://proof-app.stg-omnisai.io/api/v1/files/get-all-documents?${params.toString()}`
//       )
//       const data = await response.json()
  
//       const documents = data.data.map((doc: any) => ({
//         id: doc?.id,
//         createdAt: doc?.createdAt || '',
//         title: doc?.title || '',
//         sender: doc?.user?.email || '',
//         recipient: doc?.recipientDetails || [],
//         user: doc?.user || {},
//         status: doc?.status || '',
//       }))
  
//       setDocuments(documents)
//       setPagination({
//         page: data.pagination.page,
//         limit: data.pagination.limit,
//         totalItems: data.pagination.totalItems,
//         totalPages: data.pagination.totalPages,
//       })
//     } catch (error) {
//       console.error('Error fetching documents:', error)
//     } finally {
//       setLoading(false)
//     }
//   }, [pagination.page, pagination.limit, statusFilter, period, query])
  
//   useEffect(() => {
//     fetchDocuments()
//   }, [fetchDocuments])
//   return (
//     <div className='relative h-full'>
//       <div className='px-4 mx-auto w-full max-w-screen-xl md:px-8'>
//         <DocumentsHeader title='Documents' />
//         <Filters documents={documents} />
//         <DocumentsTable documents={documents} loading={loading} />
//         <Pagination pagination={pagination} setPagination={setPagination} />
//       </div>
//     </div>
//   )
// }

// export default DocumentsPage
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
