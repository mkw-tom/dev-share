'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CommentModalCard from './components/CommentModalCard'
import ProjectCard from './components/ProjectCard'
import RatingModalCardProps from './components/RatingModalCard'

const Page = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentProject, setCurrentProject] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setErrorMessage('ログインしてください')
        return
      }

      try {
        const res = await fetch(`${apiUrl}/api/project`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('Response status:', res.status)

        if (!res.ok) {
          const errorData = await res.json()
          console.error('Error data:', errorData)
          setErrorMessage(errorData.error)
          return
        }

        const data = await res.json()
        setProjects(data.projects)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        setErrorMessage('エラーが発生しました')
      }
    }

    fetchProjects()
  }, [apiUrl])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenModal = (project: ProjectType) => {
    setCurrentProject(project)
    setIsModalOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenRatingModal = (project: ProjectType) => {
    setCurrentProject(project)
    setIsRatingModalOpen(true)
  }

  // onClose は引数を取らない
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false)
  }

  const handleDeleteProject = async (projectId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setErrorMessage('ログインしてください')
      return
    }

    try {
      const res = await fetch(`/api/project?id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('res.ok', res)

      const responseBody = await res.json()
      console.log('レスポンス:', responseBody)

      if (res.status === 404) {
        // プロジェクトがすでに削除されていた場合は問題ないので、エラーとして扱わない
        console.warn('プロジェクトは既に存在しません。')
      } else if (!res.ok) {
        console.error('Error deleting project:', responseBody.error)
        throw new Error('プロジェクトの削除に失敗しました')
      } else {
        console.log('削除成功:', responseBody.message)
      }

      // const responseBody = await res.json()
      // console.log('レスポンス:', responseBody)
      // if (!res.ok) {
      //   console.error('Error deleting project:', responseBody.error)
      //   throw new Error('プロジェクトの削除に失敗しました')
      // }

      // setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId))
    } catch (error) {
      console.error('Network error:', error)
      setErrorMessage('ネットワークエラーが発生しました')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProjects = (newProject: any) => {
    const updatedProjects = projects.map((project) =>
      project._id === newProject._id ? newProject : project,
    )

    setProjects(updatedProjects)
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-between">
          <h1 className="text-xl font-bold">プロジェクト管理</h1>
          <Link href="/add_page">
            <button className="rounded bg-blue-500 px-4 py-2 text-white">追加</button>
          </Link>
        </div>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {isLoading && !errorMessage ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="w-68 flex h-auto animate-pulse flex-col gap-2 rounded-sm bg-gray-200 p-5">
              <div className="h-8 w-28 rounded-full bg-gray-300 "></div>
              <div className="h-72 w-full rounded-sm bg-gray-300 "></div>
              <div className="mt-3 h-6 w-1/3 rounded-full bg-gray-300"></div>
              <div className="h-6 w-2/3 rounded-full bg-gray-300 "></div>
              <div className="h-6 w-2/5 rounded-full bg-gray-300 "></div>
            </div>
            <div className="w-68 flex h-auto animate-pulse flex-col gap-2 rounded-sm bg-gray-200 p-5">
              <div className="h-8 w-28 rounded-full bg-gray-300 "></div>
              <div className="h-72 w-full rounded-sm bg-gray-300 "></div>
              <div className="mt-3 h-6 w-1/3 rounded-full bg-gray-300"></div>
              <div className="h-6 w-2/3 rounded-full bg-gray-300 "></div>
              <div className="h-6 w-2/5 rounded-full bg-gray-300 "></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard
                key={index}
                project={project}
                onOpenModal={handleOpenModal}
                onOpenRatingModal={handleOpenRatingModal}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button className="rounded bg-gray-200 px-4 py-2">Previous</button>
          <button className="rounded bg-gray-200 px-4 py-2">Next</button>
        </div>
      </div>

      {currentProject && (
        <>
          <CommentModalCard
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            projectId={currentProject._id}
            updatedProject={updateProjects}
          />
          <RatingModalCardProps
            isOpen={isRatingModalOpen}
            onClose={handleCloseRatingModal}
            projectId={currentProject._id}
          />
        </>
      )}
    </>
  )
}

export default Page
