'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../common/use-debounced-value'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'

export const DocumentSearch = ({
  initialValue = '',
}: {
  initialValue?: string
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500)

  const handleSearch = useCallback(
    (term: string) => {
      if (!pathname) return
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      if (term) {
        params.set('q', term)
      } else {
        params.delete('q')
      }
      const newUrl = `${pathname}?${params.toString()}`
      router.push(newUrl)
    },
    [pathname, searchParams, router],
  )

  useEffect(() => {
    const currentQueryParam = searchParams.get('q') || ''
    if (debouncedSearchTerm !== currentQueryParam) {
      handleSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, searchParams, handleSearch])

  return (
    <div className="relative">
      <Input
        type='search'
        placeholder='Search'
        className="bg-white focus-visible:ring-[#3353F8] shadow-[0px 1px 2px 0px #1018280D] border !border-[#EAECF0] rounded-lg pl-8 placeholder:text-[#787878] text-base"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="absolute text-[#787878] left-3 top-1/2 -translate-y-1/2" size={18}/>
    </div>
  )
}
