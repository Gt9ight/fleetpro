import React, { useState } from 'react';
import './fleetspecifics.css'


const FleetSpecifics = ({ onClose, onSave }) => {
    const [position, setPosition] = useState('');
    const [specifics, setSpecifics] = useState('');
    const [treadDepth, setTreadDepth] = useState('');
  
    const handlePosition = (e) => {
      setPosition(e.target.value);
    };
  
    const handleSpecifics = (e) => {
      setSpecifics(e.target.value);
    };
  
    const handleTreadDepth = (e) => {
      setTreadDepth(e.target.value);
    };
  
    const handleSaveSpecifics = () => {
      onSave({ position, specifics, treadDepth }); 
      setPosition('');
      setSpecifics('');
      setTreadDepth('');
    };
  
    return (
      <div className='fleet-popup'>
        <label>Position:</label>
        <input
          type="text"
          value={position}
          onChange={handlePosition}
          placeholder="Enter Position"
        />
  
        <label>Specifics</label>
        <input
          type="text"
          value={specifics}
          onChange={handleSpecifics}
          placeholder="Enter Specifics"
        />
  
        <label>Tread Depth:</label>
        <input
          type="number"
          value={treadDepth}
          onChange={handleTreadDepth}
          placeholder="Tread Depth"
        />
  
        <button onClick={handleSaveSpecifics}>Add Position</button>
        <button onClick={onClose}>Close</button>
        </div>
    );
  };
  
  export default FleetSpecifics;
  