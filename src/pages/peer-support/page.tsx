import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import BookingCalendar from '../../components/feature/BookingCalendar';

const TIMESLOTS_API = 'https://readdy.ai/api/public/timeslots?projectId=1737629476';
const APPOINTMENTS_API = 'https://readdy.ai/api/public/appointments?projectId=1737629476';
const BOOKING_FORM_SUBMIT_URL = 'https://readdy.ai/api/public/form-submit?projectId=1737629476&formId=peer-mentor-booking';

interface Mentor {
  id: string;
  name: string;
  photo: string;
  background: string;
  areas: string[];
}

interface Story {
  id: string;
  name: string;
  photo: string;
  quote: string;
  fullStory: string;
}

const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Sarah',
    photo: 'https://readdy.ai/api/search-image?query=warm%20compassionate%20woman%20in%20her%2040s%20with%20kind%20eyes%20wearing%20casual%20comfortable%20clothing%20simple%20neutral%20background%20natural%20lighting%20approachable%20friendly%20expression%20professional%20portrait%20style&width=400&height=400&seq=mentor-sarah-001&orientation=squarish',
    background: 'In recovery for 6 years. Former heroin user. Now works in community outreach.',
    areas: ['Recovery journey', 'Relapse prevention', 'Family relationships', 'Housing support']
  },
  {
    id: '2',
    name: 'Marcus',
    photo: 'https://readdy.ai/api/search-image?query=confident%20black%20man%20in%20his%2030s%20with%20warm%20smile%20wearing%20casual%20shirt%20simple%20neutral%20background%20natural%20lighting%20approachable%20friendly%20expression%20professional%20portrait%20style&width=400&height=400&seq=mentor-marcus-002&orientation=squarish',
    background: '8 years in recovery. Lived experience of homelessness and addiction. Peer mentor since 2019.',
    areas: ['Homelessness', 'Mental health', 'Benefits & employment', 'Harm reduction']
  },
  {
    id: '3',
    name: 'Jess',
    photo: 'https://readdy.ai/api/search-image?query=young%20woman%20in%20her%20late%2020s%20with%20genuine%20smile%20wearing%20comfortable%20casual%20clothing%20simple%20neutral%20background%20natural%20lighting%20approachable%20friendly%20expression%20professional%20portrait%20style&width=400&height=400&seq=mentor-jess-003&orientation=squarish',
    background: 'Currently in recovery. Former crack and alcohol user. Parent of two.',
    areas: ['Parenting in recovery', 'Women\'s support', 'Trauma-informed care', 'Self-care']
  },
  {
    id: '4',
    name: 'Dev',
    photo: 'https://readdy.ai/api/search-image?query=south%20asian%20man%20in%20his%2040s%20with%20kind%20expression%20wearing%20casual%20comfortable%20clothing%20simple%20neutral%20background%20natural%20lighting%20approachable%20friendly%20professional%20portrait%20style&width=400&height=400&seq=mentor-dev-004&orientation=squarish',
    background: '10 years in recovery. Lived experience of prescription drug dependency. Family support advocate.',
    areas: ['Prescription drug use', 'Family support', 'Cultural barriers', 'Stigma']
  },
  {
    id: '5',
    name: 'Leah',
    photo: 'https://readdy.ai/api/search-image?query=woman%20in%20her%2050s%20with%20warm%20compassionate%20expression%20wearing%20casual%20comfortable%20clothing%20simple%20neutral%20background%20natural%20lighting%20approachable%20friendly%20professional%20portrait%20style&width=400&height=400&seq=mentor-leah-005&orientation=squarish',
    background: '12 years in recovery. Former poly-drug user. Trained in trauma support and peer mentoring.',
    areas: ['Long-term recovery', 'Trauma recovery', 'Older adults', 'Grief & loss']
  },
  {
    id: '6',
    name: 'Kai',
    photo: 'https://readdy.ai/api/search-image?query=young%20non%20binary%20person%20in%20their%2020s%20with%20friendly%20smile%20wearing%20casual%20comfortable%20clothing%20simple%20neutral%20background%20natural%20lighting%20approachable%20professional%20portrait%20style&width=400&height=400&seq=mentor-kai-006&orientation=squarish',
    background: '4 years in recovery. Lived experience of chemsex and party drugs. LGBTQ+ advocate.',
    areas: ['LGBTQ+ support', 'Chemsex', 'Young people', 'Nightlife harm reduction']
  }
];

