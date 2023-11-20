import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ImageList() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/images');
        setImages(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
        {images.map((image) => (
            <img key={image._id} src={image.data} alt={image.name} />
        ))}
    </div>

  );
}

export default ImageList;