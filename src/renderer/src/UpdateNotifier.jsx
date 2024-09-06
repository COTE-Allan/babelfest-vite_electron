import React, { useEffect, useState } from 'react'
import ProgressBar from '@ramonak/react-progress-bar'
import './styles/updateNotifier.scss'

const UpdateNotifier = () => {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleUpdateAvailable = (info) => {
      console.log('Mise à jour disponible :', info)
      setUpdateInfo(info)
    }

    const handleDownloadProgress = (progress) => {
      console.log('Progression du téléchargement :', progress)
      setProgress(progress)
    }

    const handleUpdateDownloaded = (info) => {
      console.log('Mise à jour téléchargée :', info)
      setUpdateInfo(info)
      setProgress(null) // Reset progress once download is complete
    }

    const handleError = (err) => {
      console.error('Erreur lors de la mise à jour :', err)
      setError(err)
      setProgress(null) // Reset progress in case of error
    }

    console.log('Ajout des listeners pour les événements de mise à jour...')
    window.api.on('update_available', handleUpdateAvailable)
    window.api.on('download_progress', handleDownloadProgress)
    window.api.on('update_downloaded', handleUpdateDownloaded)
    window.api.on('update_error', handleError)

    return () => {
      console.log('Suppression des listeners pour les événements de mise à jour...')
      window.api.removeListener('update_available', handleUpdateAvailable)
      window.api.removeListener('download_progress', handleDownloadProgress)
      window.api.removeListener('update_downloaded', handleUpdateDownloaded)
      window.api.removeListener('update_error', handleError)
    }
  }, [])

  if (updateInfo || progress) {
    console.log('Affichage de l\'interface de mise à jour...')
    return (
      <div className="updateBanner fade-in">
        <div className="updateBanner-infos">Mise à jour disponible {updateInfo && updateInfo.version && `: ${updateInfo.version}`}</div>
        <span>
          Vous devez télécharger la mise à jour pour jouer, une fois téléchargée, le jeu se fermera
          pour ouvrir l'installateur.
        </span>
        <div className="updateBanner-download">
          {progress && (
            <>
              <div>
                Téléchargement en cours : {(progress.transferred / 1024 / 1024).toFixed(1)} MB /{' '}
                {(progress.total / 1024 / 1024).toFixed(2)} MB -{' '}
                {(progress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
              </div>
              <ProgressBar
                completed={`${((progress.transferred / progress.total) * 100).toFixed(1)}%`}
                bgColor="#4caf50"
                height="20px"
                labelAlignment="center"
                labelColor="#fff"
              />
            </>
          )}
        </div>
        {error && (
          <div className="updateBanner-error">
            Une erreur est survenue lors de la mise à jour : {error.message}
          </div>
        )}
      </div>
    )
  }

  console.log('Aucune mise à jour disponible pour le moment.', updateInfo)
  return null
}

export default UpdateNotifier