const stories: Story[] = [
  {
    id: '1',
    name: 'Tom',
    photo: 'https://readdy.ai/api/search-image?query=man%20in%20his%2030s%20looking%20hopeful%20and%20confident%20wearing%20casual%20clothing%20simple%20neutral%20background%20natural%20lighting%20genuine%20expression%20professional%20portrait%20style&width=400&height=400&seq=story-tom-001&orientation=squarish',
    quote: 'Having someone who\'s been there made all the difference. Sarah didn\'t judge me — she just got it.',
    fullStory: 'I was using heroin for nearly 10 years. I\'d tried rehab twice, but it never stuck. When I met Sarah through the peer support programme, something clicked. She didn\'t talk at me like a counsellor — she talked with me, like a mate who\'d walked the same road. She helped me see that relapse wasn\'t failure, it was part of the journey. She was there when I lost my flat, when I fell out with my family, and when I finally got 6 months clean. Now I\'m 18 months in recovery, back in touch with my kids, and training to be a peer mentor myself. Sarah showed me it was possible — not perfect, but possible.'
  },
  {
    id: '2',
    name: 'Aisha',
    photo: 'https://readdy.ai/api/search-image?query=young%20muslim%20woman%20in%20her%2020s%20with%20hopeful%20expression%20wearing%20hijab%20and%20casual%20clothing%20simple%20neutral%20background%20natural%20lighting%20genuine%20smile%20professional%20portrait%20style&width=400&height=400&seq=story-aisha-002&orientation=squarish',
    quote: 'I couldn\'t talk to my family about my brother\'s addiction. Dev understood the cultural shame I was carrying.',
    fullStory: 'My younger brother started using prescription painkillers after an injury, and it spiralled into heroin use. In our community, addiction is seen as a moral failing — something to hide. I felt so alone. When I met Dev, he understood immediately. He\'d been through it himself and knew what it was like to navigate addiction in a South Asian family. He helped me find the words to talk to my parents, connected me with culturally sensitive resources, and reminded me that loving my brother didn\'t mean enabling him. My brother is now in treatment, and our family is healing. I don\'t think we\'d have got here without Dev\'s support.'
  },
  {
    id: '3',
    name: 'Claire',
    photo: 'https://readdy.ai/api/search-image?query=woman%20in%20her%2040s%20with%20calm%20peaceful%20expression%20wearing%20casual%20comfortable%20clothing%20simple%20neutral%20background%20natural%20lighting%20serene%20genuine%20smile%20professional%20portrait%20style&width=400&height=400&seq=story-claire-003&orientation=squarish',
    quote: 'Leah helped me see that my past didn\'t define my future. I\'m now 3 years clean and rebuilding my life.',
    fullStory: 'I lost everything to crack and alcohol — my job, my home, my self-respect. I was sleeping rough for 8 months before I found NAP. Leah was assigned as my peer mentor, and from day one, she treated me like a person, not a problem. She helped me access a hostel, sort out my benefits, and start thinking about what I wanted from life. She\'d check in on me every week, even when I relapsed. She never gave up on me, even when I\'d given up on myself. Today, I\'m 3 years clean, living in my own flat, and volunteering at a women\'s shelter. Leah showed me that recovery wasn\'t about being perfect — it was about showing up, one day at a time.'
  }
];

