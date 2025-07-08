'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Battery,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  EmergencyDetection as EmergencyDetectionType,
  EmergencyContactAlert,
  UserFitnessProfile,
  GPSCoordinate 
} from '@/types/trail'
import { aiSafetyService } from '@/services/aiSafetyService'

interface EmergencyDetectionProps {
  userProfile: UserFitnessProfile
  isHiking: boolean
  currentLocation?: GPSCoordinate
  onEmergencyTriggered?: (emergency: EmergencyDetectionType) => void
}

export function EmergencyDetection({ 
  userProfile, 
  isHiking, 
  currentLocation,
  onEmergencyTriggered 
}: EmergencyDetectionProps) {
  const [emergencyState, setEmergencyState] = useState<EmergencyDetectionType>({
    isMonitoring: false,
    fallDetected: false,
    noMovementDetected: false,
    offTrailDetected: false,
    lastMovement: new Date().toISOString(),
    alertsSent: 0,
    emergencyTriggered: false
  })

  const [batteryLevel, setBatteryLevel] = useState<number>(100)
  const [lastCheckIn, setLastCheckIn] = useState<string>(new Date().toISOString())
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)

  const lastLocationRef = useRef<GPSCoordinate | null>(null)
  const noMovementTimerRef = useRef<NodeJS.Timeout | null>(null)
  const checkInTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isHiking && userProfile.emergencyContacts.length > 0) {
      startEmergencyMonitoring()
    } else {
      stopEmergencyMonitoring()
    }

    return () => {
      stopEmergencyMonitoring()
    }
  }, [isHiking, userProfile.emergencyContacts.length])

  useEffect(() => {
    if (currentLocation) {
      handleLocationUpdate(currentLocation)
    }
  }, [currentLocation])

  useEffect(() => {
    // Monitor battery level
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }
  }, [])

  const startEmergencyMonitoring = () => {
    console.log('🚨 Starting emergency monitoring')
    
    setEmergencyState(prev => ({
      ...prev,
      isMonitoring: true,
      lastMovement: new Date().toISOString()
    }))

    // Start AI safety service monitoring
    aiSafetyService.startEmergencyMonitoring(userProfile)

    // Start periodic check-ins
    startCheckInTimer()

    // Start no-movement detection
    startNoMovementTimer()
  }

  const stopEmergencyMonitoring = () => {
    console.log('🚨 Stopping emergency monitoring')
    
    setEmergencyState(prev => ({
      ...prev,
      isMonitoring: false
    }))

    aiSafetyService.stopEmergencyMonitoring()

    if (noMovementTimerRef.current) {
      clearTimeout(noMovementTimerRef.current)
    }

    if (checkInTimerRef.current) {
      clearTimeout(checkInTimerRef.current)
    }
  }

  const handleLocationUpdate = (location: GPSCoordinate) => {
    const now = new Date().toISOString()
    
    // Check if user has moved (movement detection)
    if (lastLocationRef.current) {
      const distance = calculateDistance(lastLocationRef.current, location)
      
      if (distance > 5) { // Moved more than 5 meters
        setEmergencyState(prev => ({
          ...prev,
          lastMovement: now,
          noMovementDetected: false
        }))
        
        // Reset no-movement timer
        resetNoMovementTimer()
      }
    }

    lastLocationRef.current = location
  }

  const startNoMovementTimer = () => {
    const timeoutMinutes = 30 // 30 minutes of no movement triggers alert
    
    noMovementTimerRef.current = setTimeout(() => {
      console.log('🚨 No movement detected for 30 minutes')
      
      setEmergencyState(prev => ({
        ...prev,
        noMovementDetected: true
      }))
      
      triggerEmergencyAlert('no_movement')
    }, timeoutMinutes * 60 * 1000)
  }

  const resetNoMovementTimer = () => {
    if (noMovementTimerRef.current) {
      clearTimeout(noMovementTimerRef.current)
    }
    startNoMovementTimer()
  }

  const startCheckInTimer = () => {
    const checkInInterval = 60 * 60 * 1000 // 1 hour
    
    checkInTimerRef.current = setTimeout(() => {
      setLastCheckIn(new Date().toISOString())
      // In production, this would send a check-in to emergency contacts
      console.log('📱 Automatic check-in sent')
      startCheckInTimer() // Schedule next check-in
    }, checkInInterval)
  }

  const triggerEmergencyAlert = (type: 'fall' | 'no_movement' | 'off_trail' | 'low_battery' | 'manual') => {
    console.log(`🚨 Emergency alert triggered: ${type}`)
    
    const newEmergencyState = {
      ...emergencyState,
      emergencyTriggered: true,
      alertsSent: emergencyState.alertsSent + 1
    }

    switch (type) {
      case 'fall':
        newEmergencyState.fallDetected = true
        break
      case 'no_movement':
        newEmergencyState.noMovementDetected = true
        break
      case 'off_trail':
        newEmergencyState.offTrailDetected = true
        break
    }

    setEmergencyState(newEmergencyState)
    onEmergencyTriggered?.(newEmergencyState)

    // Show emergency modal with countdown
    setShowEmergencyModal(true)
    setCountdown(30) // 30 second countdown to cancel

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          sendEmergencyAlert(type)
          setShowEmergencyModal(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendEmergencyAlert = (type: string) => {
    // In production, this would send SMS/email to emergency contacts
    console.log('📱 Sending emergency alert to contacts:', userProfile.emergencyContacts)
    
    const message = generateEmergencyMessage(type)
    console.log('Emergency message:', message)
    
    // Simulate sending alerts
    userProfile.emergencyContacts.forEach(contact => {
      console.log(`📱 Alert sent to ${contact.name} (${contact.phone})`)
    })
  }

  const generateEmergencyMessage = (type: string): string => {
    const location = currentLocation 
      ? `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`
      : 'Location unavailable'
    
    const messages = {
      fall: `🚨 EMERGENCY: Potential fall detected for hiker. Location: ${location}. Please check on them immediately.`,
      no_movement: `🚨 EMERGENCY: No movement detected for 30+ minutes. Location: ${location}. Please check on them.`,
      off_trail: `🚨 EMERGENCY: Hiker has gone significantly off-trail. Location: ${location}. Please check on them.`,
      low_battery: `🚨 WARNING: Hiker's device battery is critically low (${batteryLevel}%). Last location: ${location}.`,
      manual: `🚨 EMERGENCY: Manual emergency alert triggered. Location: ${location}. Please provide assistance.`
    }
    
    return messages[type as keyof typeof messages] || 'Emergency alert triggered'
  }

  const cancelEmergencyAlert = () => {
    setShowEmergencyModal(false)
    setCountdown(0)
    setEmergencyState(prev => ({
      ...prev,
      emergencyTriggered: false,
      fallDetected: false,
      noMovementDetected: false,
      offTrailDetected: false
    }))
  }

  const manualEmergencyTrigger = () => {
    triggerEmergencyAlert('manual')
  }

  const calculateDistance = (pos1: GPSCoordinate, pos2: GPSCoordinate): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = pos1.latitude * Math.PI / 180
    const φ2 = pos2.latitude * Math.PI / 180
    const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString()
  }

  // Check for low battery emergency
  useEffect(() => {
    if (batteryLevel <= 20 && emergencyState.isMonitoring && !emergencyState.emergencyTriggered) {
      triggerEmergencyAlert('low_battery')
    }
  }, [batteryLevel, emergencyState.isMonitoring, emergencyState.emergencyTriggered])

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Emergency Detection</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            emergencyState.isMonitoring 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-600 bg-gray-50'
          }`}>
            {emergencyState.isMonitoring ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        <div className="space-y-4">
          {/* Monitoring Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Movement</div>
                <div className="text-xs text-gray-600">
                  Last: {formatTime(emergencyState.lastMovement)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Battery</div>
                <div className={`text-xs ${batteryLevel <= 20 ? 'text-red-600' : 'text-gray-600'}`}>
                  {batteryLevel}%
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">Emergency Contacts</span>
            </div>
            <div className="text-sm text-gray-600">
              {userProfile.emergencyContacts.length > 0 ? (
                <div className="space-y-1">
                  {userProfile.emergencyContacts.slice(0, 2).map(contact => (
                    <div key={contact.id} className="flex justify-between">
                      <span>{contact.name}</span>
                      <span className="text-gray-500">{contact.phone}</span>
                    </div>
                  ))}
                  {userProfile.emergencyContacts.length > 2 && (
                    <div className="text-gray-500">
                      +{userProfile.emergencyContacts.length - 2} more contacts
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-orange-600">No emergency contacts configured</div>
              )}
            </div>
          </div>

          {/* Detection Status */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`flex items-center space-x-1 ${
              emergencyState.fallDetected ? 'text-red-600' : 'text-gray-600'
            }`}>
              {emergencyState.fallDetected ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <span>Fall</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              emergencyState.noMovementDetected ? 'text-red-600' : 'text-gray-600'
            }`}>
              {emergencyState.noMovementDetected ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <span>Movement</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              emergencyState.offTrailDetected ? 'text-red-600' : 'text-gray-600'
            }`}>
              {emergencyState.offTrailDetected ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <span>On Trail</span>
            </div>
          </div>

          {/* Manual Emergency Button */}
          {emergencyState.isMonitoring && (
            <div className="pt-4 border-t">
              <button
                onClick={manualEmergencyTrigger}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>EMERGENCY ALERT</span>
              </button>
              <div className="text-xs text-gray-500 text-center mt-2">
                Press to manually trigger emergency alert
              </div>
            </div>
          )}

          {/* Last Check-in */}
          <div className="text-xs text-gray-500 text-center">
            Last check-in: {formatTime(lastCheckIn)}
          </div>
        </div>
      </div>

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Alert</h3>
              <p className="text-gray-600 mb-4">
                Emergency contacts will be notified in {countdown} seconds
              </p>
              <div className="space-y-3">
                <button
                  onClick={cancelEmergencyAlert}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  I'm OK - Cancel Alert
                </button>
                <button
                  onClick={() => {
                    setCountdown(0)
                    sendEmergencyAlert('manual')
                    setShowEmergencyModal(false)
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Send Alert Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
