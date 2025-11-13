import React, { useState, useEffect } from 'react';

const BannerModal = ({ isOpen, onClose, onSave, banner }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setImage(banner.image);
      setContent(banner.content);
      setDescription(banner.description);
      setIsActive(banner.isActive);
    } else {
      setTitle('');
      setImage(null);
      setContent('');
      setDescription('');
      setIsActive(false);
    }
  }, [banner]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bannerData = { title, image, content, description, isActive };
    onSave(bannerData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center">
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>
    <div className="relative bg-white p-8 rounded-lg shadow-2xl w-1/2 z-10">
        <h2 className="text-2xl font-bold mb-4">{banner ? 'Edit Banner' : 'Add Banner'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Active</label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;