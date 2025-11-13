import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BusinessIcon from '@mui/icons-material/Business';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import ImageIcon from '@mui/icons-material/Image';
import Input from './core/form-controls/input';
import Select from './core/form-controls/select';
import Typography from './core/typography';
import '../styles/modal.css';

const BusModal = ({ isOpen, onClose, onSave, bus }) => {
  const [busNumber, setBusNumber] = useState('');
  const [busType, setBusType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (bus) {
      setBusNumber(bus.busNumber);
      setBusType(bus.busType);
      setCapacity(bus.capacity);
      setCompanyName(bus.companyName);
      setImages([]);
      setPreviewUrls([]);
    } else {
      setBusNumber('');
      setBusType('');
      setCapacity('');
      setCompanyName('');
      setImages([]);
      setPreviewUrls([]);
    }
  }, [bus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const busData = { busNumber, busType, capacity, companyName };
    onSave(busData, images);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    setImages(prevImages => [...prevImages, ...files]);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...urls]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const removeImage = (index) => {
    setPreviewUrls(prevUrls => {
      // Get the URL to revoke
      const urlToRevoke = prevUrls[index];
      // Revoke the URL
      URL.revokeObjectURL(urlToRevoke);
      // Return new array without the removed item
      return prevUrls.filter((_, i) => i !== index);
    });
    
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!isOpen) return null;

  const busTypes = [
    { value: 'Sleeper', label: 'Xe giường nằm' },
    { value: 'Seater', label: 'Xe ghế ngồi' },
    { value: 'AC', label: 'Xe máy lạnh' },
    { value: 'Non-AC', label: 'Xe thường' }
  ];

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content admin-modal"
        >
          <div className="modal-header">
            <div className="modal-header-title">
              <DirectionsBusIcon className="modal-header-icon" />
              <Typography variant="h6" className="font-semibold">
                {bus ? 'Chỉnh Sửa Xe' : 'Thêm Xe Mới'}
              </Typography>
            </div>
            <button onClick={onClose} className="modal-close-button">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <form id="bus-form" onSubmit={handleSubmit} className="modal-body">
            <div className="form-grid">
              <div className="form-grid-full">
                <div className="input-group">
                  <DirectionsBusIcon className="input-group-icon" />
                  <Input
                    label="Biển số xe"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <AirlineSeatReclineNormalIcon className="input-group-icon" />
                  <Select
                    label="Loại xe"
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="form-select"
                    required
                    size="small"
                    options={[
                      { value: '', label: 'Chọn loại xe' },
                      ...busTypes
                    ]}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <AirlineSeatReclineNormalIcon className="input-group-icon" />
                  <Select
                    label="Số chỗ"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="form-select"
                    required
                    size="small"
                    options={[
                      { value: '', label: 'Chọn số chỗ' },
                      { value: '5', label: '5 chỗ' },
                      { value: '7', label: '7 chỗ' },
                      { value: '9', label: '9 chỗ' },
                      { value: '16', label: '16 chỗ' },
                      { value: '24', label: '24 chỗ' },
                      { value: '29', label: '29 chỗ' },
                      { value: '35', label: '35 chỗ' },
                      { value: '45', label: '45 chỗ' }
                    ]}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <div className="input-group">
                  <BusinessIcon className="input-group-icon" />
                  <Input
                    label="Tên nhà xe"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-grid-full space-y-2">
                <Typography variant="subtitle2" className="form-label">
                  Hình ảnh xe
                </Typography>
                <div className="flex items-center justify-center w-full">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-24 
                              border-2 border-dashed rounded-lg cursor-pointer 
                              transition-colors ${isDragging 
                                ? 'border-indigo-400 bg-indigo-50' 
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-4 pb-5">
                      <ImageIcon className={`w-7 h-7 mb-2 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <p className="text-sm text-slate-600 text-center">
                        <span className="font-medium">Nhấp để tải ảnh</span> hoặc kéo thả ảnh vào đây
                      </p>
                      {isDragging && (
                        <p className="text-xs text-indigo-600 mt-1">
                          Thả ảnh để tải lên
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group aspect-video"
                      >
                        <img
                          src={url}
                          alt={`Xem trước ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 
                                    group-hover:bg-opacity-40 transition-all duration-200 
                                    rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white p-1 rounded-full opacity-0 
                                     group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy bỏ
            </button>
            <motion.button
              type="submit"
              form="bus-form"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
            >
              {bus ? 'Cập nhật' : 'Thêm mới'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BusModal;