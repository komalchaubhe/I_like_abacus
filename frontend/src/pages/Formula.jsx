import { useTranslation } from 'react-i18next';

const Formula = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {t('app.formula')}
      </h1>
      <div className="space-y-4 text-gray-700">
        <p>This page will contain abacus formulas and calculation techniques.</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Basic Formulas</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Upper bead value = 5</li>
            <li>Lower bead value = 1</li>
            <li>Total value = (Upper beads × 5) + Lower beads</li>
            <li>Place value = 10^position (ones, tens, hundreds, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Formula;

