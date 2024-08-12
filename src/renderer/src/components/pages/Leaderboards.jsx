import { useContext, useEffect, useState } from 'react'
import { getRankClass, getTopUsersByMMR } from '../others/toolBox'
import '../../styles/pages/leaderboards.scss'
import ProfilePicture from '../esthetics/profilePicture'

const Leaderboards = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchTopUsers = async () => {
      const users = await getTopUsersByMMR(20)
      setUsers(users)
    }
    fetchTopUsers()
  }, [])

  if (!users) return

  return (
    <div className="leaderboard">
      <div className="leaderboard-list">
        {users.map((user) => (
          <div className="leaderboard-list-item">
            <span className={`rank ${getRankClass(user.rank)} leaderboard-list-item-rank `}>
              {user.rank}
            </span>
            <ProfilePicture customUser={user} size={80} border={user.primaryColor} />
            <div className="leaderboard-list-item-content">
              <h1>{user.username}</h1>
              <h2>{user.title}</h2>
            </div>
            <img
              src={user.banner}
              alt="bannière du joueur"
              className="leaderboard-list-item-banner"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboards
