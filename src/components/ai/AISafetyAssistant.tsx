'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  CloudRain, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Thermometer,
  Wind,
  Eye,
  Phone
} from 'lucide-react'
import { 
  TrailSafetyAI, 
  WeatherRiskAssessment, 
  CrowdDensityPrediction, 
  PersonalizedDifficulty,
  EmergencyContactAlert,
  UserFitnessProfile 
} from '@/types/trail'
import { Trail } from '@/types'
import { aiSafetyService } from '@/services/aiSafetyService'

interface AISafetyAssistantProps {
  trail: Trail
  userProfile: UserFitnessProfile
  onSafetyUpdate?: (safety: TrailSafetyAI) => void
}

export function AISafetyAssistant({ trail, userProfile, onSafetyUpdate }: AISafetyAssistantProps) {
  const [safetyAssessment, setSafetyAssessment] = useState<TrailSafetyAI | null>(null)
  const [weatherRisk, setWeatherRisk] = useState<WeatherRiskAssessment | null>(null)
  const [crowdDensity, setCrowdDensity] = useState<CrowdDensityPrediction | null>(null)
  const [personalizedDiff, setPersonalizedDiff] = useState<PersonalizedDifficulty | null>(null)
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyContactAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSafetyAssessment()
  }, [trail.id, userProfile.id])

  const loadSafetyAssessment = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🤖 Loading AI safety assessment for trail:', trail.name)

      // Load all safety components
      const [safety, weather, crowd, difficulty, emergency] = await Promise.all([
        aiSafetyService.assessTrailSafety(trail, userProfile),
        aiSafetyService.assessWeatherRisk(trail),
        aiSafetyService.predictCrowdDensity(trail),
        aiSafetyService.calculatePersonalizedDifficulty(trail, userProfile),
        aiSafetyService.checkEmergencyContactAlert(userProfile)
      ])

      setSafetyAssessment(safety)
      setWeatherRisk(weather)
      setCrowdDensity(crowd)
      setPersonalizedDiff(difficulty)
      setEmergencyAlert(emergency)

      onSafetyUpdate?.(safety)
    } catch (err) {
      console.error('Failed to load safety assessment:', err)
      setError('Failed to load safety assessment')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'extreme': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCrowdColor = (density: number) => {
    if (density < 30) return 'text-green-600 bg-green-50'
    if (density < 60) return 'text-yellow-600 bg-yellow-50'
    if (density < 80) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-50'
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Safety Assistant</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Safety Assistant</h3>
        </div>
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadSafetyAssessment}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Safety Assistant</h3>
        <div className="ml-auto">
          <button
            onClick={loadSafetyAssessment}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Weather Risk Assessment */}
        {weatherRisk && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Weather Risk</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(weatherRisk.riskLevel)}`}>
                {weatherRisk.riskLevel.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Risk Score</span>
                <span className="font-medium">{weatherRisk.riskScore}/100</span>
              </div>
              
              {weatherRisk.conditions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Current Conditions:</span>
                  {weatherRisk.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      {condition.type === 'temperature' && <Thermometer className="h-4 w-4" />}
                      {condition.type === 'wind' && <Wind className="h-4 w-4" />}
                      {condition.type === 'rain' && <CloudRain className="h-4 w-4" />}
                      <span>{condition.description}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {weatherRisk.recommendations.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-sm font-medium text-gray-700">Recommendations:</span>
                  {weatherRisk.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start space-x-1">
                      <span>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crowd Density Prediction */}
        {crowdDensity && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Crowd Density</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCrowdColor(crowdDensity.currentDensity)}`}>
                {crowdDensity.currentDensity}%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current</span>
                <span className="font-medium">{crowdDensity.currentDensity}% capacity</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Predicted (2h)</span>
                <span className="font-medium">{crowdDensity.predictedDensity}% capacity</span>
              </div>
              
              {crowdDensity.optimalTimes.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">Optimal Times:</span>
                  <div className="mt-1 space-y-1">
                    {crowdDensity.optimalTimes.slice(0, 2).map((time, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{time.time}</span>
                        <span className="text-gray-900">{time.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personalized Difficulty */}
        {personalizedDiff && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Difficulty Assessment</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(personalizedDiff.personalizedDifficulty === 'Easy' ? 1 : personalizedDiff.personalizedDifficulty === 'Moderate' ? 2 : personalizedDiff.personalizedDifficulty === 'Hard' ? 3 : 4)}`}>
                {personalizedDiff.personalizedDifficulty}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original</span>
                <span className="font-medium">{personalizedDiff.originalDifficulty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">For You</span>
                <span className="font-medium">{personalizedDiff.personalizedDifficulty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fitness Score</span>
                <span className="font-medium">{personalizedDiff.fitnessScore}/100</span>
              </div>
              
              {personalizedDiff.adjustmentFactors.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">Adjustment Factors:</span>
                  <div className="mt-1 space-y-1">
                    {personalizedDiff.adjustmentFactors.slice(0, 2).map((factor, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{factor.factor}:</span> {factor.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact Alert */}
        {emergencyAlert && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900">Emergency Contacts</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${emergencyAlert.enabled ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {emergencyAlert.enabled ? 'CONFIGURED' : 'NOT SET'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Contacts</span>
                <span className="font-medium">{emergencyAlert.contacts.length}</span>
              </div>
              
              {emergencyAlert.enabled && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Auto-alert triggers:
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• No movement: {emergencyAlert.autoTriggerConditions.noMovementMinutes} min</div>
                    <div>• Low battery: {emergencyAlert.autoTriggerConditions.lowBatteryPercent}%</div>
                    <div>• Off trail: {emergencyAlert.autoTriggerConditions.offTrailDistanceMeters}m</div>
                  </div>
                </div>
              )}
              
              {!emergencyAlert.enabled && (
                <div className="mt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Set up emergency contacts
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Safety Score */}
        {safetyAssessment && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Safety Summary</span>
            </div>
            
            <div className="text-sm text-gray-700">
              {safetyAssessment.weatherRiskAssessment && 
               safetyAssessment.crowdDensityPrediction < 70 && 
               safetyAssessment.emergencyContactAlert ? (
                <span className="text-green-700">✅ All safety checks passed. Good to go!</span>
              ) : (
                <span className="text-yellow-700">⚠️ Some safety concerns detected. Review recommendations above.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
