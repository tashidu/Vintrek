// GPS and Location Types
export interface GPSCoordinate {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  timestamp: string
}

export interface LocationPermissionState {
  granted: boolean
  denied: boolean
  prompt: boolean
}

// Trail Recording Types
export interface TrailRecording {
  id: string
  name: string
  description?: string
  startTime: string
  endTime?: string
  coordinates: GPSCoordinate[]
  isActive: boolean
  isPaused: boolean
  totalDistance: number // in meters
  totalDuration: number // in seconds
  averageSpeed: number // in m/s
  maxSpeed: number // in m/s
  elevationGain: number // in meters
  elevationLoss: number // in meters
}

// Completed Trail Types
export interface CompletedTrail {
  id: string
  name: string
  description?: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  completedAt: string
  duration: number // in seconds
  distance: number // in meters
  coordinates: GPSCoordinate[]
  photos?: string[] // base64 or URLs
  notes?: string
  walletAddress: string
  nftMinted: boolean
  nftTokenId?: string
  trekTokensEarned: number
  verified: boolean
}

// Trail Template Types (for predefined trails)
export interface TrailTemplate {
  id: string
  name: string
  location: string
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  estimatedDuration: string
  estimatedDistance: string
  image: string
  price: number // in ADA lovelace
  available: boolean
  coordinates?: GPSCoordinate[] // predefined route
  checkpoints?: TrailCheckpoint[]
  rewards: {
    trekTokens: number
    nftMetadata: {
      name: string
      description: string
      image: string
      attributes: Array<{
        trait_type: string
        value: string | number
      }>
    }
  }
}

export interface TrailCheckpoint {
  id: string
  name: string
  description: string
  coordinate: GPSCoordinate
  radius: number // in meters
  required: boolean
  order: number
}

// User Trail Statistics
export interface UserTrailStats {
  totalTrails: number
  totalDistance: number // in meters
  totalDuration: number // in seconds
  totalElevationGain: number // in meters
  trekTokensEarned: number
  nftsMinted: number
  favoriteTrail?: string
  longestTrail?: string
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  category: 'distance' | 'elevation' | 'trails' | 'special'
}

// VinTrek provides free trail access - no booking system needed

// GPS Tracking State
export interface GPSTrackingState {
  isTracking: boolean
  isPaused: boolean
  hasPermission: boolean
  currentPosition?: GPSCoordinate
  accuracy: number
  error?: string
  watchId?: number
}

// Trail Export/Import Types
export interface TrailExport {
  version: string
  exportedAt: string
  trail: CompletedTrail
  format: 'gpx' | 'json' | 'kml'
}

// API Response Types
export interface TrailAPIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// AI Safety & Recommendations Types
export interface TrailSafetyAI {
  weatherRiskAssessment: boolean
  crowdDensityPrediction: number
  personalizedDifficulty: number
  emergencyContactAlert: boolean
}

export interface WeatherRiskAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  riskScore: number // 0-100
  conditions: WeatherCondition[]
  recommendations: string[]
  safeTimeWindow?: {
    start: string
    end: string
  }
}

export interface WeatherCondition {
  type: 'rain' | 'storm' | 'wind' | 'temperature' | 'visibility' | 'uv'
  severity: 'low' | 'moderate' | 'high' | 'extreme'
  value: number
  unit: string
  description: string
}

export interface CrowdDensityPrediction {
  currentDensity: number // 0-100 (percentage of capacity)
  predictedDensity: number // predicted for next 2 hours
  optimalTimes: Array<{
    time: string
    density: number
    recommendation: string
  }>
  peakHours: string[]
  quietHours: string[]
}

export interface PersonalizedDifficulty {
  originalDifficulty: TrailDifficulty
  personalizedDifficulty: TrailDifficulty
  adjustmentFactors: Array<{
    factor: string
    impact: number // -2 to +2 difficulty adjustment
    description: string
  }>
  fitnessScore: number // 0-100
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  recommendations: string[]
}

export interface EmergencyContactAlert {
  enabled: boolean
  contacts: EmergencyContact[]
  autoTriggerConditions: {
    noMovementMinutes: number
    lowBatteryPercent: number
    offTrailDistanceMeters: number
    heartRateThreshold?: number
  }
  lastCheckIn?: string
  nextScheduledCheckIn?: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
  priority: number
}

export interface AITrailRecommendation {
  trailId: string
  recommendationScore: number // 0-100
  reasons: string[]
  safetyFactors: {
    weather: number
    crowd: number
    difficulty: number
    emergency: number
  }
  optimalStartTime: string
  estimatedCompletionTime: string
  requiredEquipment: string[]
  warnings: string[]
}

export interface UserFitnessProfile {
  id: string
  walletAddress: string
  fitnessLevel: number // 0-100
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  completedTrails: number
  totalDistance: number
  averagePace: number // minutes per km
  preferredDifficulty: TrailDifficulty[]
  medicalConditions?: string[]
  emergencyContacts: EmergencyContact[]
  lastUpdated: string
}

export interface AccelerometerData {
  x: number
  y: number
  z: number
  timestamp: string
  magnitude: number
}

export interface EmergencyDetection {
  isMonitoring: boolean
  fallDetected: boolean
  noMovementDetected: boolean
  offTrailDetected: boolean
  lastMovement: string
  alertsSent: number
  emergencyTriggered: boolean
}

// Utility Types
export type TrailStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
export type TrailDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert'
export type DistanceUnit = 'meters' | 'kilometers' | 'miles'
export type SpeedUnit = 'mps' | 'kmh' | 'mph'
export type WeatherRiskLevel = 'low' | 'moderate' | 'high' | 'extreme'
export type SafetyAlertType = 'weather' | 'crowd' | 'emergency' | 'equipment' | 'time'

// Helper function types
export interface TrailCalculations {
  calculateDistance: (coord1: GPSCoordinate, coord2: GPSCoordinate) => number
  calculateTotalDistance: (coordinates: GPSCoordinate[]) => number
  calculateElevationGain: (coordinates: GPSCoordinate[]) => number
  calculateAverageSpeed: (distance: number, duration: number) => number
  formatDistance: (meters: number, unit: DistanceUnit) => string
  formatDuration: (seconds: number) => string
  formatSpeed: (mps: number, unit: SpeedUnit) => string
}
