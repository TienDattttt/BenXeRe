// import React, { useEffect, useState } from 'react';
// import './bus-weather.css';

// const BusWeatherAnimation = () => {
//   const [isRaining, setIsRaining] = useState(true);
//   const [isSunny, setIsSunny] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsRaining(false);
//       setIsSunny(true);
//     }, 4000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <div className={`scene ${isSunny ? 'sunny' : ''}`}>
//       {isRaining && <div className={`rain ${!isRaining ? 'clearing' : ''}`} />}
//       <div className="sun" />
      
//       <div className="buildings-left">
//         <div className="building" style={{ height: '140px' }} />
//         <div className="building" style={{ height: '180px' }} />
//         <div className="building" style={{ height: '160px' }} />
//         <div className="tree" style={{ left: '10%' }} />
//         <div className="tree" style={{ left: '30%' }} />
//       </div>

//       <div className="buildings-right">
//         <div className="building" style={{ height: '150px' }} />
//         <div className="building" style={{ height: '170px' }} />
//         <div className="building" style={{ height: '130px' }} />
//         <div className="tree" style={{ right: '15%' }} />
//         <div className="tree" style={{ right: '35%' }} />
//       </div>

//       <div className="road" />
      
//       <div className="bus">
//         <div className="wheel front" />
//         <div className="wheel back" />
//       </div>
//     </div>
//   );
// };

// export default BusWeatherAnimation;