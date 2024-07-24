import '../../styles/interface/menuFooter.scss'
import changelog from '../../jsons/changelog.json'
import { BsTwitter } from 'react-icons/bs'
import { FaDiscord } from 'react-icons/fa'
import HudNavLink from '../items/hudNavLink'

export default function MenuFooter() {
  const verName = changelog.slice(-1)[0].title

  return (
    <footer className="menuFooter">
      <a href="https://cielesis.fr" target="_blank" rel="noreferrer">
        BABELFEST {verName}, conçu par Cielesis.
      </a>
      <nav>
        <HudNavLink to={'https://twitter.com/babelfest_'}>
          <span className="hidden-span">Twitter</span>
          <BsTwitter size={40} />
        </HudNavLink>
        <HudNavLink to={'https://discord.gg/DF7GyJdG28'}>
          <span className="hidden-span">Discord</span>
          <FaDiscord size={40} />
        </HudNavLink>
      </nav>
    </footer>
  )
}
