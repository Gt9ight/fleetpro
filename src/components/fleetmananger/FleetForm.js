import React, {useState} from 'react'
import FleetSpecifics from './FleetSpecifics';
import './fleetform.css'


function Fleetform() {
  const [newCustomer, setNewCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low')
  const [customerFleet, setCustomerFleet] = useState([]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

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
      const newUnit = { UnitNumber: inputValue, customer: selectedCustomer, TaskSpecifics: [], priority };
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


  const handleAddUnitInfo = ({ position, specifics, treadDepth }) => {
    if (position.trim() !== '' || specifics.trim() !== '' || treadDepth.trim() !== '') {
      const updatedUnitInfo = [...customerFleet];
      const details = {
        position: position.trim(),
        specifics: specifics.trim(), 
        treadDepth: treadDepth.trim(),
      };
      updatedUnitInfo[currentUnitIndex].TaskSpecifics.push(details);
      setCustomerFleet(updatedUnitInfo);
    }
    setShowPopup(false);
  };




  return (
    <div>
      <div className='current user'>
        <p className='username'>Welcome,</p>
        <button>Log out</button>
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
               <ul>
               
                 {unit.TaskSpecifics.map((details, subIndex) => (
                   <li key={subIndex}>
                     <strong>Position:</strong> {details.position}, <strong>Specifics:</strong> {details.specifics}, <strong>Tread Depth:</strong> {details.treadDepth}/32
                   </li>
                 ))}
               </ul>
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
      <button className='submission-button'>submit</button>

      
    </div>
  )
}

export default Fleetform