'use client'

import { useState } from 'react'
import { trailService } from '@/services/trailService'
import { useWallet } from '@/components/providers/WalletProvider'

interface TrailSubmissionData {
  name: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  distance: string
  duration: string
  description: string
  features: string[]
  coordinates: Array<{ lat: number; lng: number }>
}

interface UseTrailSubmissionReturn {
  isSubmitting: boolean
  error: string | null
  success: boolean
  submitTrail: (data: TrailSubmissionData) => Promise<void>
  reset: () => void
}

export function useTrailSubmission(): UseTrailSubmissionReturn {
  const { connected, address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitTrail = async (data: TrailSubmissionData) => {
    if (!connected) {
      setError('Please connect your wallet to submit a trail.')
      return
    }

    if (!data.name.trim() || !data.location.trim() || !data.description.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (data.coordinates.length === 0) {
      setError('Please add GPS coordinates for the trail.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const trailData = {
        id: `user-trail-${Date.now()}`,
        name: data.name.trim(),
        location: data.location.trim(),
        coordinates: data.coordinates,
        difficulty: data.difficulty,
        distance: data.distance.trim(),
        duration: data.duration.trim(),
        description: data.description.trim(),
        rewards: {
          trekTokens: 50,
          nftCertificate: true
        },
        createdBy: address || 'anonymous',
        verified: false,
        createdAt: Date.now()
      }

      await trailService.storeTrail(trailData)
      setSuccess(true)
    } catch (error) {
      console.error('Error submitting trail:', error)
      setError('Failed to submit trail. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setIsSubmitting(false)
    setError(null)
    setSuccess(false)
  }

  return {
    isSubmitting,
    error,
    success,
    submitTrail,
    reset
  }
}
