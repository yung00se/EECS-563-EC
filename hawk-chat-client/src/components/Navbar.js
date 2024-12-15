// used to make an element clickable in React
import { Link } from 'react-router-dom'
import Jayhawk from '../images/jayhawk-face.png'

// Navbar component
const Navbar = () => {
    return (
        <header>
            <div className="container">
                <Link className='site-title' to='/'>
                    <img src={Jayhawk} style={{width:80, height:80}}></img>
                    <h1>Hawk Chat</h1>
                </Link>
            </div>
        </header>
    )
}

export default Navbar