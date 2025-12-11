import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if prompt was already dismissed
    const dismissed = localStorage.getItem('installPromptDismissed')
    const dismissedTime = localStorage.getItem('installPromptDismissedTime')
    
    // Show prompt again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!isInStandaloneMode) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show prompt after 30 seconds if not installed
    if (iOS && !isInStandaloneMode && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
    localStorage.setItem('installPromptDismissedTime', Date.now().toString())
  }

  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white rounded-lg shadow-xl border border-border-light z-50 animate-fade-in">
      <div className="p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-text-muted" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">ID</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary text-sm mb-1">
              Install InfraDealer App
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Get quick access to equipment listings, post ads faster, and never miss a deal!
            </p>
          </div>
        </div>

        {isIOS ? (
          // iOS Installation Instructions
          <div className="bg-bg rounded-lg p-3 mb-3">
            <p className="text-xs text-text-secondary mb-2 font-semibold">
              To install on iPhone/iPad:
            </p>
            <ol className="text-xs text-text-secondary space-y-1 ml-4 list-decimal">
              <li>
                Tap the <Share size={12} className="inline mx-1" /> Share button below
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : (
          // Android/Desktop Install Button
          <button
            onClick={handleInstallClick}
            className="w-full bg-accent hover:bg-accent-dark text-primary font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Install App
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="w-full text-text-muted text-xs py-2 hover:text-text-secondary transition-colors mt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt
