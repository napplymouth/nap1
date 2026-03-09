import React, { useState, useEffect } from 'react';
import SiteNav from '../../components/feature/SiteNav';
import { usePageMeta } from '../../hooks/usePageMeta';

interface TrainingStep {
  id: number;
  title: string;
  description: string;
  image: string;
  tips: string[];
  warning?: string;
  timeLimit?: number;
}

const trainingSteps: TrainingStep[] = [
  {
    id: 1,
    title: "Check for Responsiveness",
    description: "Tap the person's shoulders firmly and shout their name. Look for any response.",
    image: "https://readdy.ai/api/search-image?query=emergency%20responder%20checking%20unconscious%20person%20responsiveness%20by%20tapping%20shoulders%2C%20medical%20training%20scenario%2C%20clear%20background&width=400&height=300&seq=naloxone-step1&orientation=landscape",
    tips: [
      "Tap both shoulders firmly",
      "Shout their name loudly",
      "Look for any movement or response",
      "Check if their eyes open"
    ],
    warning: "If they respond but seem confused, stay with them and monitor closely"
  },
  {
    id: 2,
    title: "Check Breathing",
    description: "Look, listen, and feel for breathing. Check for 10 seconds maximum.",
    image: "https://readdy.ai/api/search-image?query=checking%20breathing%20on%20unconscious%20person%2C%20medical%20emergency%20assessment%2C%20first%20aid%20position%2C%20clinical%20background&width=400&height=300&seq=naloxone-step2&orientation=landscape",
    tips: [
      "Watch chest for rising and falling",
      "Listen for breathing sounds",
      "Feel for breath on your cheek",
      "Look for blue lips or fingertips"
    ],
    warning: "Slow, shallow, or absent breathing indicates overdose",
    timeLimit: 10
  },
  {
    id: 3,
    title: "Call for Help",
    description: "Call 999 immediately. Request ambulance for suspected drug overdose.",
    image: "https://readdy.ai/api/search-image?query=person%20making%20emergency%20phone%20call%20999%2C%20urgent%20medical%20situation%2C%20phone%20in%20hand%2C%20emergency%20response&width=400&height=300&seq=naloxone-step3&orientation=landscape",
    tips: [
      "Say 'suspected drug overdose'",
      "Give exact location",
      "Stay on the line",
      "Tell them you have naloxone"
    ],
    warning: "Don't hang up - they may give additional instructions"
  },
  {
    id: 4,
    title: "Position the Person",
    description: "Place them in recovery position if breathing, or flat on back if not breathing.",
    image: "https://readdy.ai/api/search-image?query=recovery%20position%20first%20aid%2C%20person%20lying%20on%20side%20safely%2C%20medical%20emergency%20positioning%2C%20training%20demonstration&width=400&height=300&seq=naloxone-step4&orientation=landscape",
    tips: [
      "Tilt head back to open airway",
      "Turn to side if breathing",
      "Flat on back if no breathing",
      "Clear mouth of any obstructions"
    ]
  },
  {
    id: 5,
    title: "Prepare Naloxone",
    description: "Remove naloxone nasal spray from packaging. Check expiry date.",
    image: "https://readdy.ai/api/search-image?query=naloxone%20nasal%20spray%20being%20prepared%2C%20hands%20holding%20medical%20device%2C%20emergency%20medication%20preparation%2C%20clean%20background&width=400&height=300&seq=naloxone-step5&orientation=landscape",
    tips: [
      "Remove from protective packaging",
      "Check expiry date",
      "Don't test spray beforehand",
      "Hold firmly in dominant hand"
    ],
    warning: "Each device is single-use only"
  },
  {
    id: 6,
    title: "Administer Naloxone",
    description: "Insert device in nostril and press plunger firmly to deliver full dose.",
    image: "https://readdy.ai/api/search-image?query=naloxone%20nasal%20spray%20being%20administered%20correctly%2C%20medical%20emergency%20treatment%2C%20first%20aid%20procedure%2C%20detailed%20view&width=400&height=300&seq=naloxone-step6&orientation=landscape",
    tips: [
      "Insert tip into nostril",
      "Push plunger firmly",
      "Don't spray into air first",
      "Use full force - it won't hurt them"
    ],
    warning: "Push hard and fast - gentle won't work"
  },
  {
    id: 7,
    title: "Monitor and Rescue Breathing",
    description: "Give rescue breaths if not breathing. 1 breath every 5 seconds.",
    image: "https://readdy.ai/api/search-image?query=rescue%20breathing%20technique%20demonstration%2C%20mouth%20to%20mouth%20resuscitation%2C%20emergency%20life%20support%2C%20medical%20training%20scenario&width=400&height=300&seq=naloxone-step7&orientation=landscape",
    tips: [
      "Tilt head back, lift chin",
      "Pinch nose closed",
      "Cover mouth with yours",
      "Give 1 breath every 5 seconds"
    ],
    timeLimit: 300
  },
  {
    id: 8,
    title: "Wait for Response",
    description: "Naloxone takes 2-5 minutes to work. Continue monitoring breathing.",
    image: "https://readdy.ai/api/search-image?query=waiting%20and%20monitoring%20unconscious%20patient%2C%20medical%20emergency%20observation%2C%20first%20responder%20watching%20for%20signs%2C%20clinical%20setting&width=400&height=300&seq=naloxone-step8&orientation=landscape",
    tips: [
      "Watch for breathing to improve",
      "Look for movement or consciousness",
      "Continue rescue breathing if needed",
      "Stay calm and focused"
    ],
    warning: "Don't leave them alone - they may stop breathing again"
  },
  {
    id: 9,
    title: "Second Dose if Needed",
    description: "If no response after 3 minutes, give second dose with new device.",
    image: "https://readdy.ai/api/search-image?query=second%20naloxone%20dose%20being%20prepared%2C%20multiple%20emergency%20medication%20devices%2C%20urgent%20medical%20treatment%2C%20healthcare%20setting&width=400&height=300&seq=naloxone-step9&orientation=landscape",
    tips: [
      "Wait 2-3 minutes before second dose",
      "Use opposite nostril",
      "Use new device",
      "Continue rescue breathing"
    ],
    warning: "Some overdoses need multiple doses"
  },
  {
    id: 10,
    title: "Recovery Position",
    description: "Once breathing returns, place in recovery position and monitor until help arrives.",
    image: "https://readdy.ai/api/search-image?query=person%20in%20recovery%20position%20being%20monitored%2C%20successful%20overdose%20reversal%2C%20medical%20emergency%20aftermath%2C%20safe%20positioning&width=400&height=300&seq=naloxone-step10&orientation=landscape",
    tips: [
      "Turn onto their side",
      "Support head with hand",
      "Bend top leg for stability",
      "Keep talking to them"
    ],
    warning: "They may be confused or agitated when they wake up"
  }
];

