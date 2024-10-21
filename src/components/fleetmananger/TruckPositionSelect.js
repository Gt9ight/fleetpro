import React, { useState } from 'react';


function TruckPositionSelect({ onClose, onSelectPositions }) {
    const [selectedPositions, setSelectedPositions] = useState([]);
  
    const handleClick = (position) => {
      if (!selectedPositions.includes(position)) {
        setSelectedPositions([...selectedPositions, position]);
      } else {
        setSelectedPositions(selectedPositions.filter(item => item !== position));
      }
    };
  
    const handleDoneClick = () => {

      onSelectPositions(selectedPositions);
      setSelectedPositions([]);
      onClose(); 
    };
  
    return (
      <div className='unitDiagram'>
        <h3 className='frontOfUnit'>Front of Truck</h3>
        <div className='unit-container'>        
          <div className='leftSideTires'>
            <div className='leftSteer'>
              <div className={`specificPosition ${selectedPositions.includes('LF') ? 'selected' : ''}`} onClick={() => handleClick('LF')}>LF</div>
            </div>
            <div className='leftFrontTandem'>
              <div className={`specificPosition ${selectedPositions.includes('LFO') ? 'selected' : ''}`} onClick={() => handleClick('LFO')}>LFO</div>
              <div className={`specificPosition ${selectedPositions.includes('LFI') ? 'selected' : ''}`} onClick={() => handleClick('LFI')}>LFI</div>
            </div>
            <div className='leftRearTandem'>
              <div className={`specificPosition ${selectedPositions.includes('LRO') ? 'selected' : ''}`} onClick={() => handleClick('LRO')}>LRO</div>
              <div className={`specificPosition ${selectedPositions.includes('LRI') ? 'selected' : ''}`} onClick={() => handleClick('LRI')}>LRI</div>
            </div>
          </div>
          <div className='rightSideTires'>
          <div className='rightSteer'>
              <div className={`specificPosition ${selectedPositions.includes('RF') ? 'selected' : ''}`} onClick={() => handleClick('RF')}>RF</div>
            </div>
            <div className='rightFrontTandem'>
              <div className={`specificPosition ${selectedPositions.includes('RFI') ? 'selected' : ''}`} onClick={() => handleClick('RFI')}>RFI</div>
              <div className={`specificPosition ${selectedPositions.includes('RFO') ? 'selected' : ''}`} onClick={() => handleClick('RFO')}>RFO</div>
            </div>
            <div className='rightRearTandem'>
              <div className={`specificPosition ${selectedPositions.includes('RRI') ? 'selected' : ''}`} onClick={() => handleClick('RRI')}>RRI</div>
              <div className={`specificPosition ${selectedPositions.includes('RRO') ? 'selected' : ''}`} onClick={() => handleClick('RRO')}>RRO</div>
            </div>
          </div>
        </div>
        <div class="button-container">
          <button className='doneButton' onClick={handleDoneClick}>Done</button>
        </div>
      </div>
    );
  }
  

export default TruckPositionSelect