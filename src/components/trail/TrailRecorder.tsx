'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { Play, Pause, Square, MapPin, Clock, Navigation, Zap, Trophy, AlertCircle, Crosshair } from 'lucide-react'
import { useTrailRecording } from '@/hooks/useTrailRecording'
import { useTrailCompletion } from '@/hooks/useTrailCompletion'
import { useGPSTracking } from '@/hooks/useGPSTracking'
import { formatDistance, formatDuration, formatSpeed } from '@/lib/trailUtils'
import { CompletedTrail } from '@/types/trail'
import { LiveTrailMap } from '@/components/maps/LiveTrailMap'

interface TrailRecorderProps {
  onTrailCompleted?: (trail: CompletedTrail) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  className?: string
}

export function TrailRecorder({
  onTrailCompleted,
  onRecordingStart,
  onRecordingStop,
  className = ''
}: TrailRecorderProps) {
  const [showStartModal, setShowStartModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [trailName, setTrailName] = useState('')
  const [trailDescription, setTrailDescription] = useState('')
  const [completionLocation, setCompletionLocation] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [currentStats, setCurrentStats] = useState({
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    currentSpeed: 0
  })
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isStartingRecording, setIsStartingRecording] = useState(false)

  // Refs for focus management
  const trailNameInputRef = useRef<HTMLInputElement>(null)

  // GPS tracking for getting current location when not recording
  const {
    trackingState,
    currentPosition: gpsPosition,
    requestPermission,
    isSupported: gpsSupported
  } = useGPSTracking({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000,
  })

  const {
    recording,
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getCurrentStats,
  } = useTrailRecording()

  // Get current GPS position and recorded path for the map
  const currentPosition = recording?.coordinates[recording.coordinates.length - 1] || gpsPosition
  const recordedPath = recording?.coordinates || []

  const {
    isProcessing,
    completionResult,
    error: completionError,
    verifyCompletion,
    completeTrail,
    mintNFT,
    reset: resetCompletion
  } = useTrailCompletion()

  // Track recording start time
  useEffect(() => {
    if (isRecording && !recordingStartTime) {
      setRecordingStartTime(new Date())
    } else if (!isRecording) {
      setRecordingStartTime(null)
    }
  }, [isRecording, recordingStartTime])

  // Update stats every second when recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRecording && !isPaused && recordingStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - recordingStartTime.getTime()) / 1000)

        const newStats = getCurrentStats()

        // Use our calculated duration if it's different
        setCurrentStats({
          ...newStats,
          duration: duration
        })
      }, 1000) // Update every second
    } else if (!isRecording) {
      // Reset stats when not recording
      setCurrentStats({
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        currentSpeed: 0
      })
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, isPaused, recordingStartTime, getCurrentStats])

  // Also update stats immediately when recording state changes
  useEffect(() => {
    if (isRecording) {
      const newStats = getCurrentStats()
      setCurrentStats(newStats)
    }
  }, [isRecording, recording, getCurrentStats])

  const handleStartRecording = async () => {
    if (!trailName.trim() || isStartingRecording) return

    setIsStartingRecording(true)
    try {
      console.log('Starting recording with name:', trailName.trim())
      const success = await startRecording(trailName.trim(), trailDescription.trim() || undefined)
      console.log('Recording start result:', success)

      if (success) {
        setShowStartModal(false)
        setTrailName('')
        setTrailDescription('')
        onRecordingStart?.()
      } else {
        alert('Failed to start recording. Please check location permissions.')
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('An error occurred while starting recording. Please try again.')
    } finally {
      setIsStartingRecording(false)
    }
  }

  // Focus management for modal
  useEffect(() => {
    if (showStartModal && trailNameInputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        trailNameInputRef.current?.focus()
      }, 100)
    }
  }, [showStartModal])

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStartModal) {
        if (e.key === 'Escape') {
          setShowStartModal(false)
        } else if (e.key === 'Enter' && trailName.trim()) {
          handleStartRecording()
        }
      }
    }

    if (showStartModal) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showStartModal, trailName])

  const handleStopRecording = () => {
    const recordingData = stopRecording()
    if (recordingData) {
      // Verify completion and show modal
      const result = verifyCompletion(recordingData)
      setShowCompletionModal(true)
      onRecordingStop?.()
    }
  }

  const handleCompleteTrail = async () => {
    if (!recording) return

    const completedTrail = await completeTrail(
      recording,
      completionLocation.trim() || 'Unknown Location',
      completionNotes.trim() || undefined
    )

    if (completedTrail) {
      setShowCompletionModal(false)
      setCompletionLocation('')
      setCompletionNotes('')
      resetCompletion()

      if (onTrailCompleted) {
        onTrailCompleted(completedTrail)
      }
    }
  }

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  const handleGetLocation = async () => {
    if (!gpsSupported) {
      alert('GPS is not supported on this device')
      return
    }

    setIsGettingLocation(true)
    try {
      const success = await requestPermission()
      if (!success) {
        alert('Location permission denied. Please enable location access in your browser settings.')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Failed to get location. Please check your GPS settings.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  if (!isRecording) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Live Trail Map - Show even when not recording */}
        <div className="mb-6">
          <LiveTrailMap
            currentPosition={currentPosition}
            recordedPath={recordedPath}
            isRecording={isRecording}
            className="w-full"
          />
        </div>

        <div className="text-center">
          <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Trail Recording</h3>
          <p className="text-gray-600 mb-6">
            Record your hiking trail with GPS tracking to earn TREK tokens and mint NFTs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* Get Location Button */}
            {!trackingState.hasPermission && (
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crosshair className="h-5 w-5" />
                <span>{isGettingLocation ? 'Getting Location...' : 'Get My Location'}</span>
              </button>
            )}

            {/* Start Recording Button */}
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Recording</span>
            </button>
          </div>

          {/* GPS Status Message */}
          {trackingState.error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">{trackingState.error}</p>
            </div>
          )}

          {trackingState.hasPermission && gpsPosition && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                GPS location found! You can now start recording your trail.
              </p>
            </div>
          )}
        </div>

        {/* Start Recording Modal */}
        {showStartModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowStartModal(false)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Start Trail Recording
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trail Name *
                          </label>
                          <input
                            ref={trailNameInputRef}
                            type="text"
                            value={trailName}
                            onChange={(e) => setTrailName(e.target.value)}
                            placeholder="e.g., Morning Hike to Ella Rock"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={trailDescription}
                            onChange={(e) => setTrailDescription(e.target.value)}
                            placeholder="Add notes about your trail..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={!trailName.trim() || isStartingRecording}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStartingRecording ? 'Starting...' : 'Start Recording'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStartModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Recording Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{recording?.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={isPaused ? 'w-2 h-2 rounded-full bg-yellow-500' : 'w-2 h-2 rounded-full bg-red-500 animate-pulse'} />
            <span>{isPaused ? 'Paused' : 'Recording'}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handlePauseResume}
            title={isPaused ? 'Resume recording' : 'Pause recording'}
            className={`p-2 rounded-lg transition-colors ${
              isPaused
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleStopRecording}
            title="Stop recording"
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Live Trail Map */}
      <div className="mb-6">
        <LiveTrailMap
          currentPosition={currentPosition}
          recordedPath={recordedPath}
          isRecording={isRecording}
          className="w-full"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Navigation className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Distance</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatDistance(currentStats.distance)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Duration</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatDuration(currentStats.duration)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Avg Speed</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatSpeed(currentStats.averageSpeed)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Points</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {recording?.coordinates.length || 0}
          </div>
        </div>
      </div>

      {/* Current Speed */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 mb-1">Current Speed</div>
          <div className="text-2xl font-bold text-green-600">
            {formatSpeed(currentStats.currentSpeed)}
          </div>
        </div>
      </div>

      {/* Description */}
      {recording?.description && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-sm text-gray-600">{recording.description}</div>
        </div>
      )}

      {/* Trail Completion Modal */}
      {showCompletionModal && completionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              {completionResult.completed ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">Trail Completed!</h3>
                  <p className="text-green-700">Congratulations on completing your trail!</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-900">Trail Incomplete</h3>
                  <p className="text-yellow-700">Your trail doesn't meet completion requirements</p>
                </>
              )}
            </div>

            {/* Completion Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatDistance(completionResult.distance)}
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatDuration(completionResult.duration)}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {completionResult.trekTokensEarned}
                </div>
                <div className="text-sm text-gray-600">TREK Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {completionResult.nftEligible ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-600">NFT Eligible</div>
              </div>
            </div>

            {/* Completion percentage */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Completion</span>
                <span>{completionResult.completionPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    completionResult.completed ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${completionResult.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Reasons for incompletion */}
            {completionResult.reasons && (
              <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 mb-1">Issues:</div>
                <ul className="text-sm text-yellow-700 list-disc list-inside">
                  {completionResult.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {completionResult.completed && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={completionLocation}
                    onChange={(e) => setCompletionLocation(e.target.value)}
                    placeholder="e.g., Ella Rock, Sri Lanka"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add notes about your experience..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Error display */}
            {completionError && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-700">{completionError}</div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false)
                  resetCompletion()
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {completionResult.completed ? 'Cancel' : 'Close'}
              </button>
              {completionResult.completed && (
                <button
                  type="button"
                  onClick={handleCompleteTrail}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Saving...' : 'Complete Trail'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
