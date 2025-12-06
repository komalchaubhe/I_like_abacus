import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TeacherDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState({});

  // Form state
  const [chapterForm, setChapterForm] = useState({
    title: { en: '', hi: '', mr: '' },
    summary: { en: '', hi: '', mr: '' },
    level: 1,
    seq: 1,
    isPublished: false
  });
  const [solutionContent, setSolutionContent] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (!isTeacher) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [isTeacher]);

  useEffect(() => {
    if (selectedCourse) {
      fetchChapters(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedChapter) {
      fetchSolutions(selectedChapter.id);
    }
  }, [selectedChapter]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
      if (response.data.length > 0 && !selectedCourse) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchChapters = async (courseId) => {
    try {
      const response = await axios.get(`/api/chapters/course/${courseId}`);
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchSolutions = async (chapterId) => {
    try {
      const response = await axios.get(`/api/solutions/chapter/${chapterId}`);
      if (response.data.length > 0) {
        const latest = response.data[0];
        setSolutionContent(latest.content);
        setAttachments(latest.attachments || []);
        setSolutions(prev => ({ ...prev, [chapterId]: latest }));
      } else {
        setSolutionContent('');
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const newCourse = {
        title: { en: 'New Course', hi: 'नया पाठ्यक्रम', mr: 'नवीन अभ्यासक्रम' },
        description: { en: 'Course description', hi: 'पाठ्यक्रम विवरण', mr: 'अभ्यासक्रम वर्णन' }
      };
      const response = await axios.post('/api/courses', newCourse);
      setCourses([...courses, response.data]);
      setSelectedCourse(response.data);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleSaveChapter = async () => {
    setLoading(true);
    try {
      if (editingChapter) {
        await axios.put(`/api/chapters/${editingChapter.id}`, {
          ...chapterForm,
          isPublished: chapterForm.isPublished
        });
      } else {
        await axios.post(`/api/chapters/course/${selectedCourse.id}`, chapterForm);
      }
      await fetchChapters(selectedCourse.id);
      setEditingChapter(null);
      resetForm();
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Error saving chapter: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSolution = async () => {
    if (!selectedChapter) return;
    setLoading(true);
    try {
      await axios.post(`/api/solutions/chapter/${selectedChapter.id}`, {
        content: solutionContent,
        contentFormat: 'html',
        attachments
      });
      await fetchSolutions(selectedChapter.id);
      alert('Solution saved successfully!');
    } catch (error) {
      console.error('Error saving solution:', error);
      alert('Error saving solution: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Get signed URL
      const signResponse = await axios.post('/api/uploads/sign', {
        filename: file.name,
        fileType: file.type
      });

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await axios.post('/api/uploads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newAttachment = {
        url: uploadResponse.data.url,
        filename: uploadResponse.data.filename,
        originalName: uploadResponse.data.originalName,
        type: uploadResponse.data.type
      };

      setAttachments([...attachments, newAttachment]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setChapterForm({
      title: { en: '', hi: '', mr: '' },
      summary: { en: '', hi: '', mr: '' },
      level: 1,
      seq: chapters.length + 1,
      isPublished: false
    });
  };

  const startEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      title: chapter.title,
      summary: chapter.summary,
      level: chapter.level,
      seq: chapter.seq,
      isPublished: chapter.isPublished
    });
    setSelectedChapter(chapter);
  };

  const startNewChapter = () => {
    setEditingChapter(null);
    resetForm();
    setSelectedChapter(null);
    setSolutionContent('');
    setAttachments([]);
  };

  const getLocalizedText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj[i18n.language] || obj.en || '';
  };

  if (!isTeacher) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {t('teacher.dashboard')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Courses & Chapters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('teacher.courses')}</h2>
              <button
                onClick={handleCreateCourse}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + New
              </button>
            </div>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find(c => c.id === e.target.value);
                setSelectedCourse(course);
                startNewChapter();
              }}
              className="w-full border rounded px-3 py-2"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {getLocalizedText(course.title)}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('teacher.chapters')}</h2>
              {selectedCourse && (
                <button
                  onClick={startNewChapter}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  + {t('teacher.createChapter')}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  onClick={() => {
                    setSelectedChapter(chapter);
                    setEditingChapter(null);
                  }}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedChapter?.id === chapter.id
                      ? 'bg-blue-200'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{getLocalizedText(chapter.title)}</p>
                      <p className="text-sm text-gray-600">
                        {t('teacher.level')}: {chapter.level} | Seq: {chapter.seq}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditChapter(chapter);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Chapter Editor */}
        <div className="lg:col-span-2 space-y-6">
          {editingChapter || !selectedChapter ? (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                {editingChapter ? t('teacher.editChapter') : t('teacher.createChapter')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">{t('teacher.title')} (EN)</label>
                  <input
                    type="text"
                    value={chapterForm.title.en}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        title: { ...chapterForm.title, en: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('teacher.title')} (HI)</label>
                  <input
                    type="text"
                    value={chapterForm.title.hi}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        title: { ...chapterForm.title, hi: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('teacher.title')} (MR)</label>
                  <input
                    type="text"
                    value={chapterForm.title.mr}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        title: { ...chapterForm.title, mr: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('teacher.summary')} (EN)</label>
                  <textarea
                    value={chapterForm.summary.en}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        summary: { ...chapterForm.summary, en: e.target.value }
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">{t('teacher.level')}</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={chapterForm.level}
                      onChange={(e) =>
                        setChapterForm({ ...chapterForm, level: parseInt(e.target.value) })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('teacher.sequence')}</label>
                    <input
                      type="number"
                      min="1"
                      value={chapterForm.seq}
                      onChange={(e) =>
                        setChapterForm({ ...chapterForm, seq: parseInt(e.target.value) })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={chapterForm.isPublished}
                    onChange={(e) =>
                      setChapterForm({ ...chapterForm, isPublished: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label>{t('teacher.published')}</label>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveChapter}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('teacher.save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingChapter(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    {t('teacher.cancel')}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Solution Editor */}
          {selectedChapter && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                {t('teacher.solution')} - {getLocalizedText(selectedChapter.title)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">{t('teacher.solution')}</label>
                  <ReactQuill
                    theme="snow"
                    value={solutionContent}
                    onChange={setSolutionContent}
                    style={{ minHeight: '200px', marginBottom: '50px' }}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">{t('teacher.attachments')}</label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf"
                    className="mb-2"
                  />
                  {attachments.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {attachments.map((att, idx) => (
                        <li key={idx}>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {att.originalName || att.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  onClick={handleSaveSolution}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {t('teacher.save')} {t('teacher.solution')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

