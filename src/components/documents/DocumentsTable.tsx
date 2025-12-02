'use client'

import React, { useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import Image from 'next/image'
import { AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import type { ColDef, SortChangedEvent } from 'ag-grid-community'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Mail, MoreVertical, Users, FileX, SearchX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentsTableActionButton } from '../common/DocumentsTableActionButton'
import { DocumentStatus } from './DocumentStatus'
import moment from 'moment'

interface Recipient {
  id: string
  name: string
  email: string
}
interface DocumentItem extends Document {
  id: string
  createdAt: string
  title: string
  sender: string
  recipient: Recipient[]
  status: 'pending' | 'completed' | 'draft' | 'rejected'
  pdfType: string
  size: string
  pages: string
  documentSignData?: any
}

const getInitials = (name: string) => {
  if (!name) return 'NA'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Color variants for avatar backgrounds
const avatarColors = [
  'bg-primary text-primary-foreground',
  // 'bg-green-100 text-green-500',
  // 'bg-purple-100 text-purple-500',
  // 'bg-orange-100 text-orange-500',
  // 'bg-pink-100 text-pink-500',
  // 'bg-indigo-100 text-indigo-500',
  // 'bg-teal-100 text-teal-500',
  // 'bg-red-100 text-red-500',
]

const getAvatarColor = (email: string) => {
  const hash = email.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const NoDocumentsFound = () => (
  <div className='flex flex-col items-center justify-center h-full py-20 px-4 min-h-[500px]'>
    {/* Animated background elements */}
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse' />
      <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse' style={{ animationDelay: '1s' }} />
    </div>

    {/* Main content */}
    <div className='relative z-10 flex flex-col items-center justify-center'>
      {/* Icon container with floating animation */}
      <div className='relative mb-8 group'>
        {/* Outer glow rings */}
        <div className='absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-full blur-2xl scale-150 opacity-50 group-hover:opacity-75 transition-opacity duration-500' />
        <div className='absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse' />
        
        {/* Icon background */}
        <div className='relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-105 transition-transform duration-300'>
          <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 rounded-3xl' />
          <FileX className='relative w-20 h-20 text-primary drop-shadow-lg' strokeWidth={1.5} />
        </div>

        {/* Floating decorative elements */}
        <div className='absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full blur-sm animate-bounce' style={{ animationDelay: '0.5s' }} />
        <div className='absolute -bottom-3 -left-3 w-4 h-4 bg-blue-500/20 rounded-full blur-sm animate-bounce' style={{ animationDelay: '1s' }} />
      </div>

      {/* Text content */}
      <div className='text-center space-y-4 max-w-lg'>
        <h3 className='text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent'>
          No documents found
        </h3>
        
        <p className='text-base text-muted-foreground leading-relaxed px-4'>
          We couldn't find any documents matching your search criteria. 
          <br />
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    </div>
  </div>
)

const RecipientAvatars = ({ recipients }: { recipients: Recipient[] }) => {
  if (!recipients || recipients.length === 0) {
    return (
      <div className='flex items-center text-muted-foreground'>
        <span className='text-sm text-[#667085] font-medium'>
          No recipients
        </span>
      </div>
    )
  }

  const displayLimit = 3
  const displayRecipients = recipients.slice(0, displayLimit)

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className='flex items-center cursor-pointer group'>
          {recipients.length === 1 ? (
            <div className='flex gap-2 items-center'>
              <Avatar className='w-10 h-10 text-xs font-semibold border-2 shadow-sm transition-transform border-background group-hover:scale-105'>
                <AvatarFallback className={getAvatarColor(recipients[0].email)}>
                  {getInitials(recipients[0].name)}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className='flex items-center'>
              <div className='flex -space-x-2'>
                {displayRecipients.map((recipient, index) => (
                  <Avatar
                    key={recipient.id || index}
                    className='relative z-10 w-10 h-10 text-xs font-semibold border-2 shadow-sm transition-transform border-background group-hover:scale-105'
                    style={{ zIndex: displayLimit + index }}
                  >
                    <AvatarFallback className={getAvatarColor(recipient.email)}>
                      {getInitials(recipient.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className='p-0 w-80' side='top' align='start'>
        <div className='p-4'>
          <div className='flex gap-2 items-center mb-3'>
            <Users className='w-4 h-4 text-muted-foreground' />
            <span className='font-semibold text-foreground'>
              Recipients ({recipients.length})
            </span>
          </div>
          <div className='overflow-y-auto space-y-3 max-h-64'>
            {recipients.map((recipient, index) => (
              <div
                key={recipient.id || index}
                className='flex gap-3 items-center p-2 rounded-md transition-colors hover:bg-muted/50'
              >
                <Avatar className='w-8 h-8 text-xs font-semibold shadow-sm'>
                  <AvatarFallback className={getAvatarColor(recipient.email)}>
                    {getInitials(recipient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium truncate text-foreground'>
                    {recipient.name || 'Unknown User'}{' '}
                    <span className='text-[0.5rem] text-muted-foreground capitalize'>
                      ({' '}
                      {recipient.signingStatus
                        ? recipient.signingStatus
                            .toLowerCase()
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(' ')
                        : 'Not Signed'}{' '}
                      )
                    </span>
                  </div>
                  <div className='flex gap-1 items-center text-xs text-muted-foreground'>
                    <Mail className='w-3 h-3' />
                    <span className='truncate'>{recipient.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export const DocumentsTable = ({
  documents,
  loading,
  setDocuments,
  isFolderView,
  isHideFilter,
}: {
  documents: DocumentItem[]
  loading: boolean
  setDocuments: (documents: DocumentItem[]) => void
  isFolderView: boolean
  isHideFilter: boolean
}) => {
  const [colDefs] = useState<ColDef<DocumentItem>[]>([
    {
      headerName: 'Document Title',
      field: 'title',
      flex: 1.8,
      minWidth: 300,
      cellRenderer: (params: any) => (
        <div className='flex gap-2 items-center'>
          <span className=''>
            <Image
              alt={params.data.title}
              src={
                params.data.pdfType === 'pdf'
                  ? '/assets/img/pdf-icon.svg'
                  : '/assets/img/docx-icon.svg'
              }
              width={24}
              height={24}
            />
          </span>
          <div>
            <div className='text-sm font-semibold text-[#333333]'>
              {/* {params.data.title} */}
              {params.data.documentSignData?.['0']?.data?.title?.trim() ||
                params.data.title}
            </div>
            <div className='text-xs text-[#535862]'>{params.data.size}</div>
          </div>
        </div>
      ),
    },
    {
      headerName: 'Sender',
      field: 'sender',
      minWidth: 200,
      cellRenderer: (params: any) => (
        <Link
          href={`mailto:${params.data.sender}`}
          className='text-sm underline font-medium text-[#3353F8]'
        >
          {params.data.sender}
        </Link>
      ),
    },
    {
      headerName: 'Recipient',
      sortable: false,
      field: 'recipient',
      minWidth: 200,
      cellRenderer: (params: any) => (
        <RecipientAvatars recipients={params.data.recipient} />
      ),

      headerClass: 'center-aligned-header ml-2',

      cellClass: 'text-center flex items-center justify-center',
    },
    {
      headerName: 'Created Date',
      field: 'created-date',
      minWidth: 150,
      cellClass: 'ag-cell-wrap-text ',
      headerClass: 'center-aligned-header ml-2',
      cellRenderer: (params: any) => (
        <span className='text-[#667085] text-sm text-center'>
          {moment(params.data.createdAt).format('MM/DD/YYYY  hh:mm A')}
        </span>
      ),
    },
    {
      headerName: 'Pages',
      sortable: false,
      field: 'pages',
      minWidth: 80,

      headerClass: 'center-aligned-header ml-2',

      cellClass: 'text-center flex items-center justify-center',
      cellRenderer: (params: any) => (
        <span className='text-[#667085] font-semibold text-sm rounded-md bg-[#EAECF0] py-1 px-2'>
          0{params?.data?.pageCount || 0}
        </span>
      ),
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 150,
      flex: 1.5,
      headerClass: 'center-aligned-header pr-4',
      cellClass: 'text-left flex items-center justify-start',
      cellRenderer: (params: any) => {
        const { status, documentSignData } = params.data
        return (
          <DocumentStatus status={status} documentSignData={documentSignData} isFolderView={isFolderView} />
        )
      },
    },
    {
      headerName: 'Actions',
      field: 'actions',
      flex: 1,
      minWidth: 180,
      headerClass: 'center-aligned-header ml-2',
      cellClass: 'text-center flex items-center w-full justify-center',
      cellRenderer: (params: any) => (
        <div className="flex gap-1 justify-center items-center w-full text-center">
          <DocumentsTableActionButton row={params.data} documents={documents} setDocuments={setDocuments} />
        </div>
      ),
    },
  ])

  const defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
  }
  if (isFolderView) {
    return (
      <div className='mt-4'>
        {loading ? (
          <div className='grid grid-cols-1 gap-3'>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className='border border-[#EAECF0] rounded-lg p-4 animate-pulse bg-white flex items-center justify-between'
              >
                <div className='flex gap-3 items-center'>
                  <div className='w-10 h-10 bg-gray-200 rounded-md' />
                  <div className='flex-1 space-y-2'>
                    <div className='w-40 h-4 bg-gray-200 rounded' />
                    <div className='w-24 h-3 bg-gray-200 rounded' />
                  </div>
                </div>
                <div className='w-8 h-8 bg-gray-200 rounded-md' />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <NoDocumentsFound />
        ) : (
          <div className='grid grid-cols-1 gap-3 mb-4'>
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className='w-full h-full bg-white rounded-lg border transition-all hover:bg-muted/50 border-border'
              >
                <CardContent className='p-3'>
                  <div className='flex gap-3 items-center min-w-0'>
                    <div className='bg-[#F2F4FF] text-[#3353F8] border border-[#DCE2FF] rounded-lg p-2'>
                      <Image
                        alt={doc.title}
                        src={
                          doc.pdfType === 'pdf'
                            ? '/assets/img/pdf-icon.svg'
                            : '/assets/img/docx-icon.svg'
                        }
                        width={24}
                        height={24}
                      />
                    </div>

                    <div className='flex justify-between items-center w-full min-w-0'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='flex flex-col min-w-0 text-sm font-semibold text-[#333333]'>
                          <span className='truncate'>
                            {doc.documentSignData?.['0']?.data?.title?.trim() ||
                              doc.title}
                          </span>
                          <div className='flex items-center mt-1 space-x-2 text-xs truncate text-muted-foreground'>
                            <span className='text-xs text-[#535862] text-center'>
                              <DocumentStatus
                                status={doc.status}
                                isFolderView={isFolderView}
                                documentSignData={doc.documentSignData}
                              />
                            </span>
                            <span>•</span>
                            <span>
                              {moment(doc.createdAt).format(
                                'MM/DD/YYYY  hh:mm A',
                              )}
                            </span>
                          </div>
                        </h3>
                      </div>

                      <div className='flex flex-col gap-2 items-end ml-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='p-0 w-8 h-8 border'
                              data-testid='folder-card-more-button'
                            >
                              <MoreVertical className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DocumentsTableActionButton
                              row={doc as any}
                              documents={documents}
                              isFolderView={isFolderView}
                              setDocuments={setDocuments}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className='overflow-x-auto rounded-lg ag-theme-alpine'
      style={{
        width: '100%',
        height: documents.length ? `${Math.max(documents.length * 64 + 48 + 80, 200)}px` : `100%`,
        position: 'relative',
        background: '#fff',
      }}
    >
      {loading ? (
        <div className='p-4 w-full h-full'>
          <div className='space-y-2'>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className='border border-[#EAECF0] rounded-md p-3 animate-pulse'
              >
                <div className='grid grid-cols-12 gap-3 items-center'>
                  <div className='flex col-span-4 gap-2 items-center'>
                    <div className='w-6 h-6 bg-gray-200 rounded'></div>
                    <div className='flex-1'>
                      <div className='mb-1 w-40 h-4 bg-gray-200 rounded'></div>
                      <div className='w-24 h-3 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='w-28 h-4 bg-gray-200 rounded'></div>
                  </div>
                  <div className='col-span-2'>
                    <div className='flex -space-x-2'>
                      <div className='w-8 h-8 bg-gray-200 rounded-full border-2 border-white'></div>
                      <div className='w-8 h-8 bg-gray-200 rounded-full border-2 border-white'></div>
                      <div className='w-8 h-8 bg-gray-200 rounded-full border-2 border-white'></div>
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <div className='w-32 h-4 bg-gray-200 rounded'></div>
                  </div>
                  <div className='flex col-span-1 justify-center'>
                    <div className='w-10 h-6 bg-gray-200 rounded-md'></div>
                  </div>
                  <div className='flex col-span-1 justify-center'>
                    <div className='w-24 h-4 bg-gray-200 rounded'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : documents.length === 0 ? (
        <NoDocumentsFound />
      ) : (
          <AgGridReact
            rowData={documents}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            suppressCellFocus
            headerHeight={48}
            rowHeight={64}
            theme='legacy'
            modules={[AllCommunityModule]}
            onSortChanged={(event: SortChangedEvent) => {
              const sortModel = event.api
                .getColumnState()
                .filter((col) => col.sort)
                .map((col) => ({
                  field: col.colId,
                  order: col.sort as 'asc' | 'desc',
                }))
              console.log('Sort info:', sortModel)
            }}
          />
      )}
    </div>
  )
}
