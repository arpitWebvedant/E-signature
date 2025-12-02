'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import moment from 'moment'
import axiosInstance from '@/config/apiConfig'
import { ListFilter, AlarmClock } from 'lucide-react'


const RecentActivity = () => {
  const userId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')?.id
      : undefined
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetchRecentActivity()
  }, [userId])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(
        `/api/v1/files/get-recent-activity/${userId}`,
      )
      setRecentActivity(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Skeleton placeholder array
  const skeletonArray = Array(10).fill(0)
  // console.log(recentActivity, 'recentActivity')
  const renderActivityData = (activity: any) => {
    const details = activity?.details || ''
    const activityType = activity?.activity || ''

    // extract basic data
    const nameMatch = details.match(/^([^()]+)\s*\(/)
    const emailMatch = details.match(/\(([^)]+)\)/)
    const docMatch = details.match(/"([^"]+)"/)
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown User'
    const email = emailMatch ? emailMatch[1].trim() : 'unknown'
    const docName = docMatch ? docMatch[1].trim() : 'unknown document'

    let title = 'Unknown Activity'
    let description = ''

    switch (activityType) {
      case 'sign':
        title = `${name} signed the Document`
        description = `${docName} was signed by ${email}`
        break

      case 'send':
        title = `${name} shared the Document`
        const toEmailMatch = details.match(/to\s*\(([^)]+)\)/)
        const toEmail = toEmailMatch
          ? toEmailMatch[1].trim()
          : 'unknown recipient'
        description = `${docName} was shared with ${toEmail}`
        break

      case 'update':
        title = `${name} updated the Document`
        description = `${docName} was updated by ${email}`
        break

      case 'upload':
        title = `${name} uploaded the Document`
        description = `${docName} was uploaded by ${email}`
        break

      case 'reject':
      case 'DOCUMENT_REJECTED':
        title = `${name} rejected the Document`
        description = `${docName} was rejected by ${email}`
        break

      case 'DOCUMENT_SIGNED':
        title = `Document Signed`
        description = `${docName} was signed by ${email}`
        break

      default:
        title = 'Unknown Activity'
        description = details
        break
    }

    return { title, details: description }
  }
  return (
    <div className='bg-white relative max-h-[calc(100vh+1.5rem)] overflow-y-hidden hover:overflow-y-auto border border-[#EAECF0] rounded-xl'>
      <div className='p-2 sticky top-0 z-10 border-b bg-white border-[#EAECF0] flex justify-between items-center'>
        <div className='flex gap-2 items-center text-sm font-medium'>
          <AlarmClock size={18} className='text-[#1F1F1F]' />
          <p className='text-[#1F1F1F]'>Recent Activity</p>
        </div>
        <div className='w-6 h-6 rounded-lg border border-[#D6DDFE] flex justify-center items-center cursor-pointer transition-all duration-200 ease-in hover:-translate-y-[1px] hover:border-[#C1CBFC] hover:shadow hover:shadow-blue-100'>
          <ListFilter className='text-[#3353F8]' size={14} />
        </div>
      </div>
      <div className='flex flex-col gap-2 p-2'>
        {loading
          ? skeletonArray.map((_, index) => (
            <div
              key={index}
              className='p-2 rounded border border-[#EAECF0] flex items-center gap-2 animate-pulse'
            >
              <div className='flex-shrink-0 w-10 h-10 bg-gray-200 rounded-xl'></div>
              <div className='flex flex-col flex-1 gap-1'>
                <div className='w-3/4 h-4 bg-gray-200 rounded'></div>
                <div className='w-1/2 h-3 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))
          : recentActivity.map((activity, index) => {
            const { title, details } = renderActivityData(activity)

              return (
                <div
                  key={index}
                  className='p-2 rounded border border-[#EAECF0] flex flex-col items-start gap-1'
                >
                  <p className='text-xs text-[#787878] font-normal'>
                    {moment(activity?.createdAt).format(
                      'MM/DD/YYYY | hh:mm A',
                    )}
                  </p>
                  <h5 className='text-sm font-medium text-primary'>{activity?.details}</h5>
                  <p className='text-[#787878] text-xs font-medium leading-tight'>
                    {details}
                  </p>
                </div>
              )
            })}
      </div>
    </div>
  )
}

export default RecentActivity
