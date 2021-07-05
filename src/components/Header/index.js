import { useRef, useState, useEffect } from 'react';
import { MdAccountCircle } from 'react-icons/md';
import PropTypes from 'prop-types';

const Header = ({username}) => {
  const usernameBtnRef = useRef();
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => setOpenMenu(!openMenu);

  const logout = () => {
    sessionStorage.clear();
    // need to use window object here to ensure page gets refreshed - this is to prevent running into issues with redirecting to Spotify Login page
    window.location.pathname = '/';
  };

  useEffect(() => {
    // `isMounted` will track component mounts and unmounts to prevent updating state on an unmounted component
    let isMounted = true;
    const eventListenerFunc = (e) => {
      const usernameBtnEl = usernameBtnRef.current;
      if (e.target !== usernameBtnEl && isMounted) setOpenMenu(false);
    }
    document.addEventListener('click', (e) => eventListenerFunc(e));

    return () => {
      isMounted = false;
      document.removeEventListener('click', (e) => eventListenerFunc(e))
    };
  }, []);

  return (
    <header>
      <nav className="header-nav">
        <ul>
          <li className="header-nav-item logo">
            <a href="/home">What's The <br></br> Song?</a>
          </li>
          <li className="header-nav-item leaderboard">
            <a href="/leaderboard">Leaderboard</a>
          </li>
          {username && <li className="header-nav-item username">
            <button onClick={toggleMenu} className="username-btn" ref={usernameBtnRef}>
              <MdAccountCircle className="icon"/>
              {username}
            </button>
            {openMenu &&
            <div className="account-dropdown">
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>}
          </li>}
        </ul>
      </nav>
    </header>
  )
};

Header.propTypes = {
  username: PropTypes.string
};

export default Header;
