import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';
import { validateAbacusState } from '../lib/validate.js';
import { parseRequestBody } from '../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Fix: Safe JSON parsing
    const body = parseRequestBody(req.body);
    const { abacusState, expectedNumber } = body;

    if (!abacusState || expectedNumber === undefined) {
      return errorResponse('Abacus state and expected number are required', 400);
    }

    // Fix: Validate abacus state structure
    const validation = validateAbacusState(abacusState);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    // Fix: Validate expectedNumber
    const expectedNum = Number(expectedNumber);
    if (!Number.isInteger(expectedNum) || expectedNum < 0) {
      return errorResponse('Expected number must be a non-negative integer', 400);
    }

    let calculatedNumber = 0;

    for (let i = 0; i < abacusState.length; i++) {
      const rod = abacusState[i];
      const placeValue = Math.pow(10, i);
      
      const upperBead = rod.upperBead || false;
      const lowerBeads = rod.lowerBeads || 0;
      const digitValue = (upperBead ? 5 : 0) + lowerBeads;
      
      calculatedNumber += digitValue * placeValue;
    }

    const isCorrect = calculatedNumber === expectedNum;

    return jsonResponse({
      isCorrect,
      calculatedNumber,
      expectedNumber: expectedNum,
      difference: Math.abs(calculatedNumber - expectedNum)
    });
  } catch (error) {
    // Fix: Proper error handling
    return errorResponse(error, 500);
  }
}

