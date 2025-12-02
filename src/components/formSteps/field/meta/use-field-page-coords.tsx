import { useCallback, useEffect, useState } from 'react'
import type { Field } from '@prisma/client'
import { PDF_VIEWER_PAGE_SELECTOR } from '@/components/constants/pdf-viewer'

export const useFieldPageCoords = (field: Field, portalTarget?: HTMLElement | null) => {
  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  })

  const calculateCoords = useCallback(() => {
    const $page = document.querySelector<HTMLElement>(
      `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.page}"]`,
    )

    if (!$page) {
      return
    }

    const pageRect = $page.getBoundingClientRect()
    const containerRect = portalTarget?.getBoundingClientRect()
    const isBodyPortal = !portalTarget || portalTarget === document.body

    const { height: pageHeight, width: pageWidth } = pageRect

    let top, left

    if (isBodyPortal) {
      // For body portal - absolute positioning
      top = pageRect.top + window.scrollY
      left = pageRect.left + window.scrollX
    } else {
      // For container portal - relative positioning
      top = pageRect.top - (containerRect?.top || 0)
      left = pageRect.left - (containerRect?.left || 0)
    }

    // Use the same calculation logic as in handleMouseClick
    const fieldX = (Number(field?.pageX || field.positionX) / 100) * pageWidth + left
    const fieldY = (Number(field?.pageY || field.positionY) / 100) * pageHeight + top
    const fieldHeight = (Number(field?.pageHeight || field.height) / 100) * pageHeight
    const fieldWidth = (Number(field?.pageWidth || field.width) / 100) * pageWidth

    setCoords({
      x: fieldX,
      y: fieldY,
      height: fieldHeight,
      width: fieldWidth,
    })
  }, [
    field.height,
    field.page,
    field.positionX,
    field.positionY,
    field.width,
    field.pageHeight,
    field.pageWidth,
    field.pageX,
    field.pageY,
    portalTarget,
  ])

  useEffect(() => {
    calculateCoords()
  }, [calculateCoords])

  useEffect(() => {
    const onResize = () => {
      calculateCoords()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize)
    }
  }, [calculateCoords])

  useEffect(() => {
    const $page = document.querySelector<HTMLElement>(
      `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.page}"]`,
    )

    if (!$page) return

    const observer = new ResizeObserver(() => {
      calculateCoords()
    })

    observer.observe($page)
    return () => observer.disconnect()
  }, [calculateCoords, field.page])

  return coords
}