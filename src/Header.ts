import React from 'react';

interface HeaderProps {
  appTitle: string;
}

const Header: React.FC<HeaderProps> = ({ appTitle }) => {
  return (
    <header style={{ backgroundColor: '#f0f0f0', padding: '20px', textAlign: 'center' }}>
      <h1>{appTitle}</h1>
      <nav>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ display: 'inline', marginRight: '20px' }}>
            <a href="/">Home</a>
          </li>
          <li style={{ display: 'inline', marginRight: '20px' }}>
            <a href="/events">Events</a>
          </li>
          <li style={{ display: 'inline', marginRight: '20px' }}>
            <a href="/about">About Us</a>
          </li>
          <li style={{ display: 'inline' }}>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;