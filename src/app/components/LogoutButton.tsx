'use client'
import useAuth from '@/hooks/useAuth'
import LogoutIcon from '@mui/icons-material/Logout'

const LogoutButton = () => {
  const { logOut } = useAuth()
  return (
    <button
      onClick={logOut}
      className=" flex items-center gap-1 rounded-md px-4 py-2 text-white hover:text-purple-300"
    >
      <span>ログアウト</span>
      <LogoutIcon />
    </button>
  )
}

export default LogoutButton
