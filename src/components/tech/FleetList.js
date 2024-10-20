import React, { useEffect, useState } from 'react';
import { db, storage } from '../../utillis/Firebase';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './fleetList.css';
import imageCompression from 'browser-image-compression';
import { useSwipeable } from 'react-swipeable';
import { Oval } from 'react-loader-spinner';

const FleetList = () => {
  const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);
  const [showCustomerCategory, setShowCustomerForCategory] = useState(null);
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [comment1, setComment1] = useState('');
  const [comment2, setComment2] = useState('');
  const [isImagePopupVisible, setImagePopupVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const compressAndUploadImages = async (UnitId, files, comment1, comment2, markAsComplete) => {
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
  
      await uploadImages(UnitId, compressedFiles, comment1, comment2, markAsComplete);
    } catch (error) {
      console.error('Error compressing images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (UnitId, files, comment1, comment2, markAsComplete) => {
    try {
      const existingUnit = FleetsFromFirestore.find(unit => unit.id === UnitId);
      const existingComments = existingUnit?.comments || [];

      const newImageUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `${UnitId}/${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      const commentIndex = existingComments.findIndex(
        (comment) => comment.comment1 === comment1 && comment.comment2 === comment2
      );

      if (commentIndex !== -1) {
        existingComments[commentIndex].imageUrls = [
          ...new Set([...(existingComments[commentIndex].imageUrls || []), ...newImageUrls])
        ];
      } else {
        existingComments.push({
          comment1,
          comment2,
          imageUrls: newImageUrls,
        });
      }

      const updatedUnit = { ...existingUnit, comments: existingComments };
      const updatedCustomerFleet = [...FleetsFromFirestore];
      const unitIndex = updatedCustomerFleet.findIndex(unit => unit.id === UnitId);
      updatedCustomerFleet[unitIndex] = updatedUnit;
      setFleetsFromFirestore(updatedCustomerFleet);

      const fleetRef = doc(db, 'fleets', UnitId);
      await updateDoc(fleetRef, {
        comments: existingComments,
        done: markAsComplete,
      });

      console.log('Images and comments uploaded successfully');
      setCommentInputVisible(false);
      setComment1('');
      setComment2('');
    } catch (error) {
      console.error('Error uploading images and comments:', error);
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
      compressAndUploadImages(currentUnitId, files, comment1, comment2, true);
    };
    fileInput.click();
    setCommentInputVisible(false);
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

  const handleImageClick = (imageUrls) => {
    setSelectedImageUrl(imageUrls);
    setCurrentImageIndex(0);
    setImagePopupVisible(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedImageUrl.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex === 0 ? selectedImageUrl.length : prevIndex) - 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const closeImagePopup = () => {
    setImagePopupVisible(false);
    setSelectedImageUrl([]);
  };

  const UnitImages = ({ comments }) => {
    if (!comments || comments.length === 0) return null;
  
    return (
      <div>
        {comments.map((comment, index) => (
          <div key={index} className="image-comment-container">
            <div className="comments">
              <p><strong>Position:</strong> {comment.comment1}</p>
              <p><strong>Tread Depth:</strong> {comment.comment2}/32</p>
            </div>
            <div className="image-stack">
              {comment.imageUrls && comment.imageUrls.length > 1 ? (
                <div
                  className="image-overlay"
                  onClick={() => handleImageClick(comment.imageUrls)}
                >
                  {comment.imageUrls.slice(0, 3).map((url, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={url}
                      alt={`Thumbnail ${imgIndex + 1}`}
                      className={`thumbnail-image ${
                        imgIndex === 0 ? 'top' : 'stacked'
                      }`}
                    />
                  ))}
                </div>
              ) : comment.imageUrls && comment.imageUrls.length === 1 ? (
                <img
                  src={comment.imageUrls[0]}
                  alt="Single Image"
                  className="single-image"
                  onClick={() => handleImageClick(comment.imageUrls)}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  };
  



  
  return (
    <div>
      <div className='current-user'>
        <p className='username'>Welcome, </p>
        {/* <button className='logout'>Log Out</button> */}
      </div>
      <h2 className='fleetList-title'>Fleets</h2>
      <h4  className='imagesteps'>Upload Images From Photo Library</h4>
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
                  })
                  .map((unit) => (
                    <li key={unit.id} className={`unit-item ${unit.done ? 'done' : ''} ${unit.priority}`}>
                      <strong>Unit Number:</strong>{unit.unitType} {unit.UnitNumber} <strong>Priority:</strong> {unit.priority}
                      <ul>
                        {unit.TaskSpecifics &&
                          unit.TaskSpecifics.length > 0 &&
                          unit.TaskSpecifics.map((info, index) => (
                            <li key={index}>
                              <strong>Position:</strong> {info.position}, <strong>Specifics:</strong> {info.specifics}, <strong>Tread Depth:</strong> {info.treadDepth}/32
                              <p className='tireNeeded'><strong>Tire Needed:</strong> {info.neededTire}</p>
                            </li>
                          ))}
        </ul>
        <div className="button-group">
          <button className='techButtons' onClick={() => handleDone(unit.id, !unit.done)}>
            Mark as {unit.done ? 'Not Done' : 'Done'}
          </button>
          <button className='techButtons' onClick={() => handleUploadClick(unit.id)}>Upload Image</button>
        </div>
        <UnitImages comments={unit.comments} />
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
              value={comment1}
              onChange={(e) => setComment1(e.target.value)}
              placeholder="Enter Position"
            />

<input
  type="number"
  value={comment2}
  onChange={(e) => setComment2(e.target.value)}
  placeholder="Tread Depth"
/>
            <button onClick={handleCommentSubmit}>Enter Position and Upload Images</button>
          </div>
        </>
      )}

{isImagePopupVisible && (
  <div className="image-popup" {...handlers}>
    {selectedImageUrl.length > 1 && (
      <>
        <button className="nav-button left" onClick={handlePrevImage}>
          &lt;
        </button>
        <button className="nav-button right" onClick={handleNextImage}>
          &gt;
        </button>
      </>
    )}
    <img
      src={selectedImageUrl[currentImageIndex]}
      alt="Popup"
      className="popup-image"
    />
    <button className="close-button" onClick={closeImagePopup}>
      X
    </button>
  </div>
)}
{isLoading && (
  <div className="loading-overlay">
    <Oval
      height={80}
      width={80}
      color="#3e649c"
      ariaLabel="loading"
    />
  </div>
)}
    </div>
  );
};

export default FleetList;
