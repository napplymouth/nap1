import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import supabase from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import { courses } from '../../../../mocks/elearningCourses';

export default function CoursePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const course = courses.find(c => c.id === courseId);

  // Check user role access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/members/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('member_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Only allow Peer Trainers and volunteer roles (Kit Carrier, First Responder, Coordinator)
        const allowedRoles = ['Peer Trainer', 'Kit Carrier', 'First Responder', 'Coordinator'];
        
        if (!profile || !allowedRoles.includes(profile.role)) {
          setAccessDenied(true);
          setTimeout(() => {
            navigate('/members/dashboard');
          }, 3000);
          return;
        }

        setAccessDenied(false);
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/members/dashboard');
      }
    };

    checkAccess();
  }, [user, navigate]);

  useEffect(() => {
    if (user && course && !accessDenied) {
      loadProgress();
    }
  }, [user, course, accessDenied]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('elearning_progress')
        .select('lesson_id')
        .eq('user_id', user?.id)
        .eq('course_id', courseId);

      if (error) throw error;

      const completed = data?.map(p => p.lesson_id) || [];
      setCompletedLessons(completed);

      // Find first incomplete lesson
      const firstIncomplete = course?.lessons.findIndex(l => !completed.includes(l.id));
      if (firstIncomplete !== undefined && firstIncomplete !== -1) {
        setCurrentLessonIndex(firstIncomplete);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user || !course) return;
    
    setMarking(true);
    try {
      const { error } = await supabase
        .from('elearning_progress')
        .insert({
          user_id: user.id,
          course_id: course.id,
          lesson_id: lessonId
        });

      if (error) throw error;

      setCompletedLessons([...completedLessons, lessonId]);

      // Check if all lessons are now complete
      if (completedLessons.length + 1 === course.lessons.length) {
        setShowCertificate(true);
      } else {
        // Move to next lesson
        if (currentLessonIndex < course.lessons.length - 1) {
          setCurrentLessonIndex(currentLessonIndex + 1);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  // Access Denied Screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border-2 border-yellow-200">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-lock-line text-4xl text-yellow-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">eLearning Access Restricted</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            eLearning courses are available for <strong>Peer Trainers</strong> and <strong>Volunteers</strong> only.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <i className="ri-information-line mr-1"></i>
              Redirecting you to your dashboard...
            </p>
          </div>
          <button
            onClick={() => navigate('/members/dashboard')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Link to="/members/elearning" className="text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const isCurrentLessonComplete = completedLessons.includes(currentLesson.id);
  const progressPercentage = Math.round((completedLessons.length / course.lessons.length) * 100);
  const allComplete = completedLessons.length === course.lessons.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Certificate Modal
  if (showCertificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-trophy-fill text-4xl text-teal-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You've successfully completed <strong>{course.title}</strong>
          </p>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6 mb-6">
            <div className="text-sm text-teal-700 font-medium mb-2">CERTIFICATE OF COMPLETION</div>
            <div className="text-2xl font-bold text-teal-900 mb-2">{course.title}</div>
            <div className="text-sm text-teal-700">
              Completed on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/members/elearning')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              Back to Courses
            </button>
            <button
              onClick={() => setShowCertificate(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              Review Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link to="/members/elearning" className="text-teal-600 hover:text-teal-700 font-medium mb-4 inline-flex items-center gap-2 whitespace-nowrap">
            <i className="ri-arrow-left-line"></i> Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedLessons.length} of {course.lessons.length} lessons completed
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => {
                  const isComplete = completedLessons.includes(lesson.id);
                  const isCurrent = index === currentLessonIndex;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        isCurrent 
                          ? 'bg-teal-50 border-2 border-teal-600' 
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isComplete 
                            ? 'bg-teal-600 text-white' 
                            : isCurrent 
                            ? 'bg-teal-100 text-teal-600' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isComplete ? (
                            <i className="ri-check-line text-sm"></i>
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${isCurrent ? 'text-teal-900' : 'text-gray-900'}`}>
                            {lesson.title}
                          </div>
                          {isComplete && (
                            <div className="text-xs text-teal-600 mt-1">Completed</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCurrentLessonComplete ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600'
                }`}>
                  {isCurrentLessonComplete ? (
                    <i className="ri-check-line text-xl"></i>
                  ) : (
                    <span className="font-bold">{currentLessonIndex + 1}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
                  <div className="text-sm text-gray-600">
                    Lesson {currentLessonIndex + 1} of {course.lessons.length}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                {currentLesson.content.split('\n\n').map((paragraph, index) => {
                  // Check if it's a heading (starts with a word followed by colon)
                  if (paragraph.match(/^[A-Z][^:]+:/)) {
                    const [heading, ...rest] = paragraph.split(':');
                    return (
                      <div key={index} className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{heading}:</h3>
                        {rest.join(':').trim() && <p className="text-gray-700 leading-relaxed">{rest.join(':').trim()}</p>}
                      </div>
                    );
                  }
                  
                  // Check if it's a bullet list
                  if (paragraph.includes('\n•')) {
                    const lines = paragraph.split('\n');
                    const intro = lines[0];
                    const bullets = lines.slice(1).filter(l => l.trim().startsWith('•'));
                    
                    return (
                      <div key={index} className="mb-4">
                        {intro && <p className="text-gray-700 leading-relaxed mb-2">{intro}</p>}
                        <ul className="list-none space-y-2 ml-0">
                          {bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-teal-600 mt-1">•</span>
                              <span className="text-gray-700 leading-relaxed flex-1">{bullet.replace('•', '').trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  
                  // Regular paragraph
                  return <p key={index} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>;
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                  disabled={currentLessonIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line"></i>
                  Previous
                </button>

                {!isCurrentLessonComplete ? (
                  <button
                    onClick={() => markLessonComplete(currentLesson.id)}
                    disabled={marking}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {marking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="ri-check-line"></i>
                        Mark as Complete
                      </>
                    )}
                  </button>
                ) : currentLessonIndex < course.lessons.length - 1 ? (
                  <button
                    onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap"
                  >
                    Next Lesson
                    <i className="ri-arrow-right-line"></i>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap"
                  >
                    <i className="ri-trophy-line"></i>
                    View Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}