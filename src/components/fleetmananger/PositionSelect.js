import React, { useState } from 'react';
import './positionSelect.css'

function PositionSelect({ onClose, onSelectPositions }) {
  const [selectedPositions, setSelectedPositions] = useState([]);

  const handleClick = (position) => {
    if (!selectedPositions.includes(position)) {
      setSelectedPositions([...selectedPositions, position]);
    } else {
      setSelectedPositions(selectedPositions.filter(item => item !== position));
    }
  };

  const handleDoneClick = () => {
    // Pass selected positions to the parent component
    onSelectPositions(selectedPositions);
    setSelectedPositions([]);
    onClose(); // Close the popup
  };

  return (
    <div className='unitDiagram'>
      <h3 className='frontOfUnit'>Front of Trailer</h3>
      <div className='unit-container'>
        <div className='leftSideTires'>
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

export default PositionSelect;
