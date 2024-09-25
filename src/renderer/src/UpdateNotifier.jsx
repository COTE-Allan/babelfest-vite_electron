import React, { useEffect, useState } from 'react'
import ProgressBar from '@ramonak/react-progress-bar'
import './styles/updateNotifier.scss'

const UpdateNotifier = () => {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleUpdateAvailable = (info) => {
      setUpdateInfo(info)
    }

    const handleDownloadProgress = (progress) => {
      setProgress(progress)
    }

    const handleUpdateDownloaded = (info) => {
      setUpdateInfo(info)
      setProgress(null) // Reset progress once download is complete
    }

    const handleError = (err) => {
      console.error('Erreur lors de la mise à jour :', err)
      setError(err)
      setProgress(null) // Reset progress in case of error
    }

    window.api.on('update_available', handleUpdateAvailable)
    window.api.on('download_progress', handleDownloadProgress)
    window.api.on('update_downloaded', handleUpdateDownloaded)
    window.api.on('update_error', handleError)

    return () => {
      window.api.removeListener('update_available', handleUpdateAvailable)
      window.api.removeListener('download_progress', handleDownloadProgress)
      window.api.removeListener('update_downloaded', handleUpdateDownloaded)
      window.api.removeListener('update_error', handleError)
    }
  }, [])

  if (updateInfo || progress) {
    return (
      <div className="updateBanner fade-in">
        <div className="updateBanner-infos">
          Mise à jour disponible {updateInfo && updateInfo.version && `: ${updateInfo.version}`}
        </div>
        <span>
          Vous devez télécharger la mise à jour pour jouer, une fois téléchargée, le jeu va
          redémarrer.
        </span>
        <div className="updateBanner-download">
          {progress && (
            <>
              <div className="updateBanner-download-infos">
                Téléchargement en cours : {(progress.transferred / 1024 / 1024).toFixed(1)} MB /{' '}
                {(progress.total / 1024 / 1024).toFixed(2)} MB -{' '}
                {(progress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
              </div>
              <ProgressBar
                customLabel={`${((progress.transferred / progress.total) * 100).toFixed(1)}%`}
                completed={progress.transferred}
                maxCompleted={progress.total}
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

  return null
}

export default UpdateNotifier
