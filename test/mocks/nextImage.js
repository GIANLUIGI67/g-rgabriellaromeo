// tests/mocks/nextImage.js
// Mock compatibile con RTL: rende una <img> semplice.

import React from 'react';

const NextImage = ({ src = '', alt = '', ...props }) => (
  // eslint-disable-next-line jsx-a11y/alt-text
  <img src={typeof src === 'string' ? src : (src?.src || '')} alt={alt} {...props} />
);

export default NextImage;
