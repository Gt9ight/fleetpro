import React, { useEffect, useState } from 'react';
import { db } from '../../utillis/Firebase';
import { getDocs, collection } from 'firebase/firestore';
import { useSwipeable } from 'react-swipeable';
import './customerprogress.css';

const Customerprogress = () => {
//   const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);
//   const [showCustomerCategory, setShowCustomerForCategory] = useState(null);
//   const [isImagePopupVisible, setIsImagePopupVisible] = useState(false);
//   const [selectedImageUrl, setSelectedImageUrl] = useState('');
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, 'fleets'));
//         const fetchedFleet = [];
//         querySnapshot.forEach((doc) => {
//           fetchedFleet.push({ id: doc.id, ...doc.data() });
//         });
//         setFleetsFromFirestore(fetchedFleet);
//       } catch (error) {
//         console.error('Error fetching documents: ', error);
//       }
//     };

//     fetchData();
//   }, []);

//   const ByCustomer = {};
//   FleetsFromFirestore.forEach((unit) => {
//     if (!ByCustomer[unit.customer]) {
//       ByCustomer[unit.customer] = [];
//     }
//     ByCustomer[unit.customer].push(unit);
//   });

//   const getCustomerProgress = (cust) => {
//     const totalTodos = ByCustomer[cust]?.length || 0;
//     const completedTodos = ByCustomer[cust]?.filter((unit) => unit.done).length || 0;
//     return totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
//   };

//   const toggleCustomerForCategory = (cust) => {
//     if (showCustomerCategory === cust) {
//       setShowCustomerForCategory(null);
//     } else {
//       setShowCustomerForCategory(cust);
//     }
//   };

//   const getCustomerFleetCount = (cust) => {
//     return ByCustomer[cust]?.length || 0;
//   };

//   const getCustomerCompletedCount = (cust) => {
//     return ByCustomer[cust]?.filter((unit) => unit.done).length || 0;
//   };

//   const handleImageClick = (imageUrls) => {
//     setSelectedImageUrl(imageUrls);
//     setCurrentImageIndex(0);
//     setIsImagePopupVisible(true);
//   };

//   const handleNextImage = () => {
//     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedImageUrl.length);
//   };

//   const handlePrevImage = () => {
//     setCurrentImageIndex((prevIndex) => 
//       (prevIndex === 0 ? selectedImageUrl.length : prevIndex) - 1
//     );
//   };

//   const handlers = useSwipeable({
//     onSwipedLeft: handleNextImage,
//     onSwipedRight: handlePrevImage,
//     preventDefaultTouchmoveEvent: true,
//     trackMouse: true,
//   });

//   const closeImagePopup = () => {
//     setIsImagePopupVisible(false);
//     setSelectedImageUrl([]);
//   };

//   const UnitImages = ({ comments }) => {
//     if (!comments || comments.length === 0) return null;
  
//     return (
//       <div>
//         {comments.map((comment, index) => (
//           <div key={index} className="image-comment-container">
//             <div className="comments">
//               <p><strong>Position:</strong> {comment.comment1}</p>
//               <p><strong>Tread Depth:</strong> {comment.comment2}/32</p>
//             </div>
//             <div className="image-stack">
//               {comment.imageUrls && comment.imageUrls.length > 1 ? (
//                 <div
//                   className="image-overlay"
//                   onClick={() => handleImageClick(comment.imageUrls)}
//                 >
//                   {comment.imageUrls.slice(0, 3).map((url, imgIndex) => (
//                     <img
//                       key={imgIndex}
//                       src={url}
//                       alt={`Thumbnail ${imgIndex + 1}`}
//                       className={`thumbnail-image ${
//                         imgIndex === 0 ? 'top' : 'stacked'
//                       }`}
//                     />
//                   ))}
//                 </div>
//               ) : comment.imageUrls && comment.imageUrls.length === 1 ? (
//                 <img
//                   src={comment.imageUrls[0]}
//                   alt="Single Image"
//                   className="single-image"
//                   onClick={() => handleImageClick(comment.imageUrls)}
//                 />
//               ) : null}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div>
//       <div className='current-user'>
//         <p className='username'>Welcome,</p>
//         {/* <button className='logout'>Log Out</button> */}
//       </div>
//       <h2 className='fleetList-title'>Fleets</h2>

//       <div className="category-cards">
//         {Object.keys(ByCustomer).map((Fleetcustomer) => (
//           <div key={Fleetcustomer} className="category-card">
//             <div
//               onClick={() => toggleCustomerForCategory(Fleetcustomer)}
//               className={`category-header ${showCustomerCategory === Fleetcustomer ? 'active' : ''}`}
//             >
//               <h3>{Fleetcustomer} - {getCustomerCompletedCount(Fleetcustomer)}/{getCustomerFleetCount(Fleetcustomer)} Units</h3>
//               <div className="progress-bar">
//                 <div
//                   className="progress-bar-fill"
//                   style={{ width: `${getCustomerProgress(Fleetcustomer)}%` }}
//                 ></div>
//               </div>
//               <p>{getCustomerProgress(Fleetcustomer).toFixed(2)}% Complete</p>
//             </div>
//             {showCustomerCategory === Fleetcustomer && (
//               <ul className="fleet-list">
//                 {ByCustomer[Fleetcustomer]
//                   .sort((unitA, unitB) => {
//                     const priorityOrder = { low: 3, medium: 2, high: 1 };
//                     return priorityOrder[unitA.priority] - priorityOrder[unitB.priority];
//                   })
//                   .map((unit) => (
//                     <li key={unit.id} className={`unit-item ${unit.done ? 'done' : ''} ${unit.priority}`}>
//                       <strong>Unit Number:</strong> {unit.UnitNumber} <strong>Priority:</strong> {unit.priority}
//                       <ul>
//                         {unit.TaskSpecifics &&
//                           unit.TaskSpecifics.length > 0 &&
//                           unit.TaskSpecifics.map((info, index) => (
//                             <li key={index}>
//                               <strong>Position:</strong> {info.position}, <strong>Specifics:</strong> {info.specifics}, <strong>Tread Depth:</strong> {info.treadDepth}/32
//                               <p className='tireNeeded'><strong>Tire Needed:</strong> {info.neededTire}</p>
//                             </li>
//                           ))}
//                       </ul>
//                       <UnitImages comments={unit.comments} />
//                     </li>
//                   ))}
//               </ul>
//             )}
//           </div>
//         ))}
//       </div>

//       {isImagePopupVisible && (
//   <div className="image-popup" {...handlers}>
//     <button className="nav-button left" onClick={handlePrevImage}>
//       &lt;
//     </button>
//     <img
//       src={selectedImageUrl[currentImageIndex]}
//       alt="Popup"
//       className="popup-image"
//     />
//     <button className="nav-button right" onClick={handleNextImage}>
//       &gt;
//     </button>
//     <button className="close-button" onClick={closeImagePopup}>
//       X
//     </button>
//   </div>
// )}
//     </div>
//   );
};

export default Customerprogress;