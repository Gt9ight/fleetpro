import React, {useState, useEffect} from 'react'
import FleetSpecifics from './FleetSpecifics';
import './fleetform.css'
import { createFleetDatabase, db, storage } from '../../utillis/Firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import { Oval } from 'react-loader-spinner';


function Fleetform() {
  const [newCustomer, setNewCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low')
  const [customerFleet, setCustomerFleet] = useState([]);
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
    if (inputValue.trim() !== '') {
      const newUnit = {
        UnitNumber: inputValue,
        customer: selectedCustomer,
        TaskSpecifics: [],
        priority,
        comments: [], // Initialize comments array
        imageUrls: [] // Initialize imageUrls array
      };
      setCustomerFleet([...customerFleet, newUnit].sort((a, b) => {
        const priorityOrder = { low: 3, medium: 2, high: 1 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }));
      setInputValue('');
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


  const handleCommentSubmit = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      compressAndUploadImages(currentUnitIndex, files, comment1, comment2);
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
        (comment) => comment.comment1 === comment1 && comment.comment2 === comment2
      );
  
      if (commentIndex !== -1) {
        existingComments[commentIndex].imageUrls = [
          ...(existingComments[commentIndex].imageUrls || []),
          ...newImageUrls,
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

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setImagePopupVisible(true);
  };

  const closeImagePopup = () => {
    setImagePopupVisible(false);
    setSelectedImageUrl('');
  };

  const UnitImages = ({ imageUrls, comments = [] }) => {
    // Create a mapping of comments to images
    const imagesByComments = comments.reduce((acc, comment, index) => {
      const commentText = `Position: ${comment.comment1}, Tread Depth: ${comment.comment2 || 'NA'}/32`;
      acc[commentText] = comment.imageUrls || [];
      return acc;
    }, {});
  
    return (
      <div className="unit-images">
        {Object.entries(imagesByComments).map(([comment, urls], index) => (
          <div key={index}>
            <p className="unit-comment">{comment}</p>
            {urls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Image ${idx + 1}`}
                className="unit-image"
                onClick={() => handleImageClick(url)}
              />
            ))}
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
        <input
        type='text'
        value={newCustomer}
        onChange={handleNewCustomerChange}
        placeholder='Enter Customer Name'
        />
        <button onClick={handleCreateNewCustomer}>Start</button>
      </div>


      <h2 className='customer'>Customer: {selectedCustomer}</h2>
      <div className='input-section'>
        <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        placeholder='unit number'
        className='unit-input'
        />
        <select onChange={(e) => setPriority(e.target.value)} value={priority}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddingUnitNumber} className='add-button'>Add</button>
      </div>


<ul className="unit-list">
  {customerFleet.map((unit, index) => {
    if (selectedCustomer === 'All' || unit.customer === selectedCustomer) {
      return (
        <li key={index} className={`unit-card priority-${unit.priority}`}>
          <strong>Unit Number:</strong>{unit.UnitNumber}
          <button
            onClick={() => {
              setCurrentUnitIndex(index);
              setShowPopup(true);
            }}
          >
            Add Specifics
          </button>
          <button onClick={() => handleUploadClick(index)} className='unit-button'>Upload Image</button>
          <ul>
            {unit.TaskSpecifics.map((details, subIndex) => (
              <li key={subIndex}>
                <strong>Position:</strong> {details.position}, <strong>Specifics:</strong> {details.specifics}, <strong>Tread Depth:</strong> {details.treadDepth}/32<br></br>
                <p className='tireNeeded'><strong>Tire Needed:</strong> {details.neededTire}</p>
              </li>
            ))}
          </ul>
          <UnitImages imageUrls={unit.imageUrls} comments={unit.comments} />
          <button onClick={() => handleDeleteUnitNumber(index)}>Delete</button>
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


      <h1>See how you're other fleets are doing!</h1>

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
          <li key={unit.id} className={`unit-card priority-${unit.priority} ${unit.done ? 'done' : ''}`}>                   
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

      
    </div>
  )
}

export default Fleetform