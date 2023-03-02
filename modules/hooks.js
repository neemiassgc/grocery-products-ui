import { useState, useEffect } from "react"

export function useSmallScreenMediaQuery() {
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    if (!smallScreen && window.innerWidth <= 768) {
      setSmallScreen(true);
      return;
    }

    const updateSize = e => {
      if (e.matches && !smallScreen)
        setSmallScreen(true)
      else if (!e.matches && smallScreen)
        setSmallScreen(false)
    };
    let mediaQueryDetection = window.matchMedia("(max-width: 768px)");
    mediaQueryDetection.addEventListener("change", updateSize)

    return () => {
      if (mediaQueryDetection)
        mediaQueryDetection.removeEventListener("change", updateSize)
    }
  }, [smallScreen]);

  return smallScreen;
}