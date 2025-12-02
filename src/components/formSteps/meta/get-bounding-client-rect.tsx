export const getBoundingClientRect = (element: HTMLElement, relativeToContainer?: HTMLElement | null) => {
  const rect = element.getBoundingClientRect()
  const containerRect = relativeToContainer?.getBoundingClientRect()
  const isBodyContainer = !relativeToContainer || relativeToContainer === document.body

  const { width, height } = rect

  if (isBodyContainer) {
    // Absolute positioning for body container
    return { 
      top: rect.top + window.scrollY, 
      left: rect.left + window.scrollX, 
      width, 
      height 
    }
  } else {
    // Relative positioning for custom container
    return { 
      top: rect.top - (containerRect?.top || 0), 
      left: rect.left - (containerRect?.left || 0), 
      width, 
      height 
    }
  }
}