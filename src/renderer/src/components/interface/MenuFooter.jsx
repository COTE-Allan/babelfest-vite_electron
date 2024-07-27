import '../../styles/interface/menuFooter.scss'
import changelog from '../../jsons/changelog.json'
import { BsTwitter } from 'react-icons/bs'
import { FaDiscord } from 'react-icons/fa'

export default function MenuFooter() {
  const verName = changelog.slice(-1)[0].title
  return (
    <footer className="menuFooter">
      <a href="https://cielesis.fr" target="_blank" rel="noreferrer">
        BABELFEST {verName}, conçu par Cielesis.
      </a>
      <nav>
        <a
            className="hudNavLink"
            href="https://twitter.com/babelfest_"
            target="_blank"
            rel="noreferrer"
          >
          <span className="hidden-span">Twitter</span>
          <BsTwitter size={30} />
          </a>
          <a
            className="hudNavLink"
            href="https://discord.gg/WYCuMDTt45"
            target="_blank"
            rel="noreferrer"
          >
          <span className="hidden-span">Discord</span>
          <FaDiscord size={30} />
          </a>
      </nav>
    </footer>
  )
}