const faqs = [
  {
    question: 'Is peer support confidential?',
    answer: 'Yes, absolutely. All peer mentors are trained in confidentiality and follow strict ethical guidelines. What you share stays between you and your mentor, unless there\'s a risk of serious harm to yourself or others. Your mentor will explain the limits of confidentiality in your first session.'
  },
  {
    question: 'What if I don\'t connect with my mentor?',
    answer: 'That\'s completely okay — connection is important, and not every match works out. You can request a different mentor at any time, no questions asked. We want you to feel comfortable and supported, so finding the right fit is our priority.'
  },
  {
    question: 'Can I be a peer mentor?',
    answer: 'Yes! If you have lived experience of substance use (your own or a loved one\'s) and are in a stable place in your recovery or life, you can apply to become a peer mentor. We provide full training, ongoing supervision, and support. Contact us to find out more about our next training cohort.'
  },
  {
    question: 'Do I have to be in recovery to access peer support?',
    answer: 'No. Peer support is for anyone affected by substance use — whether you\'re currently using, in recovery, thinking about making changes, or supporting a loved one. You don\'t need to be "ready to quit" to benefit from peer support.'
  },
  {
    question: 'How often will I meet with my mentor?',
    answer: 'That\'s up to you. Most people meet weekly or fortnightly, either in person at our centre or by phone/video call. Sessions usually last 45–60 minutes. You and your mentor will agree on a schedule that works for both of you.'
  },
  {
    question: 'Is peer support a replacement for treatment or counselling?',
    answer: 'No — peer support complements other services, it doesn\'t replace them. Peer mentors offer emotional support, practical guidance, and shared understanding based on lived experience. They\'re not therapists or medical professionals, but they can help you navigate services, stay motivated, and feel less alone.'
  }
];

