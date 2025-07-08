'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Star, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Users, 
  CloudRain,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { AITrailRecommendation, UserFitnessProfile } from '@/types/trail'
import { Trail } from '@/types'
import { aiSafetyService } from '@/services/aiSafetyService'

interface AITrailRecommendationsProps {
  trails: Trail[]
  userProfile: UserFitnessProfile
  onTrailSelect?: (trail: Trail) => void
  maxRecommendations?: number
}

export function AITrailRecommendations({ 
  trails, 
  userProfile, 
  onTrailSelect,
  maxRecommendations = 3 
}: AITrailRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AITrailRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [trails, userProfile.id])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🤖 AI: Generating trail recommendations for user')
      const recs = await aiSafetyService.generateTrailRecommendations(trails, userProfile)
      setRecommendations(recs.slice(0, maxRecommendations))
    } catch (err) {
      console.error('Failed to load AI recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getTrailById = (trailId: string) => {
    return trails.find(t => t.id === trailId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Trail Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Trail Recommendations</h3>
        </div>
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadRecommendations}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Trail Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recommendations available at the moment.</p>
          <button
            onClick={loadRecommendations}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh recommendations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Trail Recommendations</h3>
        </div>
        <button
          onClick={loadRecommendations}
          className="text-purple-600 hover:text-purple-800 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const trail = getTrailById(rec.trailId)
          if (!trail) return null

          return (
            <div key={rec.trailId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-purple-600">#{index + 1} Recommended</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(rec.recommendationScore)}`}>
                      {rec.recommendationScore}% match
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{trail.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trail.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{trail.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              {rec.reasons.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Why this trail:</span>
                  <div className="mt-1 space-y-1">
                    {rec.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Factors */}
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Safety factors:</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <span>Weather</span>
                    </div>
                    <span className="font-medium">{rec.safetyFactors.weather}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Crowd</span>
                    </div>
                    <span className="font-medium">{rec.safetyFactors.crowd}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Difficulty</span>
                    </div>
                    <span className="font-medium">{rec.safetyFactors.difficulty}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span>Emergency</span>
                    </div>
                    <span className="font-medium">{rec.safetyFactors.emergency}/100</span>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Optimal start:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{rec.optimalStartTime}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Estimated time:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{rec.estimatedCompletionTime}</span>
                  </div>
                </div>
              </div>

              {/* Required Equipment */}
              {rec.requiredEquipment.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Required equipment:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rec.requiredEquipment.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                    {rec.requiredEquipment.length > 4 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                        +{rec.requiredEquipment.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {rec.warnings.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Warnings:</span>
                  <div className="mt-1 space-y-1">
                    {rec.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                  AI recommendation based on your profile
                </div>
                <button
                  onClick={() => onTrailSelect?.(trail)}
                  className="flex items-center space-x-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <span>View Trail</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-center">
        <div className="text-xs text-gray-500">
          Recommendations updated based on real-time weather, crowd data, and your fitness profile
        </div>
      </div>
    </div>
  )
}
