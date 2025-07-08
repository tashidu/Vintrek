'use client'

import { 
  TrailSafetyAI, 
  WeatherRiskAssessment, 
  CrowdDensityPrediction, 
  PersonalizedDifficulty,
  EmergencyContactAlert,
  AITrailRecommendation,
  UserFitnessProfile,
  AccelerometerData,
  EmergencyDetection,
  WeatherCondition,
  TrailDifficulty,
  GPSCoordinate
} from '@/types/trail'
import { Trail } from '@/types'

// Weather API configuration (using OpenWeatherMap as example)
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo_key'
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'

// Mock crowd data service (in production, this would be real-time data)
const CROWD_DATA_API = 'https://api.vintrek.com/crowd-data'

class AITrailSafetyService {
  private emergencyDetection: EmergencyDetection = {
    isMonitoring: false,
    fallDetected: false,
    noMovementDetected: false,
    offTrailDetected: false,
    lastMovement: new Date().toISOString(),
    alertsSent: 0,
    emergencyTriggered: false
  }

  private accelerometerData: AccelerometerData[] = []
  private lastPosition: GPSCoordinate | null = null

  // Main AI Safety Assessment
  async assessTrailSafety(
    trail: Trail, 
    userProfile: UserFitnessProfile,
    currentLocation?: GPSCoordinate
  ): Promise<TrailSafetyAI> {
    try {
      console.log('🤖 AI Safety: Assessing trail safety for', trail.name)

      const [weatherRisk, crowdDensity, personalizedDiff, emergencyAlert] = await Promise.all([
        this.assessWeatherRisk(trail, currentLocation),
        this.predictCrowdDensity(trail),
        this.calculatePersonalizedDifficulty(trail, userProfile),
        this.checkEmergencyContactAlert(userProfile)
      ])

      return {
        weatherRiskAssessment: weatherRisk.riskLevel !== 'extreme',
        crowdDensityPrediction: crowdDensity.currentDensity,
        personalizedDifficulty: this.difficultyToNumber(personalizedDiff.personalizedDifficulty),
        emergencyContactAlert: emergencyAlert.enabled
      }
    } catch (error) {
      console.error('AI Safety Assessment failed:', error)
      // Return safe defaults
      return {
        weatherRiskAssessment: true,
        crowdDensityPrediction: 50,
        personalizedDifficulty: 2,
        emergencyContactAlert: false
      }
    }
  }

