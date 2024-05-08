import React, {useState} from 'react'

function Fleetform() {
  const [newCustomer, setNewCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low')
  const [customerFleet, setCustomerFleet] = useState([]);

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
        className='unitInput'
        />
        <select onChange={(e) => setPriority(e.target.value)} value={priority}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddingUnitNumber} className='add-button'>Add</button>
      </div>

      
    </div>
  )
}

export default Fleetform