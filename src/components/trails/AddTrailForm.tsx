'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, TrendingUp, Upload, X, Plus, Play, Square, Pause } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'
import { useTrailSubmission } from '@/hooks/useTrailSubmission'
import { useTrailRecording } from '@/hooks/useTrailRecording'

interface TrailFormData {
  name: string
  location: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  distance: string
  duration: string
  description: string
  features: string[]
  coordinates: Array<{ lat: number; lng: number }>
}

interface AddTrailFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddTrailForm({ onSuccess, onCancel }: AddTrailFormProps) {
  const { connected } = useWallet()
  const { isSubmitting, error, success, submitTrail, reset } = useTrailSubmission()
  const {
    recording,
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getCurrentStats
  } = useTrailRecording()

  const [newFeature, setNewFeature] = useState('')
  const [showRecordingUI, setShowRecordingUI] = useState(false)

  const [formData, setFormData] = useState<TrailFormData>({
    name: '',
    location: '',
    difficulty: 'Easy',
    distance: '',
    duration: '',
    description: '',
    features: [],
    coordinates: []
  })

  const handleInputChange = (field: keyof TrailFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  // Handle starting GPS recording
  const handleStartRecording = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a trail name before starting recording')
      return
    }

    const success = await startRecording(formData.name, formData.description)
    if (success) {
      setShowRecordingUI(true)
    } else {
      alert('Failed to start GPS recording. Please check your location permissions.')
    }
  }

  // Handle stopping GPS recording
  const handleStopRecording = () => {
    const finalRecording = stopRecording()
    if (finalRecording) {
      // Update form data with recorded trail data
      setFormData(prev => ({
        ...prev,
        coordinates: finalRecording.coordinates,
        distance: `${(finalRecording.totalDistance / 1000).toFixed(2)} km`,
        duration: `${Math.round(finalRecording.totalDuration / 60)} minutes`
      }))
      setShowRecordingUI(false)
    }
  }

  // Get current recording stats
  const currentStats = getCurrentStats()
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a trail name')
      return
    }

    if (!formData.location.trim()) {
      alert('Please enter a location')
      return
    }

    if (!formData.description.trim()) {
      alert('Please enter a description')
      return
    }

    if (formData.coordinates.length === 0) {
      alert('Please record a GPS trail route before submitting')
      return
    }

    if (isRecording) {
      alert('Please stop the GPS recording before submitting')
      return
    }

    await submitTrail(formData)

    if (success && onSuccess) {
      onSuccess()
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Trail</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {!connected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Please connect your wallet to submit a trail. This helps verify trail contributors and enables blockchain rewards.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trail Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Hidden Waterfall Trail"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Kandy, Sri Lanka"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Trail Details */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value as 'Easy' | 'Moderate' | 'Hard')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance
            </label>
            <input
              type="text"
              value={formData.distance}
              onChange={(e) => handleInputChange('distance', e.target.value)}
              placeholder="e.g., 5.2 km"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="e.g., 2-3 hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the trail, its highlights, and what hikers can expect..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trail Features
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g., Waterfall, Scenic Views"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* GPS Trail Recording */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trail Route Recording *
          </label>
          <div className="border border-gray-300 rounded-lg p-4">
            {!showRecordingUI && formData.coordinates.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Record your trail by hiking it with GPS tracking
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Like Wikiloc: Start recording, hike the trail, then stop to save your route
                </p>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Play className="h-5 w-5" />
                  Start Recording Trail
                </button>
              </div>
            ) : showRecordingUI ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Recording Trail: {formData.name}</h3>
                  <div className="flex items-center gap-2">
                    {isPaused ? (
                      <button
                        type="button"
                        onClick={resumeRecording}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center gap-1"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {(currentStats.distance / 1000).toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600">km</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {formatTime(currentStats.duration)}
                    </div>
                    <div className="text-sm text-green-600">time</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {recording?.coordinates.length || 0}
                    </div>
                    <div className="text-sm text-purple-600">points</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
                    }`}></div>
                    {isPaused ? 'Recording Paused' : 'Recording Active'}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  ✅ Trail recorded: {formData.coordinates.length} GPS points
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>Distance: {formData.distance}</div>
                  <div>Duration: {formData.duration}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, coordinates: [], distance: '', duration: '' }))
                    setShowRecordingUI(false)
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear and re-record
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !connected || isRecording || formData.coordinates.length === 0}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' :
             isRecording ? 'Stop Recording First' :
             formData.coordinates.length === 0 ? 'Record Trail First' :
             'Submit Trail'}
          </button>
        </div>
      </form>
    </div>
  )
}
