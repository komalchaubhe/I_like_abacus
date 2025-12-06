import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Abacus from '../components/Abacus';
import axios from 'axios';

const Home = () => {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [expectedNumber, setExpectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [abacusValue, setAbacusValue] = useState(0);
  const [abacusState, setAbacusState] = useState(null);

  const generateRandomProblem = async () => {
    try {
      const response = await axios.post('/api/drills/generate', {
        class: selectedClass,
        level: selectedLevel
      });
      setExpectedNumber(response.data.number);
      setShowFeedback(null);
    } catch (error) {
      console.error('Error generating problem:', error);
    }
  };

  const checkAnswer = async () => {
    if (expectedNumber === null) return;

    try {
      const response = await axios.post('/api/drills/check', {
        abacusState,
        expectedNumber
      });
      
      setShowFeedback({
        isCorrect: response.data.isCorrect,
        calculated: response.data.calculatedNumber,
        expected: response.data.expectedNumber
      });
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  const resetAbacus = () => {
    setExpectedNumber(null);
    setShowFeedback(null);
  };

  const handleAbacusChange = (value, state) => {
    setAbacusValue(value);
    setAbacusState(state);
  };

  return (
    <div className="space-y-8">
      {/* Abacus Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {t('abacus.title')}
        </h1>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center space-x-2">
              <label className="font-semibold">{t('abacus.class')}:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-semibold">{t('abacus.level')}:</label>
              <input
                type="range"
                min="1"
                max="5"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-32"
              />
              <span className="font-semibold">{selectedLevel}</span>
            </div>

            <button
              onClick={resetAbacus}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              {t('abacus.reset')}
            </button>

            <button
              onClick={generateRandomProblem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {t('abacus.randomProblem')}
            </button>

            {expectedNumber !== null && (
              <button
                onClick={checkAnswer}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                {t('abacus.checkAnswer')}
              </button>
            )}
          </div>

          {/* Problem Display */}
          {expectedNumber !== null && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-xl font-semibold text-gray-800">
                {t('abacus.expectedValue')}: {expectedNumber.toLocaleString()}
              </p>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`text-center p-4 rounded-lg ${
                showFeedback.isCorrect
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <p className="text-xl font-bold">
                {showFeedback.isCorrect ? t('abacus.correct') : t('abacus.wrong')}
              </p>
              {!showFeedback.isCorrect && (
                <p className="text-sm mt-2">
                  {t('abacus.currentValue')}: {showFeedback.calculated.toLocaleString()} |{' '}
                  {t('abacus.expectedValue')}: {showFeedback.expected.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Abacus Component */}
          <Abacus
            rods={13}
            onValueChange={handleAbacusChange}
            disabled={false}
          />
        </div>
      </section>

      {/* Information Section */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('info.whatIsAbacus.title')}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {t('info.whatIsAbacus.content')}
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-6">
          {t('info.benefits.title')}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {t('info.benefits.content')}
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-6">
          {t('info.howToRead.title')}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {t('info.howToRead.content')}
        </p>
      </section>
    </div>
  );
};

export default Home;

