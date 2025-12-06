import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Abacus = ({ 
  rods = 13, 
  initialDigits = null, 
  onValueChange = () => {},
  disabled = false 
}) => {
  const { t } = useTranslation();
  const [abacusState, setAbacusState] = useState(() => {
    const state = [];
    for (let i = 0; i < rods; i++) {
      state.push({ upperBead: false, lowerBeads: 0 });
    }
    return state;
  });
  const [focusedRod, setFocusedRod] = useState(null);
  const [focusedBead, setFocusedBead] = useState(null);
  const [hoveredRod, setHoveredRod] = useState(null);
  const [clickedBead, setClickedBead] = useState(null);
  const rodRefs = useRef([]);

  useEffect(() => {
    if (initialDigits) {
      const newState = [];
      for (let i = 0; i < rods; i++) {
        const digit = initialDigits[i] || 0;
        const upperBead = digit >= 5;
        const lowerBeads = digit % 5;
        newState.push({ upperBead, lowerBeads });
      }
      setAbacusState(newState);
    }
  }, [initialDigits, rods]);

  useEffect(() => {
    const currentValue = calculateValue();
    onValueChange(currentValue, abacusState);
  }, [abacusState]);

  const calculateValue = () => {
    let value = 0;
    for (let i = 0; i < abacusState.length; i++) {
      const rod = abacusState[i];
      const placeValue = Math.pow(10, i);
      const digitValue = (rod.upperBead ? 5 : 0) + rod.lowerBeads;
      value += digitValue * placeValue;
    }
    return value;
  };

  const toggleBead = (rodIndex, beadType, beadIndex = null) => {
    if (disabled) return;

    setAbacusState(prev => {
      const newState = [...prev];
      const rod = { ...newState[rodIndex] };
      
      if (beadType === 'upper') {
        rod.upperBead = !rod.upperBead;
      } else {
        // For lower beads, toggle the specific bead position
        if (beadIndex !== null) {
          // If clicking on a bead that's already up, move it down
          // If clicking on a bead that's down, move it up
          if (beadIndex < rod.lowerBeads) {
            // This bead is up, move it down (set to this position)
            rod.lowerBeads = beadIndex;
          } else {
            // This bead is down, move it up (set to position + 1)
            rod.lowerBeads = beadIndex + 1;
          }
        } else {
          // Fallback: cycle through lower beads
          if (rod.lowerBeads < 4) {
            rod.lowerBeads = rod.lowerBeads + 1;
          } else {
            rod.lowerBeads = 0;
          }
        }
      }
      
      newState[rodIndex] = rod;
      return newState;
    });
  };

  const handleKeyDown = (e, rodIndex, beadType, beadIndex = null) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleBead(rodIndex, beadType, beadIndex);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const newRodIndex = rodIndex + direction;
      if (newRodIndex >= 0 && newRodIndex < rods) {
        setFocusedRod(newRodIndex);
        setFocusedBead(beadType);
        rodRefs.current[newRodIndex]?.focus();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedBead(beadType === 'upper' ? 'lower' : 'upper');
    }
  };

  const reset = () => {
    if (disabled) return;
    const newState = [];
    for (let i = 0; i < rods; i++) {
      newState.push({ upperBead: false, lowerBeads: 0 });
    }
    setAbacusState(newState);
  };

  const getDigitValue = (rodIndex) => {
    const rod = abacusState[rodIndex];
    return (rod.upperBead ? 5 : 0) + rod.lowerBeads;
  };

  const getCurrentDigits = () => {
    return abacusState.map(rod => (rod.upperBead ? 5 : 0) + rod.lowerBeads);
  };

  // Expose methods via ref if needed
  useEffect(() => {
    if (typeof onValueChange === 'function') {
      const digits = getCurrentDigits();
      onValueChange(calculateValue(), abacusState, digits);
    }
  }, [abacusState]);

  // Marker positions (white dots on dividing beam) - 3rd, 7th, 11th rods from LEFT
  // When displayed right-to-left, these are at visual positions 3, 7, 11 from left
  // Rod indices from right: 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
  // Visual positions from left: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  // So markers at visual positions 2, 6, 10 (3rd, 7th, 11th) = rod indices 10, 6, 2
  const markerPositions = [10, 6, 2]; // Rod indices for markers when displayed right-to-left

  const handleBeadClick = (rodIndex, beadType, beadIndex = null) => {
    toggleBead(rodIndex, beadType, beadIndex);
    setClickedBead(`${rodIndex}-${beadType}-${beadIndex}`);
    setTimeout(() => setClickedBead(null), 300);
  };

  return (
    <div className="abacus-container w-full max-w-4xl mx-auto">
      {/* Top section with enhanced design - reduced size */}
      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-3 rounded-t-lg shadow-md border-b-2 border-blue-200">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            {t('abacus.currentValue')}
          </div>
          <div className="text-3xl font-bold text-blue-900 drop-shadow-sm">
            {calculateValue().toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {abacusState.map((rod, idx) => {
              const val = (rod.upperBead ? 5 : 0) + rod.lowerBeads;
              return val > 0 ? `${val}×10^${idx}` : null;
            }).filter(Boolean).reverse().join(' + ') || '0'}
          </div>
        </div>
      </div>

      {/* Rod values displayed outside scale - above the frame with labels */}
      <div className="flex justify-center gap-1 mb-3 px-2 bg-gradient-to-b from-white to-blue-50 py-2 rounded-lg border border-blue-200 shadow-sm">
        {abacusState.slice().reverse().map((rod, displayIndex) => {
          const rodIndex = rods - 1 - displayIndex;
          const digitValue = getDigitValue(rodIndex);
          const placeValue = Math.pow(10, rodIndex);
          return (
            <div key={rodIndex} className="text-center" style={{ width: 'calc(100% / 13)' }}>
              <div className={`text-lg font-bold transition-all duration-200 ${
                digitValue > 0 ? 'text-blue-800 scale-110' : 'text-gray-400'
              }`}>
                {digitValue}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {rodIndex === 0 ? '1' : rodIndex === 1 ? '10' : rodIndex === 2 ? '100' : 
                 placeValue <= 1000000 ? placeValue.toLocaleString() : `10^${rodIndex}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Abacus Frame with enhanced attractive styling */}
      <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 border-4 border-amber-900 relative shadow-2xl rounded-lg overflow-hidden" 
           style={{ padding: '15px 12px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 25%, #FCD34D 50%, #FDE68A 75%, #FEF3C7 100%)' }}>
        {/* Top horizontal beam with enhanced depth and shine */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-xl" 
             style={{ borderRadius: '4px 4px 0 0', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}></div>

        {/* Dividing beam (thicker, in the middle) - ANSWER LINE - highly visible red */}
        <div className="absolute top-1/2 left-0 right-0 h-4 bg-gradient-to-b from-red-600 via-red-800 to-red-600 transform -translate-y-1/2 shadow-2xl z-10" 
             style={{ 
               marginTop: '-8px', 
               borderRadius: '4px', 
               border: '3px solid #DC2626',
               boxShadow: '0 0 12px rgba(220, 38, 38, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
             }}>
          {/* White dots on dividing beam - positioned at 3rd, 7th, 11th from left */}
          {[2, 6, 10].map((visualPos) => (
            <div
              key={visualPos}
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-400 z-20"
              style={{
                left: `calc(${((visualPos + 0.5) / rods) * 100}% - 8px)`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            ></div>
          ))}
        </div>

        {/* Bottom horizontal beam with enhanced depth and shine */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-xl" 
             style={{ borderRadius: '0 0 4px 4px', boxShadow: '0 -2px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)' }}></div>

        {/* Rods and Beads - Display from right to left (ones on right) - reduced size */}
        <div className="flex justify-center gap-1 relative" style={{ minHeight: '200px' }}>
          {abacusState.slice().reverse().map((rod, displayIndex) => {
            // Calculate actual rod index (from right: 0=ones, 1=tens, etc.)
            const rodIndex = rods - 1 - displayIndex;
            const placeValue = Math.pow(10, rodIndex);
            const isMarkerRod = markerPositions.includes(rodIndex);
            const isHovered = hoveredRod === rodIndex;
            const digitValue = getDigitValue(rodIndex);
            
            return (
              <div
                key={rodIndex}
                className="flex flex-col items-center relative group"
                style={{ width: 'calc(100% / 13)' }}
                tabIndex={0}
                ref={el => rodRefs.current[rodIndex] = el}
                onFocus={() => {
                  setFocusedRod(rodIndex);
                  setFocusedBead('upper');
                }}
                onMouseEnter={() => setHoveredRod(rodIndex)}
                onMouseLeave={() => setHoveredRod(null)}
              >
                {/* Vertical rod line with enhanced attractive styling */}
                <div className={`absolute top-0 bottom-0 w-1.5 transition-all duration-200 ${
                  isHovered ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-500 shadow-xl' : 'bg-gradient-to-b from-gray-600 via-gray-800 to-gray-600'
                }`} style={{ 
                  boxShadow: isHovered 
                    ? '0 0 16px rgba(180, 83, 9, 0.8), inset 0 0 4px rgba(255,255,255,0.2)' 
                    : 'inset 0 0 8px rgba(0,0,0,0.5), 0 0 3px rgba(0,0,0,0.3), inset 0 0 2px rgba(255,255,255,0.1)'
                }}></div>
                
                {/* Rod highlight on hover */}
                {isHovered && (
                  <div className="absolute top-0 bottom-0 w-full bg-amber-100 opacity-20 rounded transition-opacity duration-200"></div>
                )}

                {/* Upper deck - 1 bead (value 5) - CORRECT: false=top (inactive, 0), true=dividing beam (active, 5) */}
                <div className="relative mb-1" style={{ height: '100px', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleBeadClick(rodIndex, 'upper')}
                    onKeyDown={(e) => handleKeyDown(e, rodIndex, 'upper')}
                    className={`absolute transition-all duration-300 ease-in-out transform ${
                      focusedRod === rodIndex && focusedBead === 'upper'
                        ? 'ring-3 ring-blue-400 ring-offset-1 scale-110'
                        : clickedBead === `${rodIndex}-upper-null`
                        ? 'scale-95'
                        : 'hover:scale-105'
                    } ${isHovered ? 'shadow-xl' : ''}`}
                    style={{
                      width: '28px',
                      height: '22px',
                      borderRadius: '5px',
                      background: rod.upperBead 
                        ? 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #8B4513 100%)'
                        : 'linear-gradient(135deg, #D2B48C 0%, #C4A373 50%, #D2B48C 100%)',
                      border: rod.upperBead 
                        ? '2px solid #5C3A21' 
                        : '2px solid #A0826D',
                      boxShadow: rod.upperBead 
                        ? '0 3px 6px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.2)' 
                        : '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                      // CORRECT LOGIC: false = at top touching top beam (inactive, value 0), true = at dividing beam (active, value 5)
                      // Upper deck is 100px high, dividing beam is at bottom of upper deck (100px from top)
                      // Position: inactive at top (2px from top), active at dividing beam (78px from top = 2px above 100px dividing beam)
                      top: rod.upperBead ? '78px' : '2px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.6 : 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    disabled={disabled}
                    aria-label={`${placeValue.toLocaleString()} place, upper bead, value 5`}
                    onMouseEnter={(e) => {
                      if (!disabled) e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled && clickedBead !== `${rodIndex}-upper-null`) {
                        e.currentTarget.style.transform = '';
                      }
                    }}
                  />
                </div>

                {/* Lower deck - 4 beads (value 1 each) - CORRECT: bottom=inactive (0), dividing beam=active (1) */}
                <div className="relative mt-1" style={{ height: '100px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {[0, 1, 2, 3].map((beadIndex) => {
                    const isActive = beadIndex < rod.lowerBeads;
                    const beadKey = `${rodIndex}-lower-${beadIndex}`;
                    // CORRECT LOGIC: Active beads at dividing beam (value 1), inactive at bottom (value 0)
                    // Lower deck is 100px high, dividing beam is at top of lower deck
                    // Active beads: positioned near dividing beam (2px below dividing beam = 78px from bottom)
                    // Inactive beads: positioned at bottom, stacked upward from 0px
                    let bottomPosition;
                    if (isActive) {
                      // Active: position from dividing beam downward
                      // First active bead (beadIndex 0) closest to dividing beam at 78px
                      // Second active bead (beadIndex 1) at 58px, etc.
                      // activePosition: 0 = closest to beam (beadIndex 0), 1 = next (beadIndex 1), etc.
                      const activePosition = beadIndex; // beadIndex itself is the position (0, 1, 2, 3)
                      bottomPosition = `${78 - (activePosition * 20)}px`; // 78px for position 0, 58px for position 1, etc.
                    } else {
                      // Inactive: position at bottom, stacked upward
                      // Count how many inactive beads are below this one
                      const inactivePosition = beadIndex - rod.lowerBeads; // Position relative to inactive group
                      bottomPosition = `${inactivePosition * 20}px`; // Stack at bottom starting from 0px
                    }
                    return (
                      <button
                        key={beadIndex}
                        type="button"
                        onClick={() => handleBeadClick(rodIndex, 'lower', beadIndex)}
                        onKeyDown={(e) => handleKeyDown(e, rodIndex, 'lower', beadIndex)}
                        className={`absolute transition-all duration-300 ease-in-out transform ${
                          focusedRod === rodIndex && focusedBead === 'lower'
                            ? 'ring-3 ring-green-400 ring-offset-1'
                            : clickedBead === beadKey
                            ? 'scale-95'
                            : 'hover:scale-105'
                        } ${isHovered ? 'shadow-lg' : ''}`}
                        style={{
                          width: '24px',
                          height: '18px',
                          borderRadius: '4px',
                          background: isActive
                            ? 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #8B4513 100%)'
                            : 'linear-gradient(135deg, #D2B48C 0%, #C4A373 50%, #D2B48C 100%)',
                          border: isActive
                            ? '2px solid #5C3A21'
                            : '2px solid #A0826D',
                          boxShadow: isActive
                            ? '0 3px 6px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.2)'
                            : '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                          bottom: bottomPosition,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.6 : 1,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        disabled={disabled}
                        aria-label={`${placeValue.toLocaleString()} place, lower bead ${beadIndex + 1}, value 1`}
                        onMouseEnter={(e) => {
                          if (!disabled) e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          if (!disabled && clickedBead !== beadKey) {
                            e.currentTarget.style.transform = '';
                          }
                        }}
                      />
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Instructions - reduced */}
      <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 py-3 px-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🖱️</span>
            <span>Click beads to move</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">⌨️</span>
            <span>Arrow keys + Enter/Space</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">👆</span>
            <span>Hover to highlight rods</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Abacus;

