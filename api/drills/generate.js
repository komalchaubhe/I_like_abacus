import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';

const CLASS_PRESETS = {
  1: { min: 1, max: 50, digits: 2 },
  2: { min: 10, max: 100, digits: 2 },
  3: { min: 50, max: 500, digits: 3 },
  4: { min: 100, max: 1000, digits: 3 },
  5: { min: 500, max: 5000, digits: 4 },
  6: { min: 1000, max: 10000, digits: 4 },
  7: { min: 5000, max: 50000, digits: 5 },
  8: { min: 10000, max: 100000, digits: 5 }
};

const LEVEL_MULTIPLIERS = {
  1: 0.5,
  2: 0.75,
  3: 1.0,
  4: 1.25,
  5: 1.5
};

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { class: classNum = 1, level = 1 } = body;

    const preset = CLASS_PRESETS[classNum] || CLASS_PRESETS[1];
    const multiplier = LEVEL_MULTIPLIERS[level] || 1.0;

    const adjustedMin = Math.floor(preset.min * multiplier);
    const adjustedMax = Math.floor(preset.max * multiplier);

    const number = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin;

    return jsonResponse({
      number,
      class: classNum,
      level,
      digits: preset.digits
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

