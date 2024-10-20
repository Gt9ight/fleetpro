import React, { useState } from 'react';
import './fleetspecifics.css';
import PositionSelect from './PositionSelect';
import TruckPositionSelect from './TruckPositionSelect';

const FleetSpecifics = ({ onClose, onSave, unitType }) => {
  const [position, setPosition] = useState('');
  const [specifics, setSpecifics] = useState('');
  const [treadDepth, setTreadDepth] = useState('');
  const [neededTire, setNeededTire] = useState('');
  const [isPositionSelectOpen, setIsPositionSelectOpen] = useState(false);

  const handleSpecifics = (e) => {
    setSpecifics(e.target.value);
  };

  const handleTreadDepth = (e) => {
    setTreadDepth(e.target.value);
  };

  const handleNeededTire = (e) => {
    setNeededTire(e.target.value);
  };

  const handleSaveSpecifics = () => {
    onSave({ position, specifics, treadDepth, neededTire });
    setPosition(''); 
    setSpecifics('');
    setTreadDepth('');
    setNeededTire('');
  };

  const togglePositionSelect = () => {
    setIsPositionSelectOpen(!isPositionSelectOpen);
  };

  
  const formatSelectedPositions = (selectedPositions) => {
    let formattedPositions = [...selectedPositions];

    const allPositions = ['LFO', 'LFI', 'LRO', 'LRI', 'RFO', 'RFI', 'RRO', 'RRI'];
    const isAllSelected = allPositions.every(pos => selectedPositions.includes(pos));
  
    if (isAllSelected) {
      return 'All 8'; 
    }
  
    const frontAxlePositions = ['LFI', 'LFO', 'RFI', 'RFO'];
    const hasFrontAxle = frontAxlePositions.every(pos => selectedPositions.includes(pos));
  
    const rearAxlePositions = ['LRI', 'LRO', 'RRI', 'RRO'];
    const hasRearAxle = rearAxlePositions.every(pos => selectedPositions.includes(pos));
  
    if (hasFrontAxle) {
      formattedPositions = formattedPositions.filter(pos => !frontAxlePositions.includes(pos));
      formattedPositions.push('Front Axle');
    }
  
    if (hasRearAxle) {
      formattedPositions = formattedPositions.filter(pos => !rearAxlePositions.includes(pos));
      formattedPositions.push('Rear Axle');
    }
  
    if (!hasFrontAxle) {
      if (selectedPositions.includes('LFO') && selectedPositions.includes('LFI')) {
        formattedPositions = formattedPositions.filter(pos => pos !== 'LFO' && pos !== 'LFI');
        formattedPositions.push('LFI/O');
      }
  
      if (selectedPositions.includes('RFO') && selectedPositions.includes('RFI')) {
        formattedPositions = formattedPositions.filter(pos => pos !== 'RFO' && pos !== 'RFI');
        formattedPositions.push('RFI/O');
      }
    }
  
    if (!hasRearAxle) {
      if (selectedPositions.includes('RRO') && selectedPositions.includes('RRI')) {
        formattedPositions = formattedPositions.filter(pos => pos !== 'RRO' && pos !== 'RRI');
        formattedPositions.push('RRI/O');
      }
  
      if (selectedPositions.includes('LRO') && selectedPositions.includes('LRI')) {
        formattedPositions = formattedPositions.filter(pos => pos !== 'LRO' && pos !== 'LRI');
        formattedPositions.push('LRI/O');
      }
    }
  
    return formattedPositions.join(', ');
  };
  
  
  
  
  
  

  const handleSelectPositions = (selectedPositions) => {
    
    const formattedPositions = formatSelectedPositions(selectedPositions);
    setPosition(formattedPositions);
  };

  return (
    <div className='fleet-popup'>
      <button className='positionselction' onClick={togglePositionSelect}>
        Select Position(s)
      </button>
      {isPositionSelectOpen && (
  <div className="popup-overlay" onClick={togglePositionSelect}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      {unitType === 'TRK' ? (
        <TruckPositionSelect 
          onSelectPositions={handleSelectPositions}
          onClose={togglePositionSelect} 
        />
      ) : (
        <PositionSelect 
          onSelectPositions={handleSelectPositions}
          onClose={togglePositionSelect} 
        />        
      )}
    </div>
  </div>
)}

      <label><strong>Selected Positions:</strong></label>
      <div className='selected-positions'>
        {position ? position : 'No positions selected'}
      </div>

      <label><strong>Specifics</strong></label>
      <select value={specifics} onChange={handleSpecifics}>
        <option value="">Select Specifics</option>
        <option value="Replace">Replace</option>
        <option value="Flat Repair">Flat Repair</option>
      </select>

      <label><strong>Tread Depth:</strong></label>
      <input
        type="number"
        value={treadDepth}
        onChange={handleTreadDepth}
        placeholder="Tread Depth"
      />

      <label><strong>Tire needed:</strong></label>
      <select value={neededTire} onChange={handleNeededTire}>
        <option value="">Select Tire Needed</option>
        <option value="Lp22.5 General RA">Lp22.5 General RA</option>
        <option value="Lp22.5 General HT+">Lp22.5 General HT+</option>
        <option value="Lp22.5 General HD+">Lp22.5 General HD+</option>
        <option value="Lp22.5 Continental HS3">Lp22.5 Continental HS3</option>
      </select>

      <button onClick={handleSaveSpecifics}>Add Position</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default FleetSpecifics;