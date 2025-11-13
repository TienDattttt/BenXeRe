import React from 'react';
import { Formik, Form } from 'formik';
import InputField from './core/form-controls/input-field';
import Button from './core/button';

const SeatModal = ({ isOpen, onClose, onSave, seat }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white p-8 rounded-lg shadow-2xl w-1/2 z-10">
        <h2 className="text-2xl font-bold mb-4">{seat ? 'Edit Seat' : 'Add Seat'}</h2>
        <Formik
          initialValues={{
            scheduleId: seat ? seat.schedule.scheduleId : '',
            seatNumber: seat ? seat.seatNumber : '',
            isBooked: seat ? seat.isBooked : false,
            bookedById: seat && seat.user ? seat.user.userId : '',
          }}
          onSubmit={(values) => {
            onSave(values);
            onClose();
          }}
        >
          {() => (
            <Form>
              <InputField
                name="scheduleId"
                type="number"
                placeholder="Schedule ID"
                className="mb-4"
              />
              <InputField
                name="seatNumber"
                type="text"
                placeholder="Seat Number"
                className="mb-4"
              />
              <InputField
                name="isBooked"
                type="checkbox"
                className="mb-4"
              />
              <InputField
                name="bookedById"
                type="number"
                placeholder="Booked By ID"
                className="mb-4"
              />
              <Button type="submit" variant="primary" className="mr-2">
                Save
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SeatModal;