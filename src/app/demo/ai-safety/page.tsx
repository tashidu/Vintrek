'use client'

import { useState, useEffect } from 'react'
import { Mountain, ArrowLeft, Brain, Shield, CloudRain, Users, TrendingUp, Phone } from 'lucide-react'
import Link from 'next/link'
import { AISafetyAssistant } from '@/components/ai/AISafetyAssistant'
import { AITrailRecommendations } from '@/components/ai/AITrailRecommendations'
import { EmergencyDetection } from '@/components/ai/EmergencyDetection'
import { UserFitnessProfile, EmergencyContact } from '@/types/trail'
import { Trail } from '@/types'

// Demo data for AI features showcase
const demoUserProfile: UserFitnessProfile = {
  id: 'demo_user_profile',
  walletAddress: 'addr1_demo_address',
  fitnessLevel: 75,
  experienceLevel: 'advanced',
  completedTrails: 23,
  totalDistance: 156000, // 156 km
  averagePace: 12, // 12 minutes per km
  preferredDifficulty: ['Moderate', 'Hard'],
  emergencyContacts: [
    {
      id: 'contact_1',
      name: 'Sarah Johnson',
      phone: '+94 77 123 4567',
      email: 'sarah@example.com',
      relationship: 'Emergency Contact',
      priority: 1
    },
    {
      id: 'contact_2',
      name: 'Mike Chen',
      phone: '+94 71 987 6543',
      relationship: 'Hiking Partner',
      priority: 2
    }
  ],
  lastUpdated: new Date().toISOString()
}

const demoTrails: Trail[] = [
  {
    id: 'demo_trail_1',
    name: 'Ella Rock Trail',
    location: 'Ella, Uva Province',
    difficulty: 'Moderate',
    distance: '8.5 km',
    duration: '4-5 hours',
    description: 'Scenic trail with panoramic views of Ella Gap and surrounding tea plantations.',
    image: '/trails/ella-rock.jpg',
    price: 0,
    available: true,
    features: ['Scenic Views', 'Tea Plantations', 'Photography'],
    routes: [],
    verified: true
  },
  {
    id: 'demo_trail_2',
    name: 'Adams Peak (Sri Pada)',
    location: 'Ratnapura District',
    difficulty: 'Hard',
    distance: '11 km',
    duration: '6-8 hours',
    description: 'Sacred mountain pilgrimage trail with challenging climb and spiritual significance.',
    image: '/trails/adams-peak.jpg',
    price: 0,
    available: true,
    features: ['Sacred Site', 'Sunrise Views', 'Pilgrimage'],
    routes: [],
    verified: true
  },
  {
    id: 'demo_trail_3',
    name: 'Horton Plains Circuit',
    location: 'Nuwara Eliya District',
    difficulty: 'Easy',
    distance: '9.5 km',
    duration: '3-4 hours',
    description: 'National park trail featuring Worlds End cliff and Bakers Falls.',
    image: '/trails/horton-plains.jpg',
    price: 0,
    available: true,
    features: ['National Park', 'Waterfalls', 'Wildlife'],
    routes: [],
    verified: true
  }
]

export default function AISafetyDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'safety' | 'recommendations' | 'emergency'>('safety')
  const [isHiking, setIsHiking] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/demo" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">VinTrek</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">AI Safety Demo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Trail Safety Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience VinTrek's cutting-edge AI safety features that keep hikers safe through 
            real-time weather analysis, crowd prediction, emergency detection, and personalized recommendations.
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
            <button
              type="button"
              onClick={() => setSelectedDemo('safety')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'safety'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Safety Assistant</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDemo('recommendations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'recommendations'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Recommendations</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDemo('emergency')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemo === 'emergency'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Emergency Detection</span>
              </div>
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Demo Area */}
          <div className="lg:col-span-2">
            {selectedDemo === 'safety' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Safety Assistant</h2>
                  <p className="text-gray-600 mb-6">
                    Our AI analyzes real-time weather conditions, crowd density, and your personal fitness 
                    profile to provide comprehensive safety assessments for each trail.
                  </p>
                </div>
                <AISafetyAssistant
                  trail={demoTrails[0]}
                  userProfile={demoUserProfile}
                  onSafetyUpdate={(safety) => {
                    console.log('Demo: Safety assessment updated', safety)
                  }}
                />
              </div>
            )}

            {selectedDemo === 'recommendations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Trail Recommendations</h2>
                  <p className="text-gray-600 mb-6">
                    Machine learning algorithms analyze your hiking history, current conditions, and 
                    personal preferences to suggest the perfect trails for you.
                  </p>
                </div>
                <AITrailRecommendations
                  trails={demoTrails}
                  userProfile={demoUserProfile}
                  onTrailSelect={(trail) => {
                    console.log('Demo: Trail selected', trail.name)
                  }}
                  maxRecommendations={3}
                />
              </div>
            )}

            {selectedDemo === 'emergency' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Detection System</h2>
                  <p className="text-gray-600 mb-6">
                    Advanced sensors monitor your movement, location, and device status to automatically 
                    detect emergencies and alert your contacts when needed.
                  </p>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsHiking(!isHiking)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isHiking
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isHiking ? 'Stop Hiking Demo' : 'Start Hiking Demo'}
                    </button>
                    <span className="text-sm text-gray-600">
                      {isHiking ? 'Emergency monitoring active' : 'Click to simulate hiking'}
                    </span>
                  </div>
                </div>
                <EmergencyDetection
                  userProfile={demoUserProfile}
                  isHiking={isHiking}
                  currentLocation={{
                    latitude: 6.8711,
                    longitude: 81.0593,
                    timestamp: new Date().toISOString()
                  }}
                  onEmergencyTriggered={(emergency) => {
                    console.log('Demo: Emergency triggered', emergency)
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Features Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Features Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CloudRain className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Weather Analysis</div>
                    <div className="text-sm text-gray-600">Real-time weather risk assessment with safety recommendations</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Crowd Prediction</div>
                    <div className="text-sm text-gray-600">ML-based forecasting of trail congestion levels</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Personal Assessment</div>
                    <div className="text-sm text-gray-600">Difficulty adjustment based on your fitness profile</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Emergency Detection</div>
                    <div className="text-sm text-gray-600">Automated fall detection and emergency alerts</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo User Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fitness Level:</span>
                  <span className="font-medium">{demoUserProfile.fitnessLevel}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium capitalize">{demoUserProfile.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Trails:</span>
                  <span className="font-medium">{demoUserProfile.completedTrails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Distance:</span>
                  <span className="font-medium">{(demoUserProfile.totalDistance / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contacts:</span>
                  <span className="font-medium">{demoUserProfile.emergencyContacts.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">🎯 Hackathon Demo</h4>
              <p className="text-sm text-yellow-700">
                This demo showcases VinTrek's AI-powered safety features using simulated data. 
                In production, these features use real weather APIs, IoT sensors, and machine learning models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
