import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../services/banner-service';
import BannerModal from '../../components/modals/banner-modal';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const data = await getAllBanners();
      setBanners(data.result || []);
    };

    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (bannerData) => {
    if (selectedBanner) {
      await updateBanner(selectedBanner.bannerId, bannerData);
    } else {
      await createBanner(bannerData);
    }
    const data = await getAllBanners();
    setBanners(data.result || []);
    setIsModalOpen(false);
  };

  const handleDeleteBanner = async (id) => {
    await deleteBanner(id);
    const data = await getAllBanners();
    setBanners(data.result || []);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Banners</h1>
      <button onClick={handleAddBanner} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Add Banner
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Title</th>
            <th className="py-2">Active</th>
            <th className="py-2">Description</th>
            <th className="py-2">Content</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.bannerId}>
              <td className="py-2">{banner.bannerId}</td>
              <td className="py-2">{banner.title}</td>
              <td className="py-2">{banner.isActive ? 'Yes' : 'No'}</td>
              <td className="py-2">{banner.description}</td>
              <td className="py-2">{banner.content}</td>
              <td className="py-2">
                <button onClick={() => handleEditBanner(banner)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteBanner(banner.bannerId)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBanner}
        banner={selectedBanner}
      />
    </AdminLayout>
  );
};

export default Banners;