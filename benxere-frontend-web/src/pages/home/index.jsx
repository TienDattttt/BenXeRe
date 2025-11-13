import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";

import { getLocations, CommonDispatchContext, CommonStateContext } from "../../contexts/common";
import { loadLocations } from "../../utils/load-location";

import HeroLayout from "../../components/layouts/hero-layout";

import PopularRouteCard from "./components/PopularRouteCard";
import ServiceHighlight from "./components/ServiceHighlight";
import TestimonialCard from "./components/TestimonialCard";
import StatisticItem from "./components/StatisticItem";
import LoadingCard from "./components/LoadingCard";

// Constants
import { 
  validationSchema,
  popularRoutes,
  serviceHighlights,
  testimonials,
  statistics
} from "./components/homeConstants";

const HomePage = () => {
  const { locations } = useContext(CommonStateContext);
  const dispatch = useContext(CommonDispatchContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0.2]);
  const titleY = useTransform(scrollY, [0, 200], [0, 100]);

  const handleSearch = (values) => {
    const { from, to, date, returnDate, service } = values;
    navigate({
      pathname: "/routes",
      search: `?originCode=${from}&destinationCode=${to}&date=${date}&returnDate=${returnDate}&service=${service}`,
    });
  };

  useEffect(() => {
    getLocations(dispatch).finally(() => setLoading(false));
  }, [dispatch]);

  const locationOptions = loadLocations();

  return (
    <>
      <HeroLayout
        locations={locationOptions}
        validationSchema={validationSchema}
        handleSearch={handleSearch}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
          className="py-12"
        >
          {/* Popular Routes Section */}
          <section className="mb-24">
            <motion.h2
              style={{ 
                opacity: titleOpacity,
                y: titleY
              }}
              className="text-3xl font-bold text-center mb-12 text-blue-900"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      ease: "easeOut"
                    },
                  },
                }}
              >
                Tuyến đường phổ biến
              </motion.span>
            </motion.h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingCard key={i} index={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularRoutes.map((route, index) => (
                  <PopularRouteCard key={index} route={route} index={index} />
                ))}
              </div>
            )}
          </section>

          {/* Service Highlights Section */}
          <section className="mb-24">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-blue-900"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              Dịch vụ nổi bật
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {serviceHighlights.map((service, index) => (
                <ServiceHighlight key={index} service={service} index={index} />
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="mb-24">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-blue-900"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              Khách hàng nói gì về chúng tôi
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} index={index} />
              ))}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-24 bg-gradient-to-r from-blue-500 to-blue-700 py-16 rounded-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
              {statistics.map((stat, index) => (
                <StatisticItem key={index} stat={stat} index={index} />
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.5,
                },
              },
            }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg"
              onClick={() => navigate('/routes')}
            >
              Xem tất cả tuyến đường
            </motion.button>
          </motion.div>
        </motion.div>
      </HeroLayout>
    </>
  );
};

export default HomePage;