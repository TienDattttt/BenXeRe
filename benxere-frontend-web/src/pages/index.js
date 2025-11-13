import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { motion, useScroll, useTransform } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Button from "../components/core/button";
import DatePickerField from "../components/core/form-controls/date-picker-field";
import SelectField from "../components/core/form-controls/select-field";
import { getLocations, CommonDispatchContext, CommonStateContext } from "../contexts/common";
import HeroLayout from "../components/layouts/hero-layout";
import { loadLocations } from "../utils/load-location";
import Popular from "../components/layouts/popular";

const validationSchema = Yup.object().shape({
  from: Yup.string().required("Required"),
  to: Yup.string().required("Required"),
  date: Yup.string().required("Required"),
  returnDate: Yup.string(),
  service: Yup.string().required("Required"),
});
const popularRoutes = [
  { 
    name: "Sài Gòn - Đắk Lắk", 
    price: "259.000đ", 
    oldPrice: "300.000đ", 
    image: "/bxs-daklak.webp",
    description: "Trải nghiệm hành trình dài cùng gia đình",
    duration: "8 giờ",
    amenities: ["WiFi", "Nước uống", "Điều hòa"]
  },
  { 
    name: "Hà Nội - Hải Phòng", 
    price: "100.000đ", 
    oldPrice: "130.000đ", 
    image: "/bxs-hnoi.webp",
    description: "Khám phá thành phố cảng sôi động",
    duration: "2.5 giờ",
    amenities: ["WiFi", "Nước uống", "USB"]
  },
  { 
    name: "Sài Gòn - Đà Lạt", 
    price: "200.000đ", 
    image: "/bxs-dalat.webp",
    description: "Tận hưởng không khí mát mẻ vùng cao",
    duration: "7 giờ",
    amenities: ["WiFi", "Chăn ấm", "Điều hòa"]
  },
  { 
    name: "Đắk Lắk - Đà Nẵng", 
    price: "280.000đ", 
    image: "bxr-songhan.webp",
    description: "Khám phá thành phố biển xinh đẹp",
    duration: "12 giờ",
    amenities: ["WiFi", "Nước uống", "Gối"]
  },
];


const serviceHighlights = [
  {
    icon: "🚌",
    title: "Xe chất lượng cao",
    description: "Đội xe hiện đại, tiện nghi đầy đủ"
  },
  {
    icon: "⭐",
    title: "Dịch vụ 5 sao",
    description: "Phục vụ chuyên nghiệp, tận tâm"
  },
  {
    icon: "🎫",
    title: "Đặt vé dễ dàng",
    description: "Thanh toán nhanh chóng, an toàn"
  },
  {
    icon: "🔒",
    title: "An toàn tối đa",
    description: "Tài xế giàu kinh nghiệm, có bằng cấp"
  }
];
const testimonials = [
  {
    name: "Nguyễn Văn Hùng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "Dịch vụ tuyệt vời, xe rất sạch sẽ và thoải mái",
    rating: 5
  },
  {
    name: "Trần Thị Mai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    comment: "Nhân viên phục vụ rất chu đáo và thân thiện",
    rating: 5
  },
  {
    name: "Lê Minh Tuấn",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    comment: "Giá cả hợp lý, chất lượng dịch vụ tốt",
    rating: 4
  }
];

const statistics = [
  { number: "1M+", label: "Hành khách" },
  { number: "50+", label: "Tuyến đường" },
  { number: "100+", label: "Xe chất lượng cao" },
  { number: "98%", label: "Khách hàng hài lòng" }
];

const PopularRouteCard = ({ route, index }) => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <motion.div
      style={{ scale, opacity }}
      variants={{
        hidden: { opacity: 0.1, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: "easeOut",
            delay: index * 0.2,
          },
        },
      }}
      whileHover={{ 
        scale: 1.08,
        y: -10,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden group">
        <motion.img
          src={route.image}
          alt={route.name}
          className="w-full h-full object-cover transition-transform duration-500"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div 
          className="absolute bottom-0 left-0 p-4 text-white w-full"
          initial={{ y: 20, opacity: 0.8 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">{route.name}</h3>
          <p className="text-sm mb-2 opacity-90">{route.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <motion.span 
                className="text-lg font-bold block"
                whileHover={{ scale: 1.1 }}
              >
                {route.price}
              </motion.span>
              {route.oldPrice && (
                <span className="text-sm line-through opacity-75">{route.oldPrice}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm block">⏱️ {route.duration}</span>
              <div className="flex gap-1 mt-1">
                {route.amenities.map((amenity, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white/20 rounded-full">{amenity}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ServiceHighlight = ({ service, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.2,
          duration: 0.5
        }
      }
    }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-lg text-center"
  >
    <span className="text-4xl mb-4 block">{service.icon}</span>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
    <p className="text-gray-600">{service.description}</p>
  </motion.div>
);

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          delay: index * 0.2,
          duration: 0.5
        }
      }
    }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-lg"
  >
    <div className="flex items-center mb-4">
      <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold">{testimonial.name}</h4>
        <div className="flex text-yellow-400">
          {[...Array(testimonial.rating)].map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
      </div>
    </div>
    <p className="text-gray-600 italic">"{testimonial.comment}"</p>
  </motion.div>
);

const StatisticItem = ({ stat, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.5
        }
      }
    }}
    className="text-center"
  >
    <motion.span 
      className="text-4xl font-bold block text-white mb-2"
      whileHover={{ scale: 1.1 }}
    >
      {stat.number}
    </motion.span>
    <span className="text-white/80">{stat.label}</span>
  </motion.div>
);

const LoadingCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: index * 0.2,
        duration: 0.5
      }
    }}
    className="h-48 relative overflow-hidden"
  >
    <Skeleton height="100%" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
      animate={{
        x: ["-100%", "100%"],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  </motion.div>
);

const Home = () => {
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
                staggerChildren: 0.3, // cac phan tu hien cach nhau 0.3s 
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

export default Home;
