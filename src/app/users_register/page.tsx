'use client'

import { storage } from '@/lib/firebase/firebase'
import { UserFormReducer, initialState } from '@/state/reducer/LoginFormInpurReducer'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import React, { useReducer, useState } from 'react'

const Register = () => {
  const [state, dispatch] = useReducer(UserFormReducer, initialState)
  const router = useRouter()
  // const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'userImage') {
      const selectedFile = e.target.files?.[0]
      saveImage(selectedFile as File)

      // if (selectedFile) {
      //   setFile(selectedFile)
      //   setFileName(selectedFile.name)
      // } else {
      //   setFile(null) // ファイルが選択されなかった場合の処理
      //   setFileName('') // 名前もクリア
      // }
    }
    dispatch({ type: 'SET_DATA', name, value, fileName })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || '登録に失敗しました。')
      }

      router.push('/users_login')
    } catch (err) {
      const error = err as Error
      console.error('エラー:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        {/* {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>} */}
        <h2 className="mb-4 text-center text-2xl font-bold text-black">会員登録</h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          {/* フォームフィールド */}
          <div>
            <label className="block text-sm font-medium text-gray-700">UserName:</label>
            <input
              type="text"
              name="userName"
              value={state.userName}
              onChange={(e) => handleChange(e)}
              placeholder="username"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス:</label>
            <input
              type="email"
              name="email"
              value={state.email}
              onChange={(e) => handleChange(e)}
              placeholder="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード:</label>
            <input
              type="password"
              name="password"
              value={state.password}
              onChange={(e) => handleChange(e)}
              placeholder="password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">学校:</label>
            <input
              type="text"
              name="school"
              value={state.school}
              onChange={(e) => handleChange(e)}
              placeholder="学校"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">希望エンジニア:</label>
            <input
              type="text"
              name="position"
              value={state.position}
              onChange={(e) => handleChange(e)}
              placeholder="例: バックエンド, フロントエンド"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">イメージ:</label>
            <input
              type="file"
              name="userImage"
              // value={state.userImage}
              onChange={(e) => handleChange(e)}
              placeholder="イメージ"
              className="file-input file-input-bordered mt-1 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub:</label>
            <input
              type="text"
              name="githubAccount"
              value={state.githubAccount}
              onChange={(e) => handleChange(e)}
              placeholder="GitHub アカウント"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">X:</label>
            <input
              type="text"
              name="xAccount"
              value={state.xAccount}
              onChange={(e) => handleChange(e)}
              placeholder="X アカウント"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            登録
          </button>
          <button
            type="button"
            onClick={() => router.push('/users_login')}
            className="mt-2 w-full rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            ログインへ
          </button>
        </form>
      </div>
    </div>
  )
}
export default Register
