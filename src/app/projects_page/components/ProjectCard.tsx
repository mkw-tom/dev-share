/* eslint-disable @typescript-eslint/no-explicit-any */
import CommentIcon from '@mui/icons-material/Comment'
import React, { useEffect, useState } from 'react'
import DeleteButton from './DeleteButton'

interface ProjectCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: ProjectType
  onOpenModal: (project: ProjectType) => void
  onOpenRatingModal: (project: ProjectType) => void
  onDelete: (id: string) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenModal,
  onOpenRatingModal,
  onDelete,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isRatingFetched, setIsRatingFetched] = useState(false)

  useEffect(() => {
    const fetchRating = async () => {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      if (!token || !userId) {
        console.error('トークンが見つかりません')
        return
      }

      try {
        const res = await fetch(`${apiUrl}/api/rating?project=${project._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          console.error('Error fetching rating:', data.message)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projectData = data.projects.find((proj: any) => proj._id === project._id)
        console.log('ProjectCard API response:', projectData)

        if (projectData) {
          setAverageRating(parseFloat(projectData.averageRating || '0'))

          // 各プロジェクトの評価を確認し、ユーザーの評価があるか確認
          const userRatingData = Array.isArray(projectData.ratings)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              projectData.ratings.find((rating: any) => rating.addedBy === userId)
            : null
          setUserRating(userRatingData ? userRatingData.rating : null)
        }

        setIsRatingFetched(true)
      } catch (error) {
        console.error('Error fetching rating:', error)
      }
    }
    fetchRating()
  }, [apiUrl, project._id])

  return (
    <div className="rounded border bg-white p-4 shadow ">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="border-l-4 border-l-purple-700 pl-2 text-lg font-bold tracking-wide">
          {project.title}
        </h1>
        <button
          className="mt-1 cursor-pointer rounded-md px-1 hover:bg-gray-100"
          onClick={
            userRating !== null || !isRatingFetched ? undefined : () => onOpenRatingModal(project) // ユーザーが評価していない場合のみクリック可能
          }
          style={{
            cursor: userRating !== null || !isRatingFetched ? 'not-allowed' : 'pointer',
          }}
        >
          <div className="flex items-center justify-end gap-1 ">
            <span
              className={`text-2xl ${userRating !== null ? 'text-yellow-500' : 'text-gray-300'}`}
              // onClick={
              //   userRating !== null || !isRatingFetched
              //     ? undefined
              //     : () => onOpenRatingModal(project) // ユーザーが評価していない場合のみクリック可能
              // }
              // style={{
              //   cursor: userRating !== null || !isRatingFetched ? 'not-allowed' : 'pointer',
              // }}
            >
              ★
            </span>
            <span
              className={`text-md ${averageRating !== null ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              {averageRating !== null ? averageRating.toFixed(1) : '0.00'}
            </span>
          </div>
        </button>
      </div>
      {project.projectImage ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={project.projectImage} className="h-46 w-full"></img>
      ) : (
        <div className="h-48 w-full rounded-sm bg-gray-500">image</div>
      )}
      <div className="flex items-start justify-between">
        {/* 左側の情報 */}
        <div className="">
          <div className="mt-2">開発言語: {project.language.join(', ')}</div>
          <div className="mt-2">開発期間: {project.duration}</div>
          <div className="mt-2">
            アプリのリンク:{' '}
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              {project.link}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-right">
          <div className="mt-2">
            <button
              className="flex items-center gap-1 rounded bg-gray-200 p-2 hover:opacity-45"
              onClick={() => onOpenModal(project)} // Open modal on click
            >
              {project.comments.length > 0 ? (
                <>
                  <CommentIcon />
                  <span>{project.comments.length}</span>
                </>
              ) : (
                <>
                  <CommentIcon />
                  <span>0</span>
                </>
              )}
            </button>
          </div>
          <DeleteButton projectId={project._id} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
export default ProjectCard
