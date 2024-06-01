import React, { useEffect, useState } from 'react';
import { db } from '../../utillis/Firebase';
import { getDocs, collection } from 'firebase/firestore';
import './customerprogress.css'

const Customerprogress = () => {
  const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);
  const [showCustomerCategory, setShowCustomerForCategory] =useState(null);
  const [isImagePopupVisible, setImagePopupVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fleets'));
        const fetchedFleet = [];
        querySnapshot.forEach((doc) => {
          fetchedFleet.push({ id: doc.id, ...doc.data() });
        });
        setFleetsFromFirestore(fetchedFleet);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };

    fetchData();
  }, []);
  
  const ByCustomer = {};
  FleetsFromFirestore.forEach((unit) => {
    if (!ByCustomer[unit.customer]) {
      ByCustomer[unit.customer] = [];
    }
    ByCustomer[unit.customer].push(unit);
  });

  
  const getCustomerProgress = (cust) => {
    const totalTodos = ByCustomer[cust]?.length || 0;
    const completedTodos = ByCustomer[cust]?.filter((unit) => unit.done).length || 0;

    return totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  };

  const toggleCustomerForCategory = (cust) => {
    if (showCustomerCategory === cust) {
      setShowCustomerForCategory(null);
    } else {
      setShowCustomerForCategory(cust);
    }
  };

  const getCustomerFleetCount = (cust) => {
    return ByCustomer[cust]?.length || 0;
  };

  const getCustomerCompletedCount = (cust) => {
    return ByCustomer[cust]?.filter((unit) => unit.done).length || 0;
  };


  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setImagePopupVisible(true);
  };

  const closeImagePopup = () => {
    setImagePopupVisible(false);
    setSelectedImageUrl('');
  };

  const UnitImages = ({ imageUrls, comments }) => (
    <div className="unit-images">
      {imageUrls && imageUrls.map((imageUrl, index) => (
        <div key={index}>
          <img
            src={imageUrl}
            alt={`Image ${index + 1}`}
            className='unit-image'
            onClick={() => handleImageClick(imageUrl)}
          />
          {comments[index] && <p className='unit-comment'>Position: {comments[index]}</p>}
        </div>
      ))}
    </div>
  );
  return (
    <div>
      <div className='current-user'>
        <p className='username'>Welcome,</p>        
        {/* <button className='logout'>Log Out</button> */}
      </div>
      <h2 className='fleetList-title'>Fleets</h2>

      <div className="category-cards">
        {Object.keys(ByCustomer).map((Fleetcustomer) => (
          <div key={Fleetcustomer} className="category-card">
            <div
              onClick={() => toggleCustomerForCategory(Fleetcustomer)}
              className={`category-header ${showCustomerCategory === Fleetcustomer ? 'active' : ''}`}
            >
              <h3>{Fleetcustomer} - {getCustomerCompletedCount(Fleetcustomer)}/{getCustomerFleetCount(Fleetcustomer)} Units</h3>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${getCustomerProgress(Fleetcustomer)}%` }}
                ></div>
              </div>
              <p>{getCustomerProgress(Fleetcustomer).toFixed(2)}% Complete</p>
            </div>
            {showCustomerCategory === Fleetcustomer && (
      <ul className="fleet-list">
      {ByCustomer[Fleetcustomer]
        .sort((unitA, unitB) => {
         const priorityOrder = { low: 3, medium: 2, high: 1 };
        return priorityOrder[unitA.priority] - priorityOrder[unitB.priority];
     }).map((unit) => (
      <li key={unit.id} className={`unit-item ${unit.done ? 'done' : ''} ${unit.priority}`}>                   
                    <strong>Unit Number:</strong> {unit.UnitNumber} <strong>Priority:</strong>{unit.priority}

                    <ul>
                      {unit.TaskSpecifics &&
                        unit.TaskSpecifics.length > 0 &&
                        unit.TaskSpecifics.map((info, index) => (
                          <li key={index}>
                            <strong>Position:</strong> {info.position}, <strong>Specifics:</strong>{' '}
                            {info.specifics}, <strong>Tread Depth:</strong> {info.treadDepth}/32
                            <p className='tireNeeded'><strong>Tire Needed:</strong> {info.neededTire}</p>
                          </li>
                        ))}
                    </ul>
                    <UnitImages imageUrls={unit.imageUrls} comments={unit.comments} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {isImagePopupVisible && (
        <>
          <div className="overlay" onClick={closeImagePopup} />
          <div className="image-popup">
            <img src={selectedImageUrl} alt="Selected" />
          </div>
        </>
      )}
    </div>
  );
};

export default Customerprogress;