const scenarios = [
  {
    id: 1,
    title: "Friend's House Overdose",
    description: "You're at a friend's house when they collapse after using drugs",
    setting: "Private residence",
    challenges: ["Limited space", "Other people present", "Finding phone"]
  },
  {
    id: 2,
    title: "Public Space Emergency",
    description: "Someone has collapsed in a park or street",
    setting: "Public area", 
    challenges: ["Crowds gathering", "Safety concerns", "Finding address"]
  },
  {
    id: 3,
    title: "Family Member Crisis",
    description: "Your adult child has overdosed at home",
    setting: "Family home",
    challenges: ["Emotional distress", "Panic response", "Family dynamics"]
  }
];

export default function NaloxoneTrainingPage() {
  usePageMeta({
    title: "Interactive Naloxone Training Simulator - Learn Life-Saving Skills | Plymouth Harm Reduction",
    description: "Master naloxone administration with our step-by-step interactive training simulator. Practice overdose response techniques and build confidence in emergency situations.",
    keywords: "naloxone training, overdose response, emergency skills, Plymouth, harm reduction, life saving"
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [trainingMode, setTrainingMode] = useState<'learn' | 'practice' | 'test'>('learn');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startTraining = (scenario: number, mode: 'learn' | 'practice' | 'test') => {
    setSelectedScenario(scenario);
    setTrainingMode(mode);
    setCurrentStep(0);
    setTimer(0);
    setCompletedSteps([]);
    setShowCompletion(false);
    setIsTimerRunning(true);
  };

  const nextStep = () => {
    if (currentStep < trainingSteps.length - 1) {
      setCompletedSteps(prev => [...prev, trainingSteps[currentStep].id]);
      setCurrentStep(prev => prev + 1);
    } else {
      setCompletedSteps(prev => [...prev, trainingSteps[currentStep].id]);
      setIsTimerRunning(false);
      setShowCompletion(true);
    }
  };

  const resetTraining = () => {
    setSelectedScenario(null);
    setCurrentStep(0);
    setTimer(0);
    setIsTimerRunning(false);
    setCompletedSteps([]);
    setShowCompletion(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = trainingSteps[currentStep];
  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <SiteNav />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-6">
              <i className="ri-heart-pulse-line text-6xl text-red-200"></i>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Interactive Naloxone Training
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Learn life-saving skills with our step-by-step simulator. Practice recognizing overdoses and administering naloxone confidently.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <i className="ri-time-line mr-2"></i>15-minute training
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <i className="ri-medal-line mr-2"></i>Certificate available
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <i className="ri-phone-line mr-2"></i>Works on all devices
              </div>
            </div>
          </div>
        </section>

        {!selectedScenario && !showCompletion && (
          <>
            {/* Training Modes */}
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your Training Mode
                  </h2>
                  <p className="text-xl text-gray-600">
                    Select the learning style that works best for you
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <div className="text-center">
                      <i className="ri-book-open-line text-4xl text-blue-600 mb-4"></i>
                      <h3 className="text-xl font-semibold mb-4">Learn Mode</h3>
                      <p className="text-gray-600 mb-6">
                        Detailed step-by-step guidance with tips and explanations for each action.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-6">
                        <div>• Full instructions for each step</div>
                        <div>• Safety tips and warnings</div>
                        <div>• No time pressure</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-amber-100 hover:border-amber-300 transition-colors">
                    <div className="text-center">
                      <i className="ri-play-circle-line text-4xl text-amber-600 mb-4"></i>
                      <h3 className="text-xl font-semibold mb-4">Practice Mode</h3>
                      <p className="text-gray-600 mb-6">
                        Hands-on simulation with guidance available when you need it.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-6">
                        <div>• Interactive scenarios</div>
                        <div>• Hints available on request</div>
                        <div>• Build muscle memory</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-green-100 hover:border-green-300 transition-colors">
                    <div className="text-center">
                      <i className="ri-trophy-line text-4xl text-green-600 mb-4"></i>
                      <h3 className="text-xl font-semibold mb-4">Test Mode</h3>
                      <p className="text-gray-600 mb-6">
                        Timed assessment to test your knowledge and earn a certificate.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-6">
                        <div>• Realistic time pressures</div>
                        <div>• Performance scoring</div>
                        <div>• Certificate on completion</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Selection */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Select a Training Scenario
                  </h3>
                  <p className="text-gray-600">
                    Choose a realistic situation to practice your response
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="bg-white p-6 rounded-xl shadow-lg">
                      <h4 className="text-lg font-semibold mb-3">{scenario.title}</h4>
                      <p className="text-gray-600 mb-4">{scenario.description}</p>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Setting: {scenario.setting}</div>
                        <div className="text-sm text-gray-600">
                          <strong>Challenges:</strong>
                          <ul className="mt-1 space-y-1">
                            {scenario.challenges.map((challenge, index) => (
                              <li key={index}>• {challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => startTraining(scenario.id, 'learn')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Learn Mode
                        </button>
                        <button
                          onClick={() => startTraining(scenario.id, 'practice')}
                          className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                        >
                          Practice Mode
                        </button>
                        <button
                          onClick={() => startTraining(scenario.id, 'test')}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Test Mode
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Key Learning Points */}
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    What You'll Learn
                  </h2>
                  <p className="text-xl text-gray-600">
                    Essential skills that could save a life
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-eye-line text-2xl text-red-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Recognize Overdose</h3>
                    <p className="text-sm text-gray-600">Identify signs of opioid overdose quickly and accurately</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-phone-line text-2xl text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Emergency Response</h3>
                    <p className="text-sm text-gray-600">Call for help effectively and provide critical information</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-medicine-bottle-line text-2xl text-green-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Administer Naloxone</h3>
                    <p className="text-sm text-gray-600">Use naloxone correctly and confidently when needed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-heart-pulse-line text-2xl text-amber-600"></i>
                    </div>
                    <h3 className="font-semibold mb-2">Provide Support</h3>
                    <p className="text-sm text-gray-600">Monitor recovery and provide ongoing care until help arrives</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Training Interface */}
        {selectedScenario && !showCompletion && (
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Training Header */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedScenarioData?.title} - {trainingMode.charAt(0).toUpperCase() + trainingMode.slice(1)} Mode
                    </h2>
                    <p className="text-gray-600">{selectedScenarioData?.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="text-lg font-semibold">{formatTime(timer)}</div>
                    </div>
                    <button
                      onClick={resetTraining}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Exit Training
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / trainingSteps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Step {currentStep + 1} of {trainingSteps.length}</span>
                  <span>{Math.round(((currentStep + 1) / trainingSteps.length) * 100)}% Complete</span>
                </div>
              </div>

              {/* Current Step */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {currentStepData.id}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {currentStepData.title}
                      </h3>
                      {currentStepData.timeLimit && (
                        <div className="ml-auto bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                          {currentStepData.timeLimit}s limit
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 text-lg mb-4">
                      {currentStepData.description}
                    </p>
                    {currentStepData.warning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <i className="ri-alert-line text-amber-600 text-lg mt-0.5"></i>
                          <div>
                            <div className="font-medium text-amber-800 mb-1">Important</div>
                            <div className="text-amber-700">{currentStepData.warning}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Points:</h4>
                    <ul className="space-y-2">
                      {currentStepData.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <i className="ri-check-line text-green-600 text-sm mt-1"></i>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg whitespace-nowrap"
                  >
                    {currentStep === trainingSteps.length - 1 ? 'Complete Training' : 'Next Step'}
                    <i className="ri-arrow-right-line ml-2"></i>
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <img
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />

                  {/* Mini Progress */}
                  <div className="grid grid-cols-5 gap-2">
                    {trainingSteps.slice(0, 10).map((step) => (
                      <div
                        key={step.id}
                        className={`h-2 rounded-full ${
                          completedSteps.includes(step.id)
                            ? 'bg-green-500'
                            : step.id === currentStepData.id
                            ? 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="text-center mt-3 text-sm text-gray-500">
                    Steps completed: {completedSteps.length}/{trainingSteps.length}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Completion Screen */}
        {showCompletion && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <i className="ri-trophy-line text-6xl text-green-600 mb-4"></i>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Training Complete!
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">
                    Congratulations! You've completed the naloxone training simulation.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{formatTime(timer)}</div>
                    <div className="text-gray-600">Total Time</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedSteps.length}</div>
                    <div className="text-gray-600">Steps Completed</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {trainingMode === 'test' ? 'Pass' : 'Complete'}
                    </div>
                    <div className="text-gray-600">Status</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={resetTraining}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap mr-4"
                  >
                    Try Another Scenario
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                  >
                    Print Certificate
                  </button>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <p className="text-blue-800 mb-4">
                    You're now trained to respond to overdose emergencies. Consider:
                  </p>
                  <ul className="text-blue-800 text-sm space-y-2">
                    <li>• Get a free naloxone kit from one of our pickup locations</li>
                    <li>• Share this training with friends and family</li>
                    <li>• Refresh your skills every 6 months</li>
                    <li>• Join our volunteer program to help others</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Emergency Contact Info */}
        <section className="py-16 bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Emergency Contacts</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <i className="ri-phone-line text-4xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">Emergency Services</h3>
                <p className="text-2xl font-bold">999</p>
                <p className="text-red-200">For immediate medical emergencies</p>
              </div>
              <div>
                <i className="ri-heart-line text-4xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">Never Use Alone</h3>
                <p className="text-2xl font-bold">0800 559 2730</p>
                <p className="text-red-200">Free phone support while using</p>
              </div>
              <div>
                <i className="ri-chat-1-line text-4xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">Crisis Support</h3>
                <p className="text-2xl font-bold">0800 138 1677</p>
                <p className="text-red-200">24/7 mental health support</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}