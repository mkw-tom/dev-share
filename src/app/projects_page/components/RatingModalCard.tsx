import React, { useEffect, useState } from 'react'

interface RatingModalCardProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

const RatingModalCard: React.FC<RatingModalCardProps> = ({ isOpen, onClose, projectId }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const [rating, setRating] = useState<number>(0)
  const [currentRating, setCurrentRating] = useState<number | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !isOpen) return

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('トークンが見つかりません。ログインしてください。')
          return
        }

        const res = await fetch(`${apiUrl}/api/rating?project=${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errorData = await res.json()
          console.error('Error fetching rating:', errorData.message)
          return
        }

        const data = await res.json()
        console.log('API response:', data.projects)

        if (data.projects && data.projects.length > 0) {
          console.log('Fetched rating:', data.projects.averageRating)
          setCurrentRating(data.projects.averageRating)
        } else {
          console.error('Rating data not found.')
        }
      } catch (error) {
        console.error('Error fetching rating:', error)
      }
    }
    fetchProjectData()
  }, [apiUrl, isOpen, projectId])

  const handleSubmitRating = async () => {
    if (!projectId) return

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (!token) {
        console.error('トークンが見つかりません。ログインしてください。')
        return
      }

      console.log('Sending rating:', rating)

      const res = await fetch(`/api/rating?project=${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addedBy: userId,
          rating,
          project: projectId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error data:', errorData)
        return
      }

      const responseData = await res.json()
      console.log('Rating submitted successfully:', responseData)
      setCurrentRating(responseData.newRating)
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 rounded bg-white p-4">
        <div className="mb-4 flex justify-center">
          <h3 className="font-semibold">
            現在の評価:{' '}
            {typeof currentRating === 'number' && !isNaN(currentRating)
              ? currentRating.toFixed(1)
              : '未評価'}
          </h3>
        </div>

        <div className="mb-4 flex justify-center py-2">
          <div className="rating rating-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name="rating-8"
                className="mask mask-star-2 bg-orange-400 text-6xl"
                onChange={() => setRating(star)}
                checked={rating === star}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-200"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
            onClick={handleSubmitRating}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModalCard
