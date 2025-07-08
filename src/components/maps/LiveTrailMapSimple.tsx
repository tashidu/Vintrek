'use client'

import React from 'react'
import { MapPin } from 'lucide-react'
import { GPSCoordinate } from '@/types/trail'

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
  return (
    <div className="relative">
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Map component placeholder</p>
          <p className="text-sm text-gray-400 mt-2">
            Recording: {isRecording ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-400">
            Path points: {recordedPath.length}
          </p>
        </div>
      </div>
    </div>
  )
}
