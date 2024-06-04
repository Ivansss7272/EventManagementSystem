import React, { useMemo } from 'react';

interface HeaderProps {
  appTitle: string;
}

const Header: React.FC<HeaderProps> = ({ appTitle }) => {
  const navLinks = useMemo(() => [
    { href: "/", text: "Home" },
    { href: "/events", text: "Events" },
    { href: "/about", text: "About Us" },
    { href: "/contact",  text: "Contact" },
  ], []);

  return (
    <header style={{ backgroundColor: '#f0f0f0', padding: '20px', textAlign: 'center' }}>
      <h1>{appTitle}</h1>
      <nav>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {navLinks.map((link) => (
            <li key={link.text} style={{ display: 'inline', marginRight: '20px' }}>
              <a href={link.href}>{link.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;