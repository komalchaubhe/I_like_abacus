import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { abacusState, expectedNumber } = body;

    if (!abacusState || expectedNumber === undefined) {
      return errorResponse('Abacus state and expected number are required', 400);
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

    const isCorrect = calculatedNumber === expectedNumber;

    return jsonResponse({
      isCorrect,
      calculatedNumber,
      expectedNumber,
      difference: Math.abs(calculatedNumber - expectedNumber)
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

