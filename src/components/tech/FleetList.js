import React, { useEffect, useState } from 'react';
import { db, storage } from '../../utillis/Firebase';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './fleetList.css';
import imageCompression from 'browser-image-compression';
import { Oval } from 'react-loader-spinner';

const FleetList = () => {
  const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);
  const [showCustomerCategory, setShowCustomerForCategory] = useState(null);
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [comment, setComment] = useState({ comment1: '', comment2: '' });
  const [isImagePopupVisible, setImagePopupVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDone = async (UnitId, isDone) => {
    try {
      const todoRef = doc(db, 'fleets', UnitId);
      await updateDoc(todoRef, { done: isDone });
      const updatedTask = FleetsFromFirestore.map((unit) =>
        unit.id === UnitId ? { ...unit, done: isDone } : unit
      );
      setFleetsFromFirestore(updatedTask);
    } catch (error) {
      console.error('Error marking todo as done: ', error);
    }
  };

  const compressAndUploadImages = async (UnitId, files, comments) => {
    try {
      setIsLoading(true);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
  
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          return await imageCompression(file, options);
        })
      );
  
      await uploadImages(UnitId, compressedFiles, comments);
    } catch (error) {
      console.error('Error compressing images:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  const uploadImages = async (UnitId, files, comments) => {
    try {
      const existingUnit = FleetsFromFirestore.find(unit => unit.id === UnitId);
      const existingImageUrls = existingUnit?.imageUrls || [];
      const existingComments = existingUnit?.comments || [];

      const newImageUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `${UnitId}/${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      const updatedImageUrls = [...existingImageUrls, ...newImageUrls];
      const updatedComments = [...existingComments, comments];

      const fleetRef = doc(db, 'fleets', UnitId);
      await updateDoc(fleetRef, {
        imageUrls: updatedImageUrls,
        comments: updatedComments,
      });

      setFleetsFromFirestore(prevState => {
        return prevState.map(unit =>
          unit.id === UnitId ? { ...unit, imageUrls: updatedImageUrls, comments: updatedComments } : unit
        );
      });

      console.log('Image and comments uploaded successfully');
      setCommentInputVisible(false);
      setComment({ comment1: '', comment2: '' });
    } catch (error) {
      console.error('Error uploading image and comments: ', error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleUploadClick = (unitId) => {
    setCurrentUnitId(unitId);
    setCommentInputVisible(true);
  };

  const handleCommentSubmit = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      compressAndUploadImages(currentUnitId, files, comment);
    };
    fileInput.click();
  };

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
          <p className='unit-comment'>
            Position: {comments[index]?.comment1 }<br />
            Tread Depth: {comments[index]?.comment2 || 'NA'}/32
          </p>
          <img
            src={imageUrl}
            alt={`Image ${index + 1}`}
            className='unit-image'
            onClick={() => handleImageClick(imageUrl)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className='current-user'>
        <p className='username'>Welcome, </p>
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
                      <strong>Unit Number:</strong> {unit.UnitNumber}
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
                      <button
                        className={`unit-button ${unit.done ? 'completed' : ''}`}
                        onClick={() => handleDone(unit.id, !unit.done)}
                      >
                        {unit.done ? 'Completed' : 'Mark Done'}
                      </button>
                      <button
                        className='unit-button'
                        onClick={() => handleUploadClick(unit.id)}
                      > 
                        Upload Image
                      </button>
                    </li>
                  ))}
              </ul> 
            )}
          </div>
        ))}
      </div>
      {commentInputVisible && (
        <>
          <div className="overlay" onClick={() => setCommentInputVisible(false)} />
          <div className="comment-popup">
            <input
              type="text"
              value={comment.comment1}
              onChange={(e) => setComment({ ...comment, comment1: e.target.value })}
              placeholder="Enter your first comment"
            />
            <input
              type="text"
              value={comment.comment2}
              onChange={(e) => setComment({ ...comment, comment2: e.target.value })}
              placeholder="Enter your second comment"
            />
            <button onClick={handleCommentSubmit}>Enter Position and Upload Images</button>
          </div>
        </>
      )}

      {isImagePopupVisible && (
        <>
          <div className="overlay" onClick={closeImagePopup} />
          <div className="image-popup">
            <img src={selectedImageUrl} alt="Selected" />
          </div>
        </>
      )}
      {isLoading && (
        <div className="loading-overlay">
          <Oval
            height={100}
            width={100}
            color="#4fa94d"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel='oval-loading'
            secondaryColor="#4fa94d"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      )}
    </div>
  );
};

export default FleetList;
