import React, { FC } from 'react';

const companyName = process.env.REACT_APP_COMPANY_NAME || 'Default Company Name';
const contactEmail = process.env.REACT_APP_CONTACT_EMAIL || 'contact@example.com';
const currentYear = new Date().getFullYear();

const Footer: FC = () => (
  <footer style={{ textAlign: 'center', padding: '20px', marginTop: '30px', background: '#f0f0f0' }}>
    <p>{`${companyName} © ${currentYear}`}</p>
    <p>For inquiries, contact us at <a href={`mailto:${contactEmail}`}>{contact)Email}</a></p>
  </footer>
);

export default Footer;