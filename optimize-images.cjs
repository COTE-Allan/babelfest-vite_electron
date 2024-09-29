const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Chemin vers le dossier public où se trouvent les images
const imageFolder = path.resolve(__dirname, 'src/renderer/public/filestoOptimize')

// Liste des formats d'image pris en charge
const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp', '.avif']

// Fonction pour optimiser une image
const optimizeImage = (imagePath, outputPath, format) => {
  let transformer = sharp(imagePath)

  // Optimisation selon le format
  switch (format) {
    case '.png':
      transformer = transformer.png({ quality: 80 })
      break
    case '.jpg':
    case '.jpeg':
      transformer = transformer.jpeg({ quality: 80 })
      break
    case '.webp':
      transformer = transformer.webp({ quality: 80 })
      break
    case '.avif':
      transformer = transformer.avif({ quality: 50 })
      break
    default:
      return // Format non supporté, ne rien faire
  }

  // Sauvegarde de l'image optimisée
  transformer
    .toFile(outputPath)
    .then(() => {
      console.log(`Image optimisée : ${outputPath}`)
    })
    .catch((err) => {
      console.error(`Erreur d'optimisation pour ${imagePath} :`, err)
    })
}

// Fonction pour parcourir le dossier et optimiser les images
const optimizeImagesInFolder = (folder) => {
  fs.readdir(folder, (err, files) => {
    if (err) {
      return console.error('Erreur de lecture du dossier :', err)
    }

    files.forEach((file) => {
      const filePath = path.join(folder, file)
      const fileExtension = path.extname(file).toLowerCase()
      const optimizedFolder = path.join(folder, 'optimized')
      const outputPath = path.join(optimizedFolder, file)

      // Si c'est un sous-dossier, on le traite de manière récursive
      if (fs.lstatSync(filePath).isDirectory()) {
        optimizeImagesInFolder(filePath)
      } else if (supportedFormats.includes(fileExtension)) {
        // Créer le dossier 'optimized' s'il n'existe pas
        if (!fs.existsSync(optimizedFolder)) {
          fs.mkdirSync(optimizedFolder)
        }
        // Optimiser l'image
        optimizeImage(filePath, outputPath, fileExtension)
      }
    })
  })
}

// Optimiser toutes les images dans le dossier spécifié
optimizeImagesInFolder(imageFolder)
