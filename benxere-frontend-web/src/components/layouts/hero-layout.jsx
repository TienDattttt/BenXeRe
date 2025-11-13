import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form } from "formik";
import SelectField from "../core/form-controls/select-field";
import DatePickerField from "../core/form-controls/date-picker-field";
import Button from "../core/button";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EventIcon from '@mui/icons-material/Event';

const HeroLayout = ({ children, locations, validationSchema, handleSearch }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showReturnDate, setShowReturnDate] = useState(false);
  const [selectedService, setSelectedService] = useState("Xe khách");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const serviceButtonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div
        className="relative py-16 overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.1))",
          minHeight: "120vh",
        }}
      >
        {/* Animated Background Elements */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('herolayout.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.7,
            minHeight: "80vh", 
            filter: "brightness(1.1) contrast(1.1)"
          }}
        />

        <div className="relative container mx-auto px-4">
          {/* Main Title */}
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            </h1>
            <div className="h-7"></div> 
          </motion.div>

          {/* Search Form */}
          <Formik
            initialValues={{
              from: "",
              to: "",
              date: "",
              returnDate: "",
              service: selectedService,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSearch}
          >
            {({ values, setFieldValue }) => {
              const fromOptions = locations?.filter((l) => l.value !== values.to);
              const toOptions = locations?.filter((l) => l.value !== values.from);

              return (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={formVariants}
                >
                  <Form className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 max-w-4xl mx-auto">
                    {/* Service Selection */}
                    <div className="flex justify-center mb-8 gap-4">
                      {["Xe khách"].map((service) => (
                        <motion.button
                          key={service}
                          variants={serviceButtonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                          type="button"
                          onClick={() => {
                            setSelectedService(service);
                            setFieldValue("service", service);
                          }}
                          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                            values.service === service
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {service}
                        </motion.button>
                      ))}
                    </div>

                    {/* Location and Date Selection */}
                    <div className="mb-8">
                      {/* Origin and Destination Selection */}
                      <div className="relative flex flex-col md:flex-row mb-5">
                        <div className="flex-1 relative mb-4 md:mb-0">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                            <LocationOnIcon />
                          </div>
                          <SelectField
                            name="from"
                            placeholder="Nơi xuất phát"
                            options={fromOptions}
                            className="w-full pl-10 py-3.5 rounded-lg shadow-sm border-2 border-gray-100 focus:border-blue-400 transition-all"
                          />
                        </div>
                        
                        {/* Swap Button */}
                        <motion.div 
                          className="hidden md:flex items-center justify-center px-2 mx-2"
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <button 
                            type="button" 
                            className="p-2.5 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                            onClick={() => {
                              const temp = values.from;
                              setFieldValue("from", values.to);
                              setFieldValue("to", temp);
                            }}
                          >
                            <SwapHorizIcon className="text-blue-600" />
                          </button>
                        </motion.div>
                        
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                            <LocationOnIcon />
                          </div>
                          <SelectField
                            name="to"
                            placeholder="Nơi đến"
                            options={toOptions}
                            className="w-full pl-10 py-3.5 rounded-lg shadow-sm border-2 border-gray-100 focus:border-blue-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                            <EventIcon />
                          </div>
                          <DatePickerField
                            name="date"
                            placeholder="Ngày đi"
                            className="w-full pl-10 py-3.5 rounded-lg shadow-sm border-2 border-gray-100 focus:border-blue-400 transition-all"
                          />
                        </div>
                        
                        <AnimatePresence>
                          {showReturnDate ? (
                            <motion.div
                              className="flex-1 relative"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                                <EventIcon />
                              </div>
                              <DatePickerField
                                name="returnDate"
                                placeholder="Ngày về"
                                className="w-full pl-10 py-3.5 rounded-lg shadow-sm border-2 border-gray-100 focus:border-blue-400 transition-all"
                              />
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {!showReturnDate && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowReturnDate(true)}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300"
                          >
                            + Thêm ngày về
                          </Button>
                        )}
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg"
                        >
                          Tìm Chuyến Xe
                        </Button>
                      </motion.div>
                    </div>
                  </Form>
                </motion.div>
              );
            }}
          </Formik>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default HeroLayout;
