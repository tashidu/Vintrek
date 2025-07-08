'use client'

import { vinTrekBlockchainService, TrailData, GPSTrack } from '@/lib/blockchain'
import { Trail } from '@/types'

// Convert blockchain TrailData to frontend Trail type
function convertBlockchainTrailToFrontend(blockchainTrail: TrailData): Trail {
  return {
    id: blockchainTrail.id,
    name: blockchainTrail.name,
    location: blockchainTrail.location,
    difficulty: blockchainTrail.difficulty,
    duration: blockchainTrail.duration,
    distance: blockchainTrail.distance,
    price: 0, // Trails are free in VinTrek's freemium model
    rating: 4.5, // Default rating - could be calculated from user feedback
    reviews: 0, // Could be fetched from blockchain reviews
    description: blockchainTrail.description,
    image: `/images/trails/trail-${blockchainTrail.id}.jpg`, // Default image path
    features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards'],
    coordinates: blockchainTrail.coordinates,
    rewards: {
      trekTokens: blockchainTrail.rewards.trekTokens,
      nftCertificate: blockchainTrail.rewards.nftCertificate,
      experiencePoints: blockchainTrail.rewards.trekTokens * 10
    },
    isPremiumOnly: blockchainTrail.difficulty === 'Expert', // Expert trails require premium
    createdBy: blockchainTrail.createdBy,
    verified: blockchainTrail.verified,
    createdAt: blockchainTrail.createdAt,
    txHash: blockchainTrail.txHash
  }
}

// User-contributed trails storage (in production, this would be in a database)
let userTrails: Trail[] = []

// No sample trails - all trails come from user recordings and blockchain storage

export class TrailService {
  private useBlockchain: boolean = false // Force fallback data for testing

  constructor() {
    // Check if blockchain is available
    this.checkBlockchainAvailability()
  }

  private async checkBlockchainAvailability(): Promise<void> {
    try {
      // Test if we can connect to Blockfrost API
      const response = await fetch('https://cardano-testnet.blockfrost.io/api/v0/health', {
        headers: {
          'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || 'test'
        }
      })
      this.useBlockchain = response.ok
    } catch (error) {
      console.warn('Blockchain not available, using fallback data:', error)
      this.useBlockchain = false
    }
  }

  // Get all trails (from blockchain, user contributions, and samples)
  async getTrails(): Promise<Trail[]> {
    try {
      let allTrails: Trail[] = []

      if (this.useBlockchain) {
        console.log('🔗 Fetching trails from Cardano blockchain...')
        const blockchainTrails = await vinTrekBlockchainService.getTrailsFromChain()

        if (blockchainTrails.length > 0) {
          console.log(`✅ Found ${blockchainTrails.length} trails on blockchain`)
          allTrails = blockchainTrails.map(convertBlockchainTrailToFrontend)
        }
      }

      // Combine blockchain trails and user trails (no sample trails)
      const combinedTrails = [...allTrails, ...userTrails]

      console.log(`📊 Total trails available: ${combinedTrails.length}`)
      console.log(`👥 User contributed trails: ${combinedTrails.filter(t => t.isUserContributed).length}`)

      return combinedTrails
    } catch (error) {
      console.error('Error fetching trails:', error)
      console.log('💾 Falling back to sample data due to error')
      return [...userTrails, ...sampleTrails]
    }
  }

  // Get trail by ID
  async getTrailById(trailId: string): Promise<Trail | null> {
    const trails = await this.getTrails()
    return trails.find(trail => trail.id === trailId) || null
  }

  // Get user contributed trails
  async getUserTrails(): Promise<Trail[]> {
    const allTrails = await this.getTrails()
    return allTrails.filter(trail => trail.isUserContributed)
  }

  // Store new trail (blockchain or local storage)
  async storeTrail(trailData: Omit<TrailData, 'txHash'>): Promise<string> {
    try {
      if (this.useBlockchain) {
        console.log('🔗 Storing trail on Cardano blockchain...')
        const txHash = await vinTrekBlockchainService.storeTrailOnChain(trailData)
        console.log('✅ Trail stored successfully on blockchain:', txHash)
        return txHash
      } else {
        // Store locally when blockchain is not available
        console.log('💾 Storing trail locally (blockchain unavailable)')
        const newTrail: Trail = {
          id: trailData.id,
          name: trailData.name,
          location: trailData.location,
          difficulty: trailData.difficulty,
          distance: trailData.distance,
          duration: trailData.duration,
          description: trailData.description,
          features: ['GPS Tracking', 'NFT Certificate', 'TREK Rewards'],
          coordinates: trailData.coordinates.length > 0 ? trailData.coordinates[0] : undefined,
          routes: [
            {
              id: `${trailData.id}-main`,
              name: 'Main Route',
              description: trailData.description,
              difficulty: trailData.difficulty,
              distance: trailData.distance,
              duration: trailData.duration,
              gpsRoute: trailData.coordinates,
              startPoint: trailData.coordinates[0],
              endPoint: trailData.coordinates[trailData.coordinates.length - 1],
              verified: false,
              createdAt: trailData.createdAt
            }
          ],
          defaultRouteId: `${trailData.id}-main`,
          isPremiumOnly: false,
          isUserContributed: true,
          contributedBy: trailData.createdBy,
          contributedByName: 'Anonymous User',
          verified: false,
          createdAt: trailData.createdAt
        }

        userTrails.push(newTrail)
        console.log('✅ Trail stored locally:', newTrail.id)
        return `local-${Date.now()}`
      }
    } catch (error) {
      console.error('Error storing trail:', error)
      throw error
    }
  }

  // Store GPS track on blockchain
  async storeGPSTrack(gpsTrack: Omit<GPSTrack, 'txHash'>): Promise<string> {
    if (!this.useBlockchain) {
      throw new Error('Blockchain not available for storing GPS tracks')
    }

    try {
      console.log('🔗 Storing GPS track on Cardano blockchain...')
      const txHash = await vinTrekBlockchainService.storeGPSTrack(gpsTrack)
      console.log('✅ GPS track stored successfully:', txHash)
      return txHash
    } catch (error) {
      console.error('Error storing GPS track on blockchain:', error)
      throw error
    }
  }

  // Get user's GPS tracks
  async getUserGPSTracks(userAddress: string): Promise<GPSTrack[]> {
    try {
      if (this.useBlockchain) {
        return await vinTrekBlockchainService.getGPSTracksByUser(userAddress)
      }
      return []
    } catch (error) {
      console.error('Error fetching user GPS tracks:', error)
      return []
    }
  }

  // Verify trail completion and reward tokens
  async completeTrail(trailId: string, gpsTrack: GPSTrack): Promise<{ verified: boolean; rewardTxHash?: string }> {
    try {
      if (!this.useBlockchain) {
        throw new Error('Blockchain not available for trail completion')
      }

      console.log('🔗 Verifying trail completion on blockchain...')
      const verified = await vinTrekBlockchainService.verifyTrailCompletion(trailId, gpsTrack)
      
      if (verified && gpsTrack.userAddress) {
        console.log('✅ Trail completion verified, rewarding TREK tokens...')
        const rewardTxHash = await vinTrekBlockchainService.rewardTrekTokens(trailId, gpsTrack.userAddress, gpsTrack)
        return { verified: true, rewardTxHash }
      }

      return { verified }
    } catch (error) {
      console.error('Error completing trail:', error)
      throw error
    }
  }
}

// Export singleton instance
export const trailService = new TrailService()
