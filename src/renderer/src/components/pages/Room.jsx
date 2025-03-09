import { useEffect, useContext, useState } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../Firebase'
import Hand from '../interface/inGame/Hand'
import Card from '../items/card'
import Arena from '../interface/inGame/Arena'
import Details from '../interface/inGame/Details'
import TurnAlert from '../esthetics/TurnAlert'
import SelectTarget from '../interface/inGame/SelectTargets'
import Modal from '../items/Modal'
import Winner from '../interface/inGame/Winner'
import { usePlaceCardOnArea } from '../controllers/ActionsController'
import MusicPlayer from '../interface/musicPlayer'
import Button from '../items/Button'
import Players from '../interface/inGame/Players'
import TurnTracker from '../interface/inGame/TurnTracker'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import InGameMenus from '../interface/inGame/InGameMenus'
import RightWindow from '../interface/inGame/RightWindow'
import LeftWindow from '../interface/inGame/LeftWindow'
import ClassicModal from '../items/ClassicModal'
import ScenesMaker from '../interface/inGame/ScenesMaker'
import { getBackgroundStyle } from '../others/toolBox'
import MatchIntro from '../esthetics/MatchIntro'
import { finishStandby } from '../others/standbySystem'

export default function Room() {
  const {
    room,
    phase,
    activePlayer,
    playerSelf,
    setRivalEndedAttack,
    askForTarget,
    detailCard,
    askForRectoVerso,
    setAskForRectoVerso,
    playerID,
    myColor,
    rivalColor,
    standby,
    myTurn,
    musicPlayer,
    scenes,
    isSpectator,
    winner
  } = useContext(GlobalContext)

  const placeCardOnArena = usePlaceCardOnArea()

  const [standbySyncTimer, setStandbySyncTimer] = useState(30)
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)

  const handleSyncRequest = async () => {
    console.log('Sync request triggered')
    await finishStandby(room)
  }

  useEffect(() => {
    if (phase === 3 && !isSpectator) {
      const gameDocRef = doc(db, 'games', room)
      const unsubscribe = onSnapshot(gameDocRef, (snapshot) => {
        const data = snapshot.data()

        if (data && data.playerAttackEnded && data.playerAttackEnded !== null) {
          setRivalEndedAttack(true)
          unsubscribe()
        }
      })

      return () => unsubscribe()
    }
  }, [phase])

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (standby[0] === playerID) {
      const standbyInterval = setInterval(() => {
        setStandbySyncTimer((prev) => {
          const newTime = prev - 1
          if (newTime <= 0) {
            clearInterval(standbyInterval)
            setIsButtonEnabled(true)
          }
          return newTime > 0 ? newTime : 0
        })
      }, 1000)

      return () => clearInterval(standbyInterval)
    }
  }, [standby, playerID])

  return (
    <>
      {(playerSelf.disconnected || !isOnline) && !isSpectator && (
        <ClassicModal>
          Vous avez été déconnecté, vérifiez votre connexion et redémmarez votre jeu dans les 30
          secondes pour revenir dans la partie sous peine de défaite.
        </ClassicModal>
      )}
      <div
        className={`gameContainer ${activePlayer === 1 ? 'red' : 'blue'} ${
          playerID == 2 && 'reversed'
        }`}
      >
        {playerSelf.hand != null && (
          <>
            {detailCard && <Details detailCard={detailCard} />}
            <TurnAlert />
            <TurnTracker />
            <Players />
            <div className={`musicPlayer-container ${musicPlayer ? 'active' : ''}`}>
              <MusicPlayer role="ingame" />
            </div>
            <Arena />
            <RightWindow />
            <LeftWindow />
            <InGameMenus />
            <Winner />
            {!winner && <MatchIntro />}
            {scenes !== null && scenes.length !== 0 && <ScenesMaker key={scenes[0].id} />}
            {!isSpectator && (
              <>
                <Hand>
                  {playerSelf.hand
                    .sort((a, b) => a.rarity - b.rarity)
                    .map((card, index) => {
                      return <Card key={index} card={card} />
                    })}
                </Hand>
                {askForTarget && <SelectTarget />}
                {standby[0] === playerID && (
                  <Modal>
                    <img src={LogoAnimate} alt="logo animé de chargement" className="spinner" />
                    En attente de l'autre joueur...
                    <Button
                      className={!isButtonEnabled && 'disabled'}
                      onClick={handleSyncRequest}
                      disabled={!isButtonEnabled}
                    >
                      [{standbySyncTimer !== 0 ? standbySyncTimer : 'PRÊT'}] Demande de
                      synchronisation
                    </Button>
                  </Modal>
                )}
                {askForRectoVerso !== false && (
                  <Modal showArena={true}>
                    <label>Choisissez comment invoquer votre carte</label>
                    <Button
                      onClick={() => {
                        placeCardOnArena(askForRectoVerso)
                        setAskForRectoVerso(false)
                      }}
                    >
                      Invoquer face recto
                    </Button>
                    <Button
                      onClick={() => {
                        placeCardOnArena(askForRectoVerso, false)
                        setAskForRectoVerso(false)
                      }}
                    >
                      Invoquer face verso
                    </Button>
                    <Button
                      onClick={() => {
                        setAskForRectoVerso(false)
                      }}
                    >
                      Annuler l'invocation
                    </Button>
                  </Modal>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div
        className="gameContainer-filter"
        style={{
          background: `${getBackgroundStyle(myTurn ? myColor : rivalColor)}`
        }}
      ></div>
    </>
  )
}