  // Weather Risk Assessment
  async assessWeatherRisk(
    trail: Trail, 
    location?: GPSCoordinate
  ): Promise<WeatherRiskAssessment> {
    try {
      // Use trail's start point or provided location
      const lat = location?.latitude || trail.startPoint?.lat || 6.9271 // Colombo default
      const lng = location?.longitude || trail.startPoint?.lng || 79.8612

      // Fetch current weather and forecast
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
      )
      
      const forecastResponse = await fetch(
        `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
      )

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Weather API request failed')
      }

      const currentWeather = await weatherResponse.json()
      const forecast = await forecastResponse.json()

      // Analyze weather conditions
      const conditions = this.analyzeWeatherConditions(currentWeather, forecast)
      const riskScore = this.calculateWeatherRiskScore(conditions)
      const riskLevel = this.getRiskLevel(riskScore)

      return {
        riskLevel,
        riskScore,
        conditions,
        recommendations: this.generateWeatherRecommendations(conditions, riskLevel),
        safeTimeWindow: this.findSafeTimeWindow(forecast)
      }
    } catch (error) {
      console.error('Weather risk assessment failed:', error)
      // Return moderate risk as fallback
      return {
        riskLevel: 'moderate',
        riskScore: 50,
        conditions: [],
        recommendations: ['Weather data unavailable. Check local conditions before hiking.']
      }
    }
  }

  // Crowd Density Prediction
  async predictCrowdDensity(trail: Trail): Promise<CrowdDensityPrediction> {
    try {
      // In production, this would use real-time data from trail sensors, 
      // social media check-ins, parking lot cameras, etc.
      
      // Mock crowd prediction based on time of day, day of week, and trail popularity
      const now = new Date()
      const hour = now.getHours()
      const dayOfWeek = now.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      // Base crowd density calculation
      let currentDensity = 20 // Base 20%
      
      // Time of day factors
      if (hour >= 6 && hour <= 9) currentDensity += 30 // Morning rush
      if (hour >= 16 && hour <= 18) currentDensity += 25 // Evening rush
      if (hour >= 10 && hour <= 15) currentDensity += 15 // Midday
      
      // Weekend factor
      if (isWeekend) currentDensity += 20
      
      // Trail difficulty factor (easier trails are more crowded)
      if (trail.difficulty === 'Easy') currentDensity += 15
      if (trail.difficulty === 'Moderate') currentDensity += 5
      if (trail.difficulty === 'Hard') currentDensity -= 5
      if (trail.difficulty === 'Expert') currentDensity -= 15

      // Cap at 100%
      currentDensity = Math.min(currentDensity, 100)

      // Predict density for next 2 hours
      const predictedDensity = this.predictFutureCrowdDensity(currentDensity, hour, isWeekend)

      return {
        currentDensity,
        predictedDensity,
        optimalTimes: this.generateOptimalTimes(trail),
        peakHours: isWeekend ? ['08:00-10:00', '14:00-16:00'] : ['07:00-09:00', '17:00-19:00'],
        quietHours: ['05:00-07:00', '19:00-21:00']
      }
    } catch (error) {
      console.error('Crowd density prediction failed:', error)
      return {
        currentDensity: 50,
        predictedDensity: 50,
        optimalTimes: [],
        peakHours: [],
        quietHours: []
      }
    }
  }

  // Personalized Difficulty Assessment
  async calculatePersonalizedDifficulty(
    trail: Trail, 
    userProfile: UserFitnessProfile
  ): Promise<PersonalizedDifficulty> {
    try {
      const originalDifficulty = trail.difficulty
      let adjustmentScore = 0
      const adjustmentFactors = []

      // Fitness level adjustment
      const fitnessAdjustment = (userProfile.fitnessLevel - 50) / 25 // -2 to +2
      adjustmentScore += fitnessAdjustment
      adjustmentFactors.push({
        factor: 'Fitness Level',
        impact: fitnessAdjustment,
        description: `Your fitness level (${userProfile.fitnessLevel}/100) ${fitnessAdjustment > 0 ? 'reduces' : 'increases'} difficulty`
      })

      // Experience adjustment
      const experienceMap = { beginner: -1, intermediate: 0, advanced: 0.5, expert: 1 }
      const experienceAdjustment = experienceMap[userProfile.experienceLevel]
      adjustmentScore += experienceAdjustment
      adjustmentFactors.push({
        factor: 'Experience Level',
        impact: experienceAdjustment,
        description: `${userProfile.experienceLevel} level ${experienceAdjustment > 0 ? 'reduces' : 'increases'} difficulty`
      })

      // Trail completion history
      const completionAdjustment = Math.min(userProfile.completedTrails / 20, 0.5) // Max 0.5 reduction
      adjustmentScore += completionAdjustment
      adjustmentFactors.push({
        factor: 'Trail Experience',
        impact: completionAdjustment,
        description: `${userProfile.completedTrails} completed trails reduce difficulty`
      })

      // Calculate personalized difficulty
      const personalizedDifficulty = this.adjustDifficulty(originalDifficulty, adjustmentScore)

      return {
        originalDifficulty,
        personalizedDifficulty,
        adjustmentFactors,
        fitnessScore: userProfile.fitnessLevel,
        experienceLevel: userProfile.experienceLevel,
        recommendations: this.generateDifficultyRecommendations(personalizedDifficulty, adjustmentFactors)
      }
    } catch (error) {
      console.error('Personalized difficulty calculation failed:', error)
      return {
        originalDifficulty: trail.difficulty,
        personalizedDifficulty: trail.difficulty,
        adjustmentFactors: [],
        fitnessScore: 50,
        experienceLevel: 'intermediate',
        recommendations: []
      }
    }
  }

  // Emergency Contact Alert System
  async checkEmergencyContactAlert(userProfile: UserFitnessProfile): Promise<EmergencyContactAlert> {
    return {
      enabled: userProfile.emergencyContacts.length > 0,
      contacts: userProfile.emergencyContacts,
      autoTriggerConditions: {
        noMovementMinutes: 30,
        lowBatteryPercent: 20,
        offTrailDistanceMeters: 500
      },
      lastCheckIn: new Date().toISOString(),
      nextScheduledCheckIn: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }
  }

  // Emergency Detection (Accelerometer + GPS)
  startEmergencyMonitoring(userProfile: UserFitnessProfile): void {
    this.emergencyDetection.isMonitoring = true
    console.log('🚨 Emergency monitoring started')

    // Request device motion permission (if available)
    if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          this.setupAccelerometerMonitoring()
        }
      })
    } else if (window.DeviceMotionEvent) {
      this.setupAccelerometerMonitoring()
    }
  }

  stopEmergencyMonitoring(): void {
    this.emergencyDetection.isMonitoring = false
    console.log('🚨 Emergency monitoring stopped')
  }

  // Helper Methods
  private analyzeWeatherConditions(current: any, forecast: any): WeatherCondition[] {
    const conditions: WeatherCondition[] = []

    // Temperature analysis
    if (current.main.temp > 35) {
      conditions.push({
        type: 'temperature',
        severity: 'high',
        value: current.main.temp,
        unit: '°C',
        description: 'Very hot conditions - risk of heat exhaustion'
      })
    }

    // Rain analysis
    if (current.rain && current.rain['1h'] > 0) {
      conditions.push({
        type: 'rain',
        severity: current.rain['1h'] > 5 ? 'high' : 'moderate',
        value: current.rain['1h'],
        unit: 'mm/h',
        description: 'Active rainfall - slippery trail conditions'
      })
    }

    // Wind analysis
    if (current.wind.speed > 10) {
      conditions.push({
        type: 'wind',
        severity: current.wind.speed > 15 ? 'high' : 'moderate',
        value: current.wind.speed,
        unit: 'm/s',
        description: 'Strong winds - balance and visibility concerns'
      })
    }

    return conditions
  }

  private calculateWeatherRiskScore(conditions: WeatherCondition[]): number {
    let score = 0
    conditions.forEach(condition => {
      switch (condition.severity) {
        case 'low': score += 10; break
        case 'moderate': score += 25; break
        case 'high': score += 50; break
        case 'extreme': score += 80; break
      }
    })
    return Math.min(score, 100)
  }

  private getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'extreme' {
    if (score < 25) return 'low'
    if (score < 50) return 'moderate'
    if (score < 75) return 'high'
    return 'extreme'
  }

  private generateWeatherRecommendations(conditions: WeatherCondition[], riskLevel: string): string[] {
    const recommendations = []
    
    if (riskLevel === 'extreme') {
      recommendations.push('⚠️ Consider postponing your hike due to dangerous weather conditions')
    }
    
    conditions.forEach(condition => {
      switch (condition.type) {
        case 'rain':
          recommendations.push('🌧️ Bring waterproof gear and extra grip footwear')
          break
        case 'temperature':
          if (condition.value > 30) {
            recommendations.push('🌡️ Bring extra water and sun protection')
          }
          break
        case 'wind':
          recommendations.push('💨 Be cautious on exposed ridges and cliff edges')
          break
      }
    })

    return recommendations
  }

  private findSafeTimeWindow(forecast: any): { start: string; end: string } | undefined {
    // Analyze forecast to find optimal hiking window
    // This is a simplified implementation
    const now = new Date()
    const safeStart = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    const safeEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours from now
    
    return {
      start: safeStart.toISOString(),
      end: safeEnd.toISOString()
    }
  }

  private predictFutureCrowdDensity(current: number, hour: number, isWeekend: boolean): number {
    // Simple prediction: crowd tends to increase towards peak hours
    const peakHours = isWeekend ? [9, 15] : [8, 17]
    const nextHour = hour + 2
    
    let prediction = current
    if (peakHours.some(peak => Math.abs(nextHour - peak) < 2)) {
      prediction += 15 // Increase towards peak
    } else {
      prediction -= 10 // Decrease away from peak
    }
    
    return Math.max(0, Math.min(100, prediction))
  }

  private generateOptimalTimes(trail: Trail): Array<{ time: string; density: number; recommendation: string }> {
    return [
      { time: '06:00', density: 15, recommendation: 'Best time - quiet and cool' },
      { time: '07:00', density: 25, recommendation: 'Good time - moderate crowd' },
      { time: '16:00', density: 45, recommendation: 'Busy - expect crowds' },
      { time: '18:00', density: 30, recommendation: 'Good evening option' }
    ]
  }

  private adjustDifficulty(original: TrailDifficulty, adjustment: number): TrailDifficulty {
    const difficulties: TrailDifficulty[] = ['Easy', 'Moderate', 'Hard', 'Expert']
    const currentIndex = difficulties.indexOf(original)
    const newIndex = Math.max(0, Math.min(3, currentIndex - Math.round(adjustment)))
    return difficulties[newIndex]
  }

  private difficultyToNumber(difficulty: TrailDifficulty): number {
    const map = { Easy: 1, Moderate: 2, Hard: 3, Expert: 4 }
    return map[difficulty]
  }

  private generateDifficultyRecommendations(difficulty: TrailDifficulty, factors: any[]): string[] {
    const recommendations = []
    
    if (difficulty === 'Expert') {
      recommendations.push('🏔️ This trail is very challenging for you - consider building up experience first')
    } else if (difficulty === 'Easy') {
      recommendations.push('✅ This trail should be comfortable for your fitness level')
    }
    
    return recommendations
  }

  private setupAccelerometerMonitoring(): void {
    window.addEventListener('devicemotion', (event) => {
      if (!this.emergencyDetection.isMonitoring) return

      const acceleration = event.accelerationIncludingGravity
      if (acceleration) {
        const data: AccelerometerData = {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0,
          timestamp: new Date().toISOString(),
          magnitude: Math.sqrt(
            Math.pow(acceleration.x || 0, 2) + 
            Math.pow(acceleration.y || 0, 2) + 
            Math.pow(acceleration.z || 0, 2)
          )
        }

        this.accelerometerData.push(data)
        
        // Keep only last 100 readings
        if (this.accelerometerData.length > 100) {
          this.accelerometerData.shift()
        }

        // Check for fall detection
        this.checkForFall(data)
      }
    })
  }

  private checkForFall(data: AccelerometerData): void {
    // Simple fall detection: sudden spike in acceleration magnitude
    if (data.magnitude > 20) { // Threshold for potential fall
      console.log('🚨 Potential fall detected!')
      this.emergencyDetection.fallDetected = true
      // In production, this would trigger emergency protocols
    }
  }

  // Generate AI Trail Recommendations
  async generateTrailRecommendations(
    trails: Trail[], 
    userProfile: UserFitnessProfile,
    currentLocation?: GPSCoordinate
  ): Promise<AITrailRecommendation[]> {
    const recommendations = []

    for (const trail of trails.slice(0, 5)) { // Limit to top 5 for performance
      try {
        const safety = await this.assessTrailSafety(trail, userProfile, currentLocation)
        const score = this.calculateRecommendationScore(trail, userProfile, safety)
        
        recommendations.push({
          trailId: trail.id,
          recommendationScore: score,
          reasons: this.generateRecommendationReasons(trail, userProfile, safety),
          safetyFactors: {
            weather: safety.weatherRiskAssessment ? 80 : 20,
            crowd: 100 - safety.crowdDensityPrediction,
            difficulty: this.getDifficultyScore(safety.personalizedDifficulty),
            emergency: safety.emergencyContactAlert ? 90 : 50
          },
          optimalStartTime: this.calculateOptimalStartTime(trail),
          estimatedCompletionTime: this.estimateCompletionTime(trail, userProfile),
          requiredEquipment: this.getRequiredEquipment(trail),
          warnings: this.generateWarnings(trail, safety)
        })
      } catch (error) {
        console.error(`Failed to generate recommendation for trail ${trail.id}:`, error)
      }
    }

    return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)
  }

  private calculateRecommendationScore(trail: Trail, userProfile: UserFitnessProfile, safety: TrailSafetyAI): number {
    let score = 50 // Base score

    // Weather factor
    score += safety.weatherRiskAssessment ? 20 : -30

    // Crowd factor
    score += (100 - safety.crowdDensityPrediction) * 0.3

    // Difficulty match
    const difficultyMatch = this.calculateDifficultyMatch(trail.difficulty, userProfile)
    score += difficultyMatch * 20

    // Emergency preparedness
    score += safety.emergencyContactAlert ? 10 : -5

    return Math.max(0, Math.min(100, score))
  }

  private calculateDifficultyMatch(trailDifficulty: TrailDifficulty, userProfile: UserFitnessProfile): number {
    // Return 0-1 based on how well trail difficulty matches user capability
    const userCapability = userProfile.fitnessLevel / 100
    const trailRequirement = this.difficultyToNumber(trailDifficulty) / 4
    
    return 1 - Math.abs(userCapability - trailRequirement)
  }

  private generateRecommendationReasons(trail: Trail, userProfile: UserFitnessProfile, safety: TrailSafetyAI): string[] {
    const reasons = []
    
    if (safety.weatherRiskAssessment) {
      reasons.push('Good weather conditions')
    }
    
    if (safety.crowdDensityPrediction < 30) {
      reasons.push('Low crowd density expected')
    }
    
    if (safety.personalizedDifficulty <= 2) {
      reasons.push('Suitable difficulty for your fitness level')
    }
    
    return reasons
  }

  private getDifficultyScore(personalizedDifficulty: number): number {
    return Math.max(0, 100 - (personalizedDifficulty - 1) * 25)
  }

  private calculateOptimalStartTime(trail: Trail): string {
    // Simple logic: recommend early morning for longer trails
    const distance = parseFloat(trail.distance.replace(/[^\d.]/g, ''))
    const startHour = distance > 10 ? 6 : 7
    return `${startHour.toString().padStart(2, '0')}:00`
  }

  private estimateCompletionTime(trail: Trail, userProfile: UserFitnessProfile): string {
    const distance = parseFloat(trail.distance.replace(/[^\d.]/g, ''))
    const userPace = userProfile.averagePace || 15 // minutes per km
    const estimatedMinutes = distance * userPace
    const hours = Math.floor(estimatedMinutes / 60)
    const minutes = Math.round(estimatedMinutes % 60)
    
    return `${hours}h ${minutes}m`
  }

  private getRequiredEquipment(trail: Trail): string[] {
    const equipment = ['Water', 'First aid kit', 'Mobile phone']
    
    if (trail.difficulty === 'Hard' || trail.difficulty === 'Expert') {
      equipment.push('GPS device', 'Emergency whistle', 'Headlamp')
    }
    
    return equipment
  }

  private generateWarnings(trail: Trail, safety: TrailSafetyAI): string[] {
    const warnings = []
    
    if (!safety.weatherRiskAssessment) {
      warnings.push('Weather conditions may be hazardous')
    }
    
    if (safety.crowdDensityPrediction > 80) {
      warnings.push('Very crowded conditions expected')
    }
    
    if (!safety.emergencyContactAlert) {
      warnings.push('No emergency contacts configured')
    }
    
    return warnings
  }
}

export const aiSafetyService = new AITrailSafetyService()
