import React, { useState, useRef, useEffect } from 'react';
import { AdvancedImage, lazyload } from '@cloudinary/react';
import { CloudinaryImage } from '@cloudinary/base';
import { format, quality } from '@cloudinary/base/actions/delivery';
import { auto } from '@cloudinary/base/qualifiers/format';
import { auto as qAuto } from '@cloudinary/base/qualifiers/quality';
import config from '../../config';
import PlaceholderImage from 'components/PlaceholderImage';

const getCloudinaryPublicID = (url) => {
  // https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files

  const publicID = 'reports/' + url.replace(/^https?:\/\//, '');

  return publicID;
};

const Image = ({
  publicID,
  className = '',
  alt,
  transformation = null,
  plugins = [lazyload()],
  style = null,
  height = 800,
  itemIdentifier,
  onImageLoaded = (_loadFailed) => {}, // eslint-disable-line no-unused-vars
}) => {
  const imageElement = useRef(null);

  const [loadFailed, setLoadFailed] = useState(!publicID || publicID.includes('placeholder.svg'));

  useEffect(() => {
    setLoadFailed(false);
    const img = imageElement.current?.imageRef.current;

    // In order for the error event to fire, the image must be in the document.
    if (img) {
      const errorListener = img.addEventListener('error', () => {
        setLoadFailed(true);
      });

      return () => img.removeEventListener('error', errorListener);
    }

    if (publicID && publicID.includes('placeholder.svg')) {
      setLoadFailed(true);
    }
  }, [publicID, imageElement.current?.imageRef.current]);

  useEffect(() => {
    onImageLoaded(loadFailed);
  }, [loadFailed, onImageLoaded]);

  const image = new CloudinaryImage(publicID, {
    cloudName: config.cloudinary.cloudName,
  });

  //TODO: this is a fix for this issue: https://github.com/PartnershipOnAI/aiid/issues/260
  // Setting transformation as a string skips the safe url check here: https://github.com/cloudinary/js-url-gen/blob/9a3d0a29ea77ddfd6f7181251615f34c2d8a6c5d/src/assets/CloudinaryFile.ts#L279
  const tmpImage = new CloudinaryImage();

  tmpImage.delivery(format(auto())).delivery(quality(qAuto()));

  if (transformation) {
    tmpImage.addTransformation(transformation);
  }

  image.transformation = tmpImage.transformation.toString();

  return (
    <div data-cy="cloudinary-image-wrapper" className={`h-full w-full aspect-[16/9]`}>
      <PlaceholderImage
        siteName="IncidentDatabase.AI"
        itemIdentifier={itemIdentifier}
        title={alt}
        className={`${className} ${
          !publicID || publicID == '' || loadFailed ? '' : 'hidden'
        } h-full w-full object-cover`}
        height={height}
        style={style}
        data-cy="cloudinary-image-placeholder"
      />
      <AdvancedImage
        data-cy={'cloudinary-image'}
        ref={imageElement}
        alt={alt}
        className={`${className} ${
          !publicID || publicID == '' || loadFailed ? 'hidden' : ''
        } h-full w-full object-cover`}
        cldImg={image}
        plugins={plugins}
        style={style}
        onError={() => {
          setLoadFailed(true);
        }}
      />
    </div>
  );
};

export { getCloudinaryPublicID, Image };
