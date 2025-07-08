'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { AddTrailForm } from '@/components/trails/AddTrailForm'

export default function AddTrailPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  const handleSuccess = () => {
    setSubmitted(true)
    // Redirect to trails page after a delay
    setTimeout(() => {
      router.push('/trails')
    }, 3000)
  }

  const handleCancel = () => {
    router.push('/trails')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/trails')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Trails</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">VinTrek</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trail Submitted Successfully!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for contributing to the VinTrek community. Your trail has been submitted and will be available for other hikers to discover.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>What happens next:</strong><br />
                • Your trail will be reviewed by the community<br />
                • Once verified, it will appear in the trails list<br />
                • You'll earn TREK tokens when others complete your trail<br />
                • You can track your contributions in your dashboard
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Redirecting to trails page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Trails</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">VinTrek</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Trail</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help grow the VinTrek community by sharing your favorite hiking trails. 
            Like Wikiloc, anyone can contribute trails for others to discover and enjoy.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-green-600 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free to Share</h3>
            <p className="text-gray-600 text-sm">
              No cost to submit trails. Help build a comprehensive database of Sri Lankan hiking trails.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-blue-600 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-gray-600 text-sm">
              Get TREK tokens when other hikers complete trails you've contributed.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-purple-600 mb-3">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Verified</h3>
            <p className="text-gray-600 text-sm">
              Trails are reviewed by the community to ensure quality and accuracy.
            </p>
          </div>
        </div>

        {/* Add Trail Form */}
        <AddTrailForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}
