"use client"

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Minimize } from 'lucide-react'

interface EnhancedVideoPlayerProps {
  src: string
  title?: string
  isAuthenticated?: boolean
  isEnrolled?: boolean
  userEmail?: string
  userName?: string
  onLoginRequired?: () => void
  onSubscriptionRequired?: () => void
}

export default function EnhancedVideoPlayer({ 
  src, 
  title, 
  isAuthenticated = false, 
  isEnrolled = false,
  userEmail,
  userName,
  onLoginRequired,
  onSubscriptionRequired
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [watermarkPosition, setWatermarkPosition] = useState({ top: 10, left: 10 })

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const FREE_PREVIEW_TIME = 60 // 1 minute in seconds

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      const video = videoRef.current
      if (!video) return
      
      setCurrentTime(video.currentTime)
      
      // Check if user needs to login (1 minute limit for non-authenticated users only)
      if (!isAuthenticated && video.currentTime >= FREE_PREVIEW_TIME) {
        video.pause()
        setIsPlaying(false)
        setShowLoginPrompt(true)
      }
    }
    const updateDuration = () => setDuration(video.duration)
    const updateBuffer = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('progress', updateBuffer)

    // Screen recording protection
    const preventCapture = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
      }
    }
    video.addEventListener('enterpictureinpicture', preventCapture)

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('progress', updateBuffer)
      video.removeEventListener('enterpictureinpicture', preventCapture)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = vol
      setVolume(vol)
      setIsMuted(vol === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSpeedMenu(false)
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Disable right-click and context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  // Prevent keyboard shortcuts for download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+Shift+S (save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        return false
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close speed menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSpeedMenu && !(e.target as Element).closest('.speed-menu-container')) {
        setShowSpeedMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSpeedMenu])

  // Change watermark position every 4-6 seconds to prevent screen recording
  useEffect(() => {
    if (!isAuthenticated) return
    
    const changePosition = () => {
      const positions = [
        { top: 10, left: 10 },
        { top: 10, right: 10 },
        { bottom: 60, left: 10 },
        { bottom: 60, right: 10 },
        { top: '50%', left: 10 },
        { top: '50%', right: 10 },
        { top: 10, left: '50%' },
        { bottom: 60, left: '50%' },
        { top: '30%', left: '30%' },
        { top: '30%', right: '30%' },
        { bottom: 100, left: '30%' },
        { bottom: 100, right: '30%' },
      ]
      const randomPosition = positions[Math.floor(Math.random() * positions.length)]
      setWatermarkPosition(randomPosition as any)
    }
    
    // Random interval between 4-6 seconds (less distracting)
    const getRandomInterval = () => Math.floor(Math.random() * 2000) + 4000 // 4000-6000ms
    
    const scheduleNextChange = () => {
      const timeout = setTimeout(() => {
        changePosition()
        scheduleNextChange()
      }, getRandomInterval())
      return timeout
    }
    
    changePosition() // Set initial position
    const timeout = scheduleNextChange()
    
    return () => clearTimeout(timeout)
  }, [isAuthenticated])

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0
  const bufferedPercentage = duration ? (buffered / duration) * 100 : 0

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black group ${isFullscreen ? 'w-screen h-screen' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onContextMenu={handleContextMenu}
    >
      {/* Screen Recording Protection Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 mix-blend-difference opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-transparent to-blue-500" />
      </div>

      {/* User Watermark - Subtle but changes position to prevent recording */}
      {isAuthenticated && userEmail && (
        <div 
          className="absolute pointer-events-none z-20 text-white/20 text-xs font-medium transition-all duration-700 ease-in-out"
          style={{
            ...watermarkPosition,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {userEmail}
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onContextMenu={handleContextMenu}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        onClick={togglePlay}
      />

      {/* Login Required Prompt */}
      {showLoginPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h3>
            <p className="text-gray-600 mb-6">
              You've watched 1 minute of free preview. Please login to continue watching the full video with anti-piracy watermark.
            </p>
            <button
              onClick={() => {
                setShowLoginPrompt(false)
                onLoginRequired?.()
              }}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all"
            >
              Login to Continue
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-full p-6">
            <Play className="h-16 w-16 text-white" />
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent ${isFullscreen ? 'p-6' : 'p-4'} transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Enhanced Progress Bar */}
        <div className={`${isFullscreen ? 'mb-6' : 'mb-3'} group/progress`}>
          <div className="relative">
            {/* Buffered Progress */}
            <div className="absolute top-0 left-0 h-1.5 bg-gray-700 rounded-full w-full">
              <div 
                className="h-full bg-gray-600 rounded-full transition-all"
                style={{ width: `${bufferedPercentage}%` }}
              />
            </div>
            
            {/* Played Progress */}
            <div className="absolute top-0 left-0 h-1.5 w-full">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Interactive Seek Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="relative w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer z-10 group-hover/progress:h-2 transition-all"
              style={{
                background: 'transparent',
              }}
            />
          </div>
          
          <div className={`flex justify-between ${isFullscreen ? 'text-base' : 'text-xs'} text-white mt-2`}>
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? (
                <Pause className={`${isFullscreen ? 'h-8 w-8' : 'h-6 w-6'}`} />
              ) : (
                <Play className={`${isFullscreen ? 'h-8 w-8' : 'h-6 w-6'}`} />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                ) : (
                  <Volume2 className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={`${isFullscreen ? 'w-28' : 'w-20'} h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600`}
              />
              {isFullscreen && (
                <span className="text-white text-sm ml-2">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              )}
            </div>

            {/* Title */}
            {title && isFullscreen && (
              <span className="text-white text-lg font-medium ml-4">{title}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Settings - Speed Control */}
            <div className="relative speed-menu-container">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Settings className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                {isFullscreen && <span className="text-sm">{playbackSpeed}x</span>}
              </button>

              {/* Speed Menu Dropdown */}
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[120px] z-50">
                  <div className="px-3 py-1 text-xs text-gray-400 font-semibold border-b border-gray-700 mb-1">
                    Playback Speed
                  </div>
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors ${
                        playbackSpeed === speed 
                          ? 'text-red-500 font-semibold bg-gray-800' 
                          : 'text-white'
                      }`}
                    >
                      {speed === 1 ? 'Normal' : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              ) : (
                <Maximize className={`${isFullscreen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
