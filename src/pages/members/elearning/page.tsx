import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { courses } from '../../../mocks/elearningCourses';

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  isCompleted: boolean;
}

export default function ELearningPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

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
    if (user && !accessDenied) {
      loadProgress();
    }
  }, [user, accessDenied]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('elearning_progress')
        .select('course_id, lesson_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      const progressMap: Record<string, CourseProgress> = {};

      courses.forEach(course => {
        const completedLessons = data?.filter(p => p.course_id === course.id).length || 0;
        const totalLessons = course.lessons.length;
        const percentage = Math.round((completedLessons / totalLessons) * 100);
        
        progressMap[course.id] = {
          courseId: course.id,
          completedLessons,
          totalLessons,
          percentage,
          isCompleted: completedLessons === totalLessons
        };
      });

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (courseId: string) => {
    const prog = progress[courseId];
    if (!prog || prog.completedLessons === 0) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap">Not Started</span>;
    }
    if (prog.isCompleted) {
      return <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1"><i className="ri-checkbox-circle-fill"></i> Completed</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">In Progress</span>;
  };

  const getButtonText = (courseId: string) => {
    const prog = progress[courseId];
    if (!prog || prog.completedLessons === 0) return 'Start Course';
    if (prog.isCompleted) return 'Review Course';
    return 'Continue';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const completedCount = Object.values(progress).filter(p => p.isCompleted).length;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">eLearning</h1>
              <p className="text-gray-600 mt-2">Build your knowledge with our comprehensive training courses</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-600">{completedCount}/{courses.length}</div>
              <div className="text-sm text-gray-600">Courses Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => {
            const prog = progress[course.id];
            return (
              <div key={course.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 text-sm whitespace-nowrap">
                      <i className="ri-time-line"></i>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 text-sm whitespace-nowrap">
                      <i className="ri-book-line"></i>
                      {course.lessons.length} Lessons
                    </span>
                    {getStatusBadge(course.id)}
                  </div>

                  {/* Progress Bar */}
                  {prog && prog.completedLessons > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{prog.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${prog.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {prog.completedLessons} of {prog.totalLessons} lessons completed
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/members/elearning/${course.id}`}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {getButtonText(course.id)}
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}