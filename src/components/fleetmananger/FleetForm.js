import React, {useState, useEffect} from 'react'
import FleetSpecifics from './FleetSpecifics';
import './fleetform.css'
import { createFleetDatabase, db, storage } from '../../utillis/Firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import { useSwipeable } from 'react-swipeable';
import { Oval } from 'react-loader-spinner';



function Fleetform() {
  const [newCustomer, setNewCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('')
  const [customerFleet, setCustomerFleet] = useState([]);
  const [unitType, setUnitType] = useState('');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showCustomerCategory, setShowCustomerForCategory] = useState(null);
  const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);
  const [comment1, setComment1] = useState('');
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [isImagePopupVisible, setImagePopupVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comment2, setComment2] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showError, setShowError] = useState(false); 
  const [showUnitInputs, setShowUnitInputs] = useState(false);

  const generateCustomerName = () => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
 // Format as YYYY-MM-DD
    return `${formattedDate} Freedom`;
  };

  const handleStart = () => {
    const customerName = generateCustomerName();
    setSelectedCustomer(customerName);

    // Optionally, you can add this customer to a customer list or save it somewhere
    const newCustomer = {
      name: customerName,
      fleet: [],
    };

    // Add to the fleet or customer list
    setCustomerFleet([...customerFleet, newCustomer]);
    setShowUnitInputs(true);
  };
  

  const handleNewCustomerChange = (e) => {
    setNewCustomer(e.target.value);
  };

  const handleCreateNewCustomer = () => {
    if (newCustomer.trim() !== '') {
      setSelectedCustomer(newCustomer); 
      setCustomers([...customers, newCustomer]);
      setNewCustomer('');
    }

  };  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  const handleAddingUnitNumber = () => {
    if (inputValue.trim() !== '' && unitType) {
      const newUnit = {
        UnitNumber: inputValue,
        customer: selectedCustomer,
        TaskSpecifics: [],
        unitType,
        priority,
        comments: [], 
        imageUrls: [] 
      };
      setCustomerFleet([...customerFleet, newUnit].sort((a, b) => {
        const priorityOrder = { low: 3, medium: 2, high: 1 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }));
      setInputValue('');
      setUnitType('');
      setPriority('')
      setShowError(false);
    } else {
      setShowError(true);
      
    }
  };

  const handleDeleteUnitNumber = (index) => {
    const updatedUnitInfo = customerFleet.filter((_, i) => i !== index);
    setCustomerFleet(updatedUnitInfo);
  };


  const handleAddUnitInfo = ({ position, specifics, treadDepth, neededTire }) => {
    if (position.trim() !== '' || specifics.trim() !== '' || treadDepth.trim() !== '' || neededTire.trim() !== '') {
      const updatedUnitInfo = [...customerFleet];
      const details = {
        position: position.trim(),
        specifics: specifics.trim(), 
        treadDepth: treadDepth.trim(),
        neededTire: neededTire.trim(),
      };
      updatedUnitInfo[currentUnitIndex].TaskSpecifics.push(details);
      setCustomerFleet(updatedUnitInfo);
    }
    setShowPopup(false);
  };


  const submitFleet = () => {
    if (customerFleet.length > 0) {
      createFleetDatabase('fleets', customerFleet);
       setCustomerFleet([]);
       setSelectedCustomer('')
    }
  };

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

  const handleUploadClick = (unitIndex) => {
    setCurrentUnitIndex(unitIndex);
    setCommentInputVisible(true);
  };


  let isSubmitting = false; // Add a flag to track submissions

  const handleCommentSubmit = () => {
    if (isSubmitting) return; // Prevent double submission
    isSubmitting = true; // Set flag to true when submit is clicked
  
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;

    
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
  
      // Check for duplicate filenames before upload
      const isDuplicate = files.some(file => customerFleet[currentUnitIndex]?.imageUrls?.includes(file.name));
      if (isDuplicate) {
        console.warn('Duplicate image detected, skipping upload.');
        isSubmitting = false; // Reset submission flag
        return;
      }
  
      compressAndUploadImages(currentUnitIndex, files, comment1, comment2);
  
      // Clear file input after submission to prevent resubmission
      fileInput.value = null;
  
      setTimeout(() => {
        isSubmitting = false; // Reset flag after upload completes
      }, 1000); // Add a delay to ensure multiple submissions can't happen too fast
    };
  
    fileInput.click();
    setCommentInputVisible(false);
  };
  
  

  const compressAndUploadImages = async (unitIndex, files, comment1, comment2) => {
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
  
      await uploadImages(unitIndex, compressedFiles, comment1, comment2); // Pass both comments
    } catch (error) {
      console.error('Error compressing images:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  

  const uploadImages = async (unitIndex, files, comment1, comment2) => {
    try {
      const existingUnit = customerFleet[unitIndex];
      const existingImageUrls = existingUnit?.imageUrls || [];
      const existingComments = existingUnit?.comments || [];
  
      const newImageUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `${existingUnit.UnitNumber}/${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
  
      const commentIndex = existingComments.findIndex(
        (comment) => comment.comment1.trim() === comment1.trim() && comment.comment2.trim() === comment2.trim()
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
      const updatedCustomerFleet = [...customerFleet];
      updatedCustomerFleet[unitIndex] = updatedUnit;
      setCustomerFleet(updatedCustomerFleet);
  
      const fleetRef = doc(db, 'fleets', existingUnit.id);
      await updateDoc(fleetRef, {
        comments: existingComments,
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
;

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
      <div className='current user'>
        <p className='username'>Welcome,</p>
        {/* <button>Log out</button> */}
      </div>
      <h1 className='title'>FleetPro</h1>

      <div className='customer-creation'>
      {!showUnitInputs && (
        <button onClick={handleStart} className='start-button'>Start</button>
      )}
      </div>


      <h2 className='customer'>Customer: {selectedCustomer}</h2>
      
      {showUnitInputs && (
        <div className='input-section'>
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            className={`unit-select ${showError && !unitType ? 'error' : ''}`}
          >
            <option value="" disabled>Choose Unit Type</option>
            <option value="TRK">Truck</option>
            <option value="TRL">Trailer</option>
          </select>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='unit number'
            className={`unit-input ${showError && inputValue.trim() === '' ? 'error' : ''}`}
          />
          <select
            onChange={(e) => setPriority(e.target.value)}
            value={priority}
            className={`unit-select ${showError && !priority ? 'error' : ''}`}
          >
            <option value="" disabled>Choose Urgency</option>
            <option value="low">Dropped Unit</option>
            <option value="medium">Leaving soon</option>
            <option value="high">Driver Waiting</option>
          </select>
          <button onClick={handleAddingUnitNumber} className='add-button'>
            Add
          </button>
        </div>
      )}


<ul className="unit-list">
  {customerFleet.map((unit, index) => {
    if (selectedCustomer === 'All' || unit.customer === selectedCustomer) {
      return (
        <li key={index} className={`unit-card priority-${unit.priority}`}>
          <strong>Unit Number:</strong>{unit.unitType} {unit.UnitNumber}
          <div className='fleet-button'>
          <button className='unit-button'
            onClick={() => {
              setCurrentUnitIndex(index);
              setShowPopup(true);
            }}
          >
            Add Specifics
          </button>
          <button onClick={() => handleUploadClick(index)} className='unit-button'>Upload Image</button>
          </div>
          <ul>
            {unit.TaskSpecifics.map((details, subIndex) => (
              <li key={subIndex}>
                <strong>Position:</strong> {details.position}, <strong>Specifics:</strong> {details.specifics}, <strong>Tread Depth:</strong> {details.treadDepth}/32<br></br>
                <p className='tireNeeded'><strong>Tire Needed:</strong> {details.neededTire}</p>
              </li>
            ))}
          </ul>
          <UnitImages imageUrls={unit.imageUrls} comments={unit.comments} />
          <button className='delete-button' onClick={() => handleDeleteUnitNumber(index)}>Delete</button>
        </li>
      );
    }
    return null;
  })}
</ul>


     {showPopup && (
        <>
          <div className="overlay" onClick={() => setShowPopup(false)} />
          <div className="specifics-popup">
            <FleetSpecifics onClose={() => setShowPopup(false)} onSave={handleAddUnitInfo} />
          </div>
        </>
      )}
      <button className='submission-button' onClick={submitFleet}>submit</button>
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
          height="80" 
          width="80" 
          color="#4fa94d" 
          ariaLabel="oval-loading" 
          secondaryColor="#4fa94d" 
          strokeWidth={2} 
          strokeWidthSecondary={2} 
          />
        </div>
      )}


<div className="category-cards">

    <h1>See how you're fleets are doing!</h1>
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
          <li key={unit.id} className={`unit-card priority-${unit.priority} ${unit.done ? 'done' : ''}`}>                   
            <strong>Unit Number:</strong> {unit.unitType} {unit.UnitNumber} <strong>Priority:</strong>{unit.priority}
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

      
    </div>
  )
}

export default Fleetform