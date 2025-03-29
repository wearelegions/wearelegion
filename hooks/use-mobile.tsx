import * as React from "react"

// Adjust breakpoint for better mobile experience
const MOBILE_BREAKPOINT = 640 // Changed from 768 to better match modern devices

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkMobile)
    checkMobile() // Initial check
    
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  return !!isMobile
}
