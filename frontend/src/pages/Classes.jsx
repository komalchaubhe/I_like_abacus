import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import syllabusData from '../data/classes-syllabus.json';

const Classes = () => {
  const { classNum } = useParams();
  const { t, i18n } = useTranslation();
  const [selectedClass, setSelectedClass] = useState(classNum ? parseInt(classNum) : null);

  useEffect(() => {
    if (classNum) {
      setSelectedClass(parseInt(classNum));
    }
  }, [classNum]);

  const getLocalizedText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj[i18n.language] || obj.en || '';
  };

  const classData = selectedClass
    ? syllabusData.classes.find((c) => c.class === selectedClass)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {t('app.classes')}
      </h1>

      {!selectedClass ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {syllabusData.classes.map((cls) => (
            <a
              key={cls.class}
              href={`/classes/${cls.class}`}
              className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {getLocalizedText(cls.title)}
              </h2>
            </a>
          ))}
        </div>
      ) : classData ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {getLocalizedText(classData.title)}
            </h2>
            <button
              onClick={() => setSelectedClass(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to All Classes
            </button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {t('classes.topics')}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {classData.topics.map((topic, index) => (
                <li key={index}>{getLocalizedText(topic)}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">Class not found.</p>
      )}
    </div>
  );
};

export default Classes;