export default function PeerSupportPage() {
  usePageMeta({
    title: 'Peer Support & Mentoring | Lived Experience Support | Nottingham Action Partnership',
    description: 'Connect with trained peer mentors who have lived experience of substance use and recovery. One-to-one support, shared understanding, and practical guidance from people who\'ve been there.',
    keywords: 'peer support, peer mentoring, lived experience, recovery support, addiction support, Nottingham'
  });

  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToStories = () => {
    const storiesSection = document.getElementById('stories-section');
    if (storiesSection) {
      storiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-amber-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Peer Support That Gets It
            </h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Connect with trained mentors who have lived experience of substance use, recovery, or supporting a loved one. Real understanding. No judgment. Just support from people who've been there.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToBooking}
                className="px-8 py-4 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Book a Mentor Session
              </button>
              <button
                onClick={scrollToStories}
                className="px-8 py-4 bg-white text-rose-600 font-semibold rounded-lg border-2 border-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Read Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Peer Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What is Peer Support?</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                Peer support is one-to-one mentoring from someone who has <strong>lived experience</strong> of substance use, recovery, or supporting a loved one through addiction. It's not therapy or treatment — it's something different, and often more powerful.
              </p>
              <p>
                Our peer mentors have walked similar paths. They understand the shame, the fear, the isolation, and the hope. They won't judge you, lecture you, or tell you what to do. They'll listen, share what worked for them, and help you find your own way forward.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Who is peer support for?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-amber-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span>People currently using drugs or alcohol</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-amber-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span>People in recovery (any stage)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-amber-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span>Family members, partners, and carers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-amber-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span>Anyone thinking about making changes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-amber-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span>People who've tried treatment before and it didn't work</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-user-add-line text-rose-600 text-3xl w-12 h-12 flex items-center justify-center"></i>
              </div>
              <div className="text-5xl font-bold text-rose-200 mb-4">01</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Request a Mentor</h3>
              <p className="text-gray-700 leading-relaxed">
                Book a session below or call us. Tell us a bit about what you're looking for — we'll match you with a mentor who has relevant lived experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-line text-amber-600 text-3xl w-12 h-12 flex items-center justify-center"></i>
              </div>
              <div className="text-5xl font-bold text-amber-200 mb-4">02</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Matched</h3>
              <p className="text-gray-700 leading-relaxed">
                We'll introduce you to your mentor and arrange your first meeting. You can meet in person at our centre, by phone, or video call — whatever feels right.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-calendar-check-line text-teal-600 text-3xl w-12 h-12 flex items-center justify-center"></i>
              </div>
              <div className="text-5xl font-bold text-teal-200 mb-4">03</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Meet Regularly</h3>
              <p className="text-gray-700 leading-relaxed">
                Most people meet weekly or fortnightly. Sessions last 45–60 minutes. You and your mentor decide what to talk about and how often to meet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Profiles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Meet Our Peer Mentors</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-3xl mx-auto">
            All our mentors are trained, supervised, and have lived experience. They're here to support you, not fix you.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="w-full h-64 overflow-hidden">
                  <img
                    src={mentor.photo}
                    alt={mentor.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{mentor.name}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{mentor.background}</p>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas of support:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.areas.map((area, idx) => (
                        <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-700 text-sm rounded-full whitespace-nowrap">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={scrollToBooking}
                    className="w-full px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Book This Mentor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lived Experience Stories */}
      <section id="stories-section" className="py-20 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Lived Experience Stories</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-3xl mx-auto">
            Real stories from people who've been supported by our peer mentors.
          </p>
          <div className="space-y-8">
            {stories.map((story) => (
              <div key={story.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="md:flex">
                  <div className="md:w-1/3 w-full h-80 md:h-auto overflow-hidden">
                    <img
                      src={story.photo}
                      alt={story.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="mb-4">
                      <i className="ri-double-quotes-l text-4xl text-rose-300 w-12 h-12 flex items-center justify-center"></i>
                    </div>
                    <blockquote className="text-xl font-medium text-gray-900 mb-6 italic leading-relaxed">
                      "{story.quote}"
                    </blockquote>
                    <p className="text-lg font-semibold text-gray-900 mb-4">— {story.name}</p>
                    {expandedStory === story.id ? (
                      <>
                        <p className="text-gray-700 leading-relaxed mb-4">{story.fullStory}</p>
                        <button
                          onClick={() => setExpandedStory(null)}
                          className="text-rose-600 font-semibold hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                          <span>Read less</span>
                          <i className="ri-arrow-up-s-line text-xl w-6 h-6 flex items-center justify-center"></i>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setExpandedStory(story.id)}
                        className="text-rose-600 font-semibold hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span>Read full story</span>
                        <i className="ri-arrow-down-s-line text-xl w-6 h-6 flex items-center justify-center"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Book a Peer Mentor Session</h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Choose a time that works for you. We'll call you to discuss what you're looking for and match you with the right mentor.
            </p>
            <BookingCalendar
              timeslotsApi={TIMESLOTS_API}
              appointmentsApi={APPOINTMENTS_API}
              formSubmitUrl={BOOKING_FORM_SUBMIT_URL}
              texts={{
                stepDateTitle: 'Choose Date',
                stepTimeTitle: 'Choose Time',
                stepFormTitle: 'Your Details',
                prevMonth: 'Previous month',
                nextMonth: 'Next month',
                selectTime: 'Select a time slot',
                modifyTime: 'Change time',
                nameLabel: 'Full Name',
                namePlaceholder: 'Your full name',
                phoneLabel: 'Phone Number',
                phonePlaceholder: 'Your phone number',
                notesLabel: 'Notes',
                notesPlaceholder: 'Anything you\'d like us to know',
                submitButton: 'Book Session',
                submitting: 'Booking...',
                successMessage: 'Session Booked!',
                successSub: 'We\'ll be in touch to confirm your mentor match.',
                bookAnother: 'Book another session',
                noSlots: 'No available slots this month.',
                selectedDate: 'Selected date',
                selectedTime: 'Selected time',
                back: 'Back',
                required: 'Required',
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <i className={`${expandedFaq === faq.question ? 'ri-subtract-line' : 'ri-add-line'} text-2xl text-rose-600 flex-shrink-0 w-8 h-8 flex items-center justify-center`}></i>
                </button>
                {expandedFaq === faq.question && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-rose-700">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">You Don't Have to Do This Alone</h2>
          <p className="text-xl text-rose-100 mb-10 leading-relaxed">
            Whether you're struggling, in recovery, or supporting someone you love — peer support can help. Connect with someone who gets it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToBooking}
              className="px-8 py-4 bg-white text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Book a Session
            </button>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}