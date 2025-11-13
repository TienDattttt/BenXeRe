import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllFlashSales, createFlashSale, updateFlashSale, deleteFlashSale } from '../../services/flashSale-service';
import FlashSaleModal from '../../components/flashSale-modal';

const FlashSales = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      const data = await getAllFlashSales();
      setFlashSales(data.result || []);
    };

    fetchFlashSales();
  }, []);

  const handleAddFlashSale = () => {
    setSelectedFlashSale(null);
    setIsModalOpen(true);
  };

  const handleEditFlashSale = (flashSale) => {
    setSelectedFlashSale(flashSale);
    setIsModalOpen(true);
  };

  const handleSaveFlashSale = async (flashSaleData) => {
    if (selectedFlashSale) {
      await updateFlashSale(selectedFlashSale.saleId, flashSaleData);
    } else {
      await createFlashSale(flashSaleData);
    }
    const data = await getAllFlashSales();
    setFlashSales(data.result || []);
    setIsModalOpen(false);
  };

  const handleDeleteFlashSale = async (id) => {
    await deleteFlashSale(id);
    const data = await getAllFlashSales();
    setFlashSales(data.result || []);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Flash Sales</h1>
      <button onClick={handleAddFlashSale} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Add Flash Sale
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Schedule</th>
            <th className="py-2">Discount Percentage</th>
            <th className="py-2">Valid From</th>
            <th className="py-2">Valid To</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flashSales.map((flashSale) => (
            <tr key={flashSale.saleId}>
              <td className="py-2">{flashSale.saleId}</td>
              <td className="py-2">{flashSale.schedule.scheduleId}</td>
              <td className="py-2">{flashSale.discountPercentage}</td>
              <td className="py-2">{new Date(flashSale.validFrom).toLocaleString()}</td>
              <td className="py-2">{new Date(flashSale.validTo).toLocaleString()}</td>
              <td className="py-2">
                <button onClick={() => handleEditFlashSale(flashSale)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteFlashSale(flashSale.saleId)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <FlashSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFlashSale}
        flashSale={selectedFlashSale}
      />
    </AdminLayout>
  );
};

export default FlashSales;