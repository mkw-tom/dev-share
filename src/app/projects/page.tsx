'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import CommentModalCard from '../projects_page/components/CommentModalCard' // CommentModalCardをインポート
import ProjectCard from '../projects_page/components/ProjectCard' // ProjectCardコンポーネントをインポート
import RatingModalCard from '../projects_page/components/RatingModalCard' // RatingModalCardをインポート

type Project = {
  _id: string
  title: string
  projectImage: string
  duration: string
  link: string
  language: string[]
  rating: number
  comments: Comment[]
  addedBy: {
    userName: string
  }
}

type Comment = {
  _id: string
  content: string
  addedBy: {
    userName: string
  }
}

const selectOpetions = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Java', 'Ruby']

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('') // 検索用のステート
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>(projects) // フィルタリングされたプロジェク

  useEffect(() => {
    const fetchProjects = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      try {
        const response = await fetch(`${apiUrl}/api/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // JWTトークンをヘッダーに追加
          },
        })

        if (!response.ok) {
          throw new Error('プロジェクトを取得できませんでした')
        }

        const data = await response.json()
        setProjects(data.projects)
        setFilteredProjects(data.projects) // 初期状態でフィルタリングされたプロジェクトを設定
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleOpenModal = (projectId: string) => {
    setSelectedProjectId(projectId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProjectId(null)
  }

  const handleOpenRatingModal = (projectId: string) => {
    setSelectedProjectId(projectId)
    setIsRatingModalOpen(true) // 評価モーダルを開く
  }

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false)
    setSelectedProjectId(null)
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    // const lowerCaseSearchTerm = searchTerm.toLowerCase() // 小文字に変換して比較
    const lowerCaseSearchTerm = e.target.value.toLocaleLowerCase()
    const filtered = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowerCaseSearchTerm) || // タイトルに含まれる場合
        project.language.some((lang) => lang.toLowerCase().includes(lowerCaseSearchTerm)), // 言語に含まれる場合
    )
    setFilteredProjects(filtered) // フィルタリングされたプロジェクトを更新
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const filterLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
    const lowerCaseSearchTerm = e.target.value.toLocaleLowerCase()
    const result = projects.filter((project) => {
      const joinLangs = project.language.join('')
      return joinLangs.toLowerCase().includes(lowerCaseSearchTerm)
    })
    setFilteredProjects(result)
    console.log(result)
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">All Projects</h1>

      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="Search projects..."
          // value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
          onChange={(e) => handleSearch(e)}
          className="mr-2 w-8/12 grow rounded-md border border-gray-300 p-2"
        />
        <select
          className="select select-primary block w-4/12 max-w-xs "
          onChange={(e) => filterLanguage(e)}
        >
          <option disabled selected className="text-bold">
            使用技術
          </option>
          {selectOpetions.map((value, index) => (
            <option key={index} value={value}>
              <span>{value}</span>
            </option>
          ))}
        </select>
        {/* <button onClick={handleSearch} className="rounded-md bg-blue-500 p-2 text-white">
          Search
        </button> */}
      </div>

      {filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpenModal={() => handleOpenModal(project._id)} // モーダルを開く処理
              onOpenRatingModal={() => handleOpenRatingModal(project._id)}
              onDelete={function (id: string): void {
                throw new Error('Function not implemented.')
              }}
            />
          ))}
        </div>
      )}

      <CommentModalCard
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={selectedProjectId!} // 必ずプロジェクトIDがあることを前提
        updatedProject={(updatedComment) => {
          // コメントが追加された後の処理を実装
          console.log('Updated project with new comment:', updatedComment)
        }}
      />

      <RatingModalCard
        isOpen={isRatingModalOpen}
        onClose={handleCloseRatingModal}
        projectId={selectedProjectId!}
      />
    </div>
  )
}

export default ProjectsPage
