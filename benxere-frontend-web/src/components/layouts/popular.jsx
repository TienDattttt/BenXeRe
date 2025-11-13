import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const Popular = ({ loading, routes, title }) => {
  return (
    <div className="container mx-auto py-10">
      <h3 className="text-2xl font-bold mb-6">
        {loading ? <Skeleton width={200} /> : title}
      </h3>
      <div className="grid grid-cols-4 gap-6">
        {routes.map((route, idx) => (
          <motion.div
            key={idx}
            className="bg-white shadow-md rounded-lg overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
          >
            <img src={`https://via.placeholder.com/300x200?text=Route+${idx + 1}`} alt={route.name} className="h-40 w-full object-cover" />
            <div className="p-4">
              <h4 className="font-semibold text-lg">{route.name}</h4>
              <span className="text-red-500 font-bold">{route.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Popular;
