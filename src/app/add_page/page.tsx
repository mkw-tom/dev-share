'use client'

import { storage } from '@/lib/firebase/firebase'
import { format } from 'date-fns'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { MultiValue } from 'react-select'
import Select from 'react-select'

// 使用する開発言語のリスト
const languageOptions = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C#', label: 'C#' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'Go', label: 'Go' },
  { value: 'PHP', label: 'PHP' },
  { value: 'React', label: 'React' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'TypeScript', label: 'TypeScript' },
]

const AddPage = () => {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('') // アプリの種類を追加
  const [language, setLanguage] = useState<MultiValue<{ value: string; label: string }>>([])
  const [startDuration, setStartDuration] = useState<Date | null>(null)
  const [endDuration, setEndDuration] = useState<Date | null>(null)
  const [link, setLink] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [notes, setNotes] = useState('') // 工夫した点を記入する欄を追加
  const [fileName, setFileName] = useState<string>('')

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const storedUserName = localStorage.getItem('userName')

    if (storedUserId) setUserId(storedUserId)
    if (storedUserName) setUserName(storedUserName)
  }, [])

  const saveImage = async (file: File) => {
    const storageRef = ref(storage, `images/${file?.name}`)
    await uploadBytes(storageRef, file).then((snapshot) => {
      console.log('success to save a photo')
    })
    const gsReference = ref(storage, `images/${file?.name}`)
    await getDownloadURL(gsReference).then((url) => {
      setFileName(url)
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    if (!userId || !userName) {
      setErrorMessage('ユーザー情報が見つかりません。ログインしてください。')
      return
    }

    if (!startDuration || !endDuration) {
      setErrorMessage('開始日と終了日を選択してください。')
      return
    }

    const newProject = {
      title,
      projectImage: fileName,
      type, // アプリの種類を追加
      language: language.map((lang) => lang.value),
      duration: `${format(startDuration, 'yyyy-MM-dd')} から ${format(endDuration, 'yyyy-MM-dd')}`,
      link,
      notes, // 工夫した点を追加
      addedBy: userId,
      addedByName: userName,
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setErrorMessage(errorData.error)
        return
      }
      router.push('/')
    } catch (error) {
      setErrorMessage('プロジェクトの追加に失敗しました')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <h1 className="text-xl font-bold">プロジェクト追加</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mt-4">
          <label className="mb-1 block">タイトル:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="プロジェクトタイトル"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">アプリの種類:</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="アプリの種類"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">アプリの種類:</label>
          <input
            type="file"
            onChange={(e) => saveImage(e.target.files?.[0] as File)}
            className="file-input file-input-bordered w-full rounded"
            placeholder="紹介画像"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">開発言語:</label>
          <Select
            isMulti
            options={languageOptions}
            value={language}
            onChange={setLanguage}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">開始日:</label>
          <DatePicker
            selected={startDuration}
            onChange={(date) => setStartDuration(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full rounded border p-2"
            placeholderText="開始日を選択"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">終了日:</label>
          <DatePicker
            selected={endDuration}
            onChange={(date) => setEndDuration(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full rounded border p-2"
            placeholderText="終了日を選択"
            minDate={startDuration || undefined}
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">アプリのリンク:</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded border p-2 text-blue-500"
            placeholder="https://your-app-link.com"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block">工夫した点:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="200文字以内で記入"
            maxLength={200}
          />
        </div>

        <button type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
          追加
        </button>
      </form>
    </div>
  )
}

export default AddPage
