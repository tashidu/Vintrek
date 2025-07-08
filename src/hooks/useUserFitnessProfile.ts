'use client'

import { useState, useEffect } from 'react'
import { UserFitnessProfile, EmergencyContact } from '@/types/trail'

interface UseUserFitnessProfileReturn {
  profile: UserFitnessProfile | null
  loading: boolean
  error: string | null
  updateProfile: (updates: Partial<UserFitnessProfile>) => Promise<void>
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>
  removeEmergencyContact: (contactId: string) => Promise<void>
  updateEmergencyContact: (contactId: string, updates: Partial<EmergencyContact>) => Promise<void>
}

// Default fitness profile for new users
const createDefaultProfile = (walletAddress: string): UserFitnessProfile => ({
  id: `profile_${Date.now()}`,
  walletAddress,
  fitnessLevel: 50, // Medium fitness level
  experienceLevel: 'intermediate',
  completedTrails: 0,
  totalDistance: 0,
  averagePace: 15, // 15 minutes per km (moderate pace)
  preferredDifficulty: ['Easy', 'Moderate'],
  emergencyContacts: [],
  lastUpdated: new Date().toISOString()
})

export function useUserFitnessProfile(walletAddress?: string): UseUserFitnessProfileReturn {
  const [profile, setProfile] = useState<UserFitnessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (walletAddress) {
      loadProfile(walletAddress)
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [walletAddress])

  const loadProfile = async (address: string) => {
    try {
      setLoading(true)
      setError(null)

      // Try to load from localStorage first
      const storageKey = `vintrek_fitness_profile_${address}`
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        const parsedProfile = JSON.parse(stored) as UserFitnessProfile
        setProfile(parsedProfile)
        console.log('📊 Loaded fitness profile from localStorage')
      } else {
        // Create new profile for first-time user
        const newProfile = createDefaultProfile(address)
        setProfile(newProfile)
        await saveProfile(newProfile)
        console.log('📊 Created new fitness profile')
      }
    } catch (err) {
      console.error('Failed to load fitness profile:', err)
      setError('Failed to load fitness profile')
      
      // Fallback to default profile
      if (address) {
        const fallbackProfile = createDefaultProfile(address)
        setProfile(fallbackProfile)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (profileToSave: UserFitnessProfile) => {
    try {
      const storageKey = `vintrek_fitness_profile_${profileToSave.walletAddress}`
      localStorage.setItem(storageKey, JSON.stringify(profileToSave))
      
      // In production, this would also sync to blockchain or backend
      console.log('📊 Fitness profile saved to localStorage')
    } catch (err) {
      console.error('Failed to save fitness profile:', err)
      throw new Error('Failed to save fitness profile')
    }
  }

  const updateProfile = async (updates: Partial<UserFitnessProfile>) => {
    if (!profile) {
      throw new Error('No profile to update')
    }

    try {
      const updatedProfile: UserFitnessProfile = {
        ...profile,
        ...updates,
        lastUpdated: new Date().toISOString()
      }

      setProfile(updatedProfile)
      await saveProfile(updatedProfile)
      console.log('📊 Fitness profile updated')
    } catch (err) {
      console.error('Failed to update fitness profile:', err)
      setError('Failed to update profile')
      throw err
    }
  }

  const addEmergencyContact = async (contactData: Omit<EmergencyContact, 'id'>) => {
    if (!profile) {
      throw new Error('No profile available')
    }

    try {
      const newContact: EmergencyContact = {
        ...contactData,
        id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      const updatedContacts = [...profile.emergencyContacts, newContact]
      await updateProfile({ emergencyContacts: updatedContacts })
      console.log('📞 Emergency contact added')
    } catch (err) {
      console.error('Failed to add emergency contact:', err)
      throw err
    }
  }

  const removeEmergencyContact = async (contactId: string) => {
    if (!profile) {
      throw new Error('No profile available')
    }

    try {
      const updatedContacts = profile.emergencyContacts.filter(c => c.id !== contactId)
      await updateProfile({ emergencyContacts: updatedContacts })
      console.log('📞 Emergency contact removed')
    } catch (err) {
      console.error('Failed to remove emergency contact:', err)
      throw err
    }
  }

  const updateEmergencyContact = async (contactId: string, updates: Partial<EmergencyContact>) => {
    if (!profile) {
      throw new Error('No profile available')
    }

    try {
      const updatedContacts = profile.emergencyContacts.map(contact =>
        contact.id === contactId ? { ...contact, ...updates } : contact
      )
      await updateProfile({ emergencyContacts: updatedContacts })
      console.log('📞 Emergency contact updated')
    } catch (err) {
      console.error('Failed to update emergency contact:', err)
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    addEmergencyContact,
    removeEmergencyContact,
    updateEmergencyContact
  }
}

// Helper function to calculate fitness level based on trail history
export function calculateFitnessLevel(
  completedTrails: number,
  totalDistance: number,
  averagePace: number
): number {
  let score = 30 // Base score

  // Trail completion factor (0-30 points)
  score += Math.min(completedTrails * 2, 30)

  // Distance factor (0-25 points)
  const distanceKm = totalDistance / 1000
  score += Math.min(distanceKm / 10, 25)

  // Pace factor (0-15 points) - faster pace = higher score
  const paceScore = Math.max(0, 15 - (averagePace - 10))
  score += Math.min(paceScore, 15)

  return Math.min(Math.max(score, 0), 100)
}

// Helper function to determine experience level
export function determineExperienceLevel(
  completedTrails: number,
  totalDistance: number
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const distanceKm = totalDistance / 1000

  if (completedTrails < 5 || distanceKm < 20) {
    return 'beginner'
  } else if (completedTrails < 20 || distanceKm < 100) {
    return 'intermediate'
  } else if (completedTrails < 50 || distanceKm < 300) {
    return 'advanced'
  } else {
    return 'expert'
  }
}

// Helper function to update profile after trail completion
export function updateProfileAfterTrailCompletion(
  profile: UserFitnessProfile,
  trailDistance: number,
  trailDuration: number
): Partial<UserFitnessProfile> {
  const newCompletedTrails = profile.completedTrails + 1
  const newTotalDistance = profile.totalDistance + trailDistance
  
  // Calculate new average pace
  const trailPace = (trailDuration / 60) / (trailDistance / 1000) // minutes per km
  const newAveragePace = (profile.averagePace * profile.completedTrails + trailPace) / newCompletedTrails

  // Recalculate fitness level and experience
  const newFitnessLevel = calculateFitnessLevel(newCompletedTrails, newTotalDistance, newAveragePace)
  const newExperienceLevel = determineExperienceLevel(newCompletedTrails, newTotalDistance)

  return {
    completedTrails: newCompletedTrails,
    totalDistance: newTotalDistance,
    averagePace: newAveragePace,
    fitnessLevel: newFitnessLevel,
    experienceLevel: newExperienceLevel
  }
}
