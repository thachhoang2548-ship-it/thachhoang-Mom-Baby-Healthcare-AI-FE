import React from "react";
import "../../styles/SymptomEntryPage.css"; 

const ImagePreview = ({ image }) => (
  <div className="relative w-full aspect-video bg-background-light rounded-lg flex items-center justify-center overflow-hidden">
    {image ? (
      <img
        src={image}
        alt="Uploaded preview"
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
      />
    ) : (
      <div className="text-center text-subtle-light">
        <span className="material-symbols-outlined text-4xl">image</span>
        <p className="text-sm mt-1">Hình ảnh sẽ hiển thị ở đây</p>
      </div>
    )}
  </div>
);

export default ImagePreview;
