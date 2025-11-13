import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllSeats, createSeat, updateSeat, deleteSeat } from '../../services/seat-service';
import SeatModal from '../../components/seat-modal';

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getAllSeats();
      setSeats(data);
    };

    fetchSeats();
  }, []);

  const handleAddSeat = () => {
    setSelectedSeat(null);
    setIsModalOpen(true);
  };

  const handleEditSeat = (seat) => {
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const handleSaveSeat = async (seatData) => {
    if (selectedSeat) {
      await updateSeat(selectedSeat.seatId, seatData);
    } else {
      await createSeat(seatData);
    }
    const data = await getAllSeats();
    setSeats(data);
    setIsModalOpen(false);
  };

  const handleDeleteSeat = async (id) => {
    await deleteSeat(id);
    const data = await getAllSeats();
    setSeats(data);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Seats</h1>
      <button onClick={handleAddSeat} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Add Seat
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Schedule ID</th>
            <th className="py-2">Seat Number</th>
            <th className="py-2">Is Booked</th>
            <th className="py-2">Booked By ID</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {seats.map((seat) => (
            <tr key={seat.seatId}>
              <td className="py-2">{seat.seatId}</td>
              <td className="py-2">{seat.schedule.scheduleId}</td>
              <td className="py-2">{seat.seatNumber}</td>
              <td className="py-2">{seat.isBooked ? 'Yes' : 'No'}</td>
              <td className="py-2">{seat.user ? seat.user.userId : 'N/A'}</td>
              <td className="py-2">
                <button onClick={() => handleEditSeat(seat)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteSeat(seat.seatId)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SeatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSeat}
        seat={selectedSeat}
      />
    </AdminLayout>
  );
};

export default Seats;