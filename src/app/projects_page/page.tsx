'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CommentModalCard from './components/CommentModalCard'
import ProjectCard from './components/ProjectCard'
import RatingModalCardProps from './components/RatingModalCard'

const Page = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false)
  const [currentProject, setCurrentProject] = useState<any | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setErrorMessage('ログインしてください')
        return
      }

      try {
        const res = await fetch('/api/project', {
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
      } catch (error) {
        console.error(error)
        setErrorMessage('エラーが発生しました')
      }
    }

    fetchProjects()
  }, [])

  const handleOpenModal = (project: any) => {
    setCurrentProject(project)
    setIsModalOpen(true)
  }

  const handleOpenRatingModal = (project: any) => {
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

  const updateProjects = (newProject: any) => {
    const updatedProjects = projects.map((project) =>
      project._id === newProject._id ? newProject : project,
    )

    setProjects(updatedProjects)
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">プロジェクト管理</h1>
          <Link href="/add_page">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">追加</button>
          </Link>
        </div>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="flex justify-between mt-4">
          <button className="bg-gray-200 px-4 py-2 rounded">Previous</button>
          <button className="bg-gray-200 px-4 py-2 rounded">Next</button>
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
