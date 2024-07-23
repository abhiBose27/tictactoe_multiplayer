import { useEffect, useState } from "react"


export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const updateDimensions = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight, 
        })
    }

    useEffect(() => {
      
        // Add event listener
        window.addEventListener("resize", updateDimensions);
        // Call handler right away so state gets updated with initial window size
        
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", updateDimensions);
    }, [])

    return windowSize;
}