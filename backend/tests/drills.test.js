import { describe, it, expect } from '@jest/globals';

// Abacus digit calculation logic
function calculateAbacusValue(abacusState) {
  let value = 0;
  for (let i = 0; i < abacusState.length; i++) {
    const row = abacusState[i];
    const placeValue = Math.pow(10, i);
    const upperBeads = row.upperBeads || 0;
    const lowerBeads = row.lowerBeads || 0;
    const digitValue = (upperBeads * 5) + lowerBeads;
    value += digitValue * placeValue;
  }
  return value;
}

describe('Abacus Logic Tests', () => {
  it('should calculate correct value for simple number', () => {
    const abacusState = [
      { upperBeads: 0, lowerBeads: 3 }, // ones: 3
      { upperBeads: 0, lowerBeads: 0 }  // tens: 0
    ];
    const value = calculateAbacusValue(abacusState);
    expect(value).toBe(3);
  });

  it('should calculate correct value with upper beads', () => {
    const abacusState = [
      { upperBeads: 1, lowerBeads: 2 }, // ones: 5 + 2 = 7
      { upperBeads: 0, lowerBeads: 1 }  // tens: 1
    ];
    const value = calculateAbacusValue(abacusState);
    expect(value).toBe(17);
  });

  it('should calculate correct value for larger number', () => {
    const abacusState = [
      { upperBeads: 0, lowerBeads: 4 }, // ones: 4
      { upperBeads: 1, lowerBeads: 1 }, // tens: 5 + 1 = 6
      { upperBeads: 0, lowerBeads: 2 }  // hundreds: 2
    ];
    const value = calculateAbacusValue(abacusState);
    expect(value).toBe(264);
  });
});

