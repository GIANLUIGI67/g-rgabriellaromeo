import React from 'react';
const NextImage = ({ src, alt = '', ...rest }) => <img src={typeof src === 'string' ? src : src?.src || ''} alt={alt} {...rest} />;
export default NextImage;
