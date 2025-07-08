'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Navigation, MapPin, Crosshair } from 'lucide-react'
import { GPSCoordinate } from '@/types/trail'
import {
  calculateTotalDistance,
  formatDistance,
  calculateElevationGain,
  calculateAverageSpeed,
  formatSpeed,
  formatDuration
} from '@/lib/trailUtils'

interface LiveTrailMapProps {
  currentPosition: GPSCoordinate | null
  recordedPath: GPSCoordinate[]
  isRecording: boolean
  className?: string
}

export function LiveTrailMap({
  currentPosition,
  recordedPath,
  isRecording,
  className
}: LiveTrailMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const [ReactLeafletComponents, setReactLeafletComponents] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Leaflet and React-Leaflet on client side
  useEffect(() => {
    let mounted = true

    const loadLeaflet = async () => {
      try {
        setIsClient(true)

        const [leaflet, reactLeaflet] = await Promise.all([
          import('leaflet'),
          import('react-leaflet')
        ])

        if (!mounted) return

        setL(leaflet.default)
        setReactLeafletComponents(reactLeaflet)

        // Fix for default markers
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        setMapLoaded(true)
      } catch (error) {
        console.error('Failed to load Leaflet:', error)
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
    }
  }, [])

  // Create custom icons
  const { currentLocationIcon, startIcon } = useMemo(() => {
    if (!L) return { currentLocationIcon: null, startIcon: null }

    const currentLocationIcon = L.divIcon({
      html: `<div style="width: 20px; height: 20px; background-color: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'current-location-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    const startIcon = L.divIcon({
      html: `<div style="width: 24px; height: 24px; background-color: #10B981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</div>`,
      className: 'start-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    return { currentLocationIcon, startIcon }
  }, [L])

  // Calculate map center and bounds
  const { center, zoom } = useMemo(() => {
    if (currentPosition) {
      return {
        center: [currentPosition.latitude, currentPosition.longitude] as [number, number],
        zoom: 16
      }
    }

    // Default to Sri Lanka center if no position
    return {
      center: [7.8731, 80.7718] as [number, number],
      zoom: 8
    }
  }, [currentPosition])

  // Convert recorded path to polyline positions
  const polylinePositions = useMemo(() => {
    return recordedPath.map(coord => [coord.latitude, coord.longitude] as [number, number])
  }, [recordedPath])

  // Get start point
  const startPoint = recordedPath.length > 0 ? recordedPath[0] : null

  // Calculate trail statistics
  const trailStats = useMemo(() => {
    const totalDistance = calculateTotalDistance(recordedPath)
    const elevationGain = calculateElevationGain(recordedPath)

    // Calculate duration and average speed
    let duration = 0
    let averageSpeed = 0

    if (recordedPath.length >= 2) {
      const startTime = new Date(recordedPath[0].timestamp).getTime()
      const endTime = new Date(recordedPath[recordedPath.length - 1].timestamp).getTime()
      duration = (endTime - startTime) / 1000 // in seconds

      if (duration > 0) {
        averageSpeed = calculateAverageSpeed(totalDistance, duration)
      }
    }

    return {
      totalDistance,
      elevationGain,
      duration,
      averageSpeed
    }
  }, [recordedPath])

  if (!isClient || !mapLoaded || !L || !ReactLeafletComponents) {
    return (
      <div className={'h-96 bg-gray-100 rounded-lg flex items-center justify-center' + (className ? ' ' + className : '')}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Map Status */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center space-x-2">
          {isRecording ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Recording</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-500">Not Recording</span>
            </>
          )}
        </div>
      </div>

      {/* GPS Status */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center space-x-2">
          {currentPosition ? (
            <>
              <Navigation className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">GPS Active</span>
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">No GPS</span>
            </>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden relative">
        <ReactLeafletComponents.MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
          zoomControl={true}
          attributionControl={false}
        >
          <ReactLeafletComponents.TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Recorded Trail Path */}
          {polylinePositions.length > 1 && (
            <ReactLeafletComponents.Polyline
              positions={polylinePositions}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
              smoothFactor={1}
            />
          )}

          {/* Start Point */}
          {startPoint && startIcon && (
            <ReactLeafletComponents.Marker
              position={[startPoint.latitude, startPoint.longitude]}
              icon={startIcon}
            >
              <ReactLeafletComponents.Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-green-700">Trail Start</h4>
                  <p className="text-sm text-gray-600">
                    {startPoint.latitude.toFixed(6)}, {startPoint.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(startPoint.timestamp || '').toLocaleTimeString()}
                  </p>
                </div>
              </ReactLeafletComponents.Popup>
            </ReactLeafletComponents.Marker>
          )}

          {/* Current Location */}
          {currentPosition && currentLocationIcon && (
            <ReactLeafletComponents.Marker
              position={[currentPosition.latitude, currentPosition.longitude]}
              icon={currentLocationIcon}
            >
              <ReactLeafletComponents.Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-blue-700">Current Location</h4>
                  <p className="text-sm text-gray-600">
                    {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Accuracy: {currentPosition.accuracy?.toFixed(0)}m
                  </p>
                  {currentPosition.altitude && (
                    <p className="text-xs text-gray-500">
                      Altitude: {currentPosition.altitude.toFixed(0)}m
                    </p>
                  )}
                </div>
              </ReactLeafletComponents.Popup>
            </ReactLeafletComponents.Marker>
          )}
        </ReactLeafletComponents.MapContainer>

        {/* Distance Overlay */}
        {isRecording && trailStats.totalDistance > 0 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-300">Distance</div>
              <div className="text-lg font-bold">
                {formatDistance(trailStats.totalDistance, 'kilometers')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trail Stats */}
      <div className="mt-4 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Distance</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDistance(trailStats.totalDistance, 'kilometers')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">
              {trailStats.duration > 0 ? formatDuration(trailStats.duration) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Elevation Gain</p>
            <p className="text-lg font-semibold text-gray-900">
              {trailStats.elevationGain > 0 ? `${trailStats.elevationGain.toFixed(0)}m` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Speed</p>
            <p className="text-lg font-semibold text-gray-900">
              {trailStats.averageSpeed > 0 ? formatSpeed(trailStats.averageSpeed, 'kmh') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">GPS Points</p>
            <p className="text-lg font-semibold text-gray-900">{recordedPath.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GPS Accuracy</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentPosition?.accuracy ? `${currentPosition.accuracy.toFixed(0)}m` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
