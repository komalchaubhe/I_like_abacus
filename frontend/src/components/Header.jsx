import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLocale = (locale) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('locale', locale);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold">
              {t('app.title')}
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-blue-200 transition">
                {t('app.home')}
              </Link>
              <Link to="/formula" className="hover:text-blue-200 transition">
                {t('app.formula')}
              </Link>
              <div className="relative group">
                <Link to="/classes" className="hover:text-blue-200 transition">
                  {t('app.classes')} ▼
                </Link>
                <div className="absolute left-0 mt-2 w-32 bg-white text-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <Link
                      key={num}
                      to={`/classes/${num}`}
                      className="block px-4 py-2 hover:bg-blue-100"
                    >
                      {t('app.classes')} {num}
                    </Link>
                  ))}
                </div>
              </div>
              {user && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
                <Link to="/teacher" className="hover:text-blue-200 transition">
                  {t('app.teacher')}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => changeLocale('en')}
                className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLocale('hi')}
                className={`px-2 py-1 rounded ${i18n.language === 'hi' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-400'}`}
              >
                HI
              </button>
              <button
                onClick={() => changeLocale('mr')}
                className={`px-2 py-1 rounded ${i18n.language === 'mr' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-400'}`}
              >
                MR
              </button>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded transition"
                >
                  {t('app.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded transition"
              >
                {t('app.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

