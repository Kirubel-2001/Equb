import React, { useState } from 'react';
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  HelpCircle, 
  Users, 
  Search, 
  Calendar, 
  DollarSign, 
  Award, 
  Bell, 
  MessageSquare,
  BarChart,
  Check,
  AlertTriangle
} from 'lucide-react';

export const Help = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  const toggleFaq = (id) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(faqId => faqId !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };

  const faqData = [
    {
      id: 1,
      question: "What is an Equb?",
      answer: "Equb is a rotating savings and credit association where members contribute a fixed amount regularly (weekly, monthly, etc.), and take turns receiving the collected sum. It's a traditional financial system based on trust and community."
    },
    {
      id: 2,
      question: "How do I create an Equb?",
      answer: "To create an Equb, go to your dashboard and click the 'Create Equb' button. Fill in details like name, location, number of participants, contribution amount, cycle frequency, and whether you want automatic or special case lottery."
    },
    {
      id: 3,
      question: "How do I join an Equb?",
      answer: "Search for Equbs using the filters on your dashboard. When you find one you like, click to view details and request to join. The Equb creator will verify your identity in person before accepting you."
    },
    {
      id: 4,
      question: "What is the difference between automatic and special case Equbs?",
      answer: "Automatic Equbs run on a predetermined schedule with automatic lottery selection. Special case Equbs allow the creator to manually select winners or use custom selection methods."
    },
    {
      id: 5, 
      question: "How is the winner selected?",
      answer: "In automatic Equbs, winners are selected randomly by the system. In special case Equbs, the creator selects winners manually. All participants will receive notifications when winners are announced."
    },
    {
      id: 6,
      question: "How do I mark attendance and payments?",
      answer: "As an Equb creator, go to the 'My Equbs' tab, select your Equb, and navigate to the 'Attendance' section. There you can mark which participants have made their payments for each cycle."
    }
  ];

  const sections = [
    { id: 'about', title: 'About Equb', icon: <HelpCircle size={20} /> },
    { id: 'participant', title: 'For Participants', icon: <Users size={20} /> },
    { id: 'creator', title: 'For Creators', icon: <Award size={20} /> },
    { id: 'faq', title: 'FAQ', icon: <MessageSquare size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen"
    >
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">Equb Platform Help Center</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Welcome to our help center. Here you'll find everything you need to know about creating, joining, and managing Equbs on our platform.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:w-1/4"
        >
          <div className="bg-indigo-50 rounded-lg p-4 sticky top-4">
            <h2 className="font-bold text-indigo-800 mb-4 text-xl">Help Topics</h2>
            <ul className="space-y-2">
              {sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 w-full p-3 rounded-md transition-all ${
                      activeSection === section.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'hover:bg-indigo-100 text-gray-700'
                    }`}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="md:w-3/4"
        >
          <AnimatePresence mode="wait">
            {activeSection === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                  <HelpCircle /> About Equb
                </h2>
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">What is Equb?</h3>
                    <p className="text-gray-700">
                      Equb is a traditional rotating savings and credit association common in Ethiopia and other parts of Africa. It allows a group of individuals to pool their money together, with members taking turns to receive the collected sum.
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">How Our Platform Works</h3>
                    <p className="text-gray-700 mb-4">
                      Our Equb management system digitizes this traditional practice, making it easier to create, join, and manage Equbs while ensuring security and transparency.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Search size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Find or Create</h4>
                          <p className="text-gray-600">Search for existing Equbs based on location, amount, and other criteria, or create your own.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Users size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Join and Participate</h4>
                          <p className="text-gray-600">Request to join Equbs, meet in person for verification, and participate in saving cycles.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Calendar size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Track Cycles</h4>
                          <p className="text-gray-600">Follow the progress of your Equbs, track payments, and know when it's your turn to receive funds.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <DollarSign size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Secure Transactions</h4>
                          <p className="text-gray-600">Manage payments and track fund distributions with transparency and security.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'participant' && (
              <motion.div
                key="participant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                  <Users /> For Participants
                </h2>

                <div className="space-y-6">
                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">How to Join an Equb</h3>
                    <ol className="space-y-4 list-decimal pl-5">
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Search for Equbs:</span> Use the search bar and filters on your dashboard to find Equbs that match your preferences.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Request to Join:</span> Once you find a suitable Equb, send a request to join by clicking the "Request to Join" button.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Identity Verification:</span> The Equb creator will schedule an in-person meeting to verify your identity and collect your first payment.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Join the Group:</span> Once approved, you'll be added to the group and can view all details in your "My Equbs" tab.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Participate in Cycles:</span> Make your payments according to the Equb schedule and wait for your turn to receive the collected amount.
                      </li>
                    </ol>
                  </div>

                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">Managing Your Participation</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Bell size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Receive Notifications</h4>
                          <p className="text-gray-600">Get notified when you're selected as a winner, when there are announcements, or when your complaints are resolved.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <MessageSquare size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Submit Complaints</h4>
                          <p className="text-gray-600">If you encounter any issues, you can submit a complaint through the "Joined" tab in your "My Equbs" section.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <BarChart size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Rate Equbs</h4>
                          <p className="text-gray-600">After completing an Equb cycle, you can rate your experience to help other users find trustworthy Equbs.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'creator' && (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                  <Award /> For Creators
                </h2>

                <div className="space-y-6">
                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">Creating an Equb</h3>
                    <ol className="space-y-4 list-decimal pl-5">
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Start Creation:</span> Click the "Create Equb" button on your dashboard.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Enter Details:</span> Provide the following information:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Name of the Equb</li>
                          <li>Location</li>
                          <li>Number of participants</li>
                          <li>Amount per person</li>
                          <li>Cycle frequency (weekly, monthly, etc.)</li>
                          <li>Equb type (automatic or special case)</li>
                          <li>Description</li>
                        </ul>
                      </li>
                      <li className="text-gray-700">
                        <span className="font-medium text-indigo-800">Review and Publish:</span> Confirm all details and publish your Equb to make it available for people to join.
                      </li>
                    </ol>
                  </div>

                  <div className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">Managing Your Equb</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Check size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Accept or Reject Requests</h4>
                          <p className="text-gray-600">Review join requests from the "Pending Requests" tab, verify identities in person, and decide whether to accept or reject participants.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Calendar size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Take Attendance</h4>
                          <p className="text-gray-600">Record payments for each cycle using the "Attendance" tab, marking which participants have paid and which haven't.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Award size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Select Winners</h4>
                          <p className="text-gray-600">For special case Equbs, manually select winners for each cycle. For automatic Equbs, start the cycle and let the system select winners.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <Bell size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Make Announcements</h4>
                          <p className="text-gray-600">Communicate important information to all participants through the announcements feature.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-indigo-100 p-2 rounded-full">
                          <AlertTriangle size={18} className="text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-indigo-800">Handle Complaints</h4>
                          <p className="text-gray-600">Address and resolve complaints from participants to maintain trust and transparency in your Equb.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                  <MessageSquare /> Frequently Asked Questions
                </h2>
                
                <div className="space-y-4">
                  {faqData.map(faq => (
                    <motion.div 
                      key={faq.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: faq.id * 0.1 }}
                      className="border border-indigo-100 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="flex justify-between items-center w-full p-4 text-left bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <span className="font-medium text-indigo-800">{faq.question}</span>
                        <ChevronDown 
                          className={`transition-transform ${expandedFaqs.includes(faq.id) ? 'rotate-180' : ''}`} 
                          size={20} 
                        />
                      </button>
                      <AnimatePresence>
                        {expandedFaqs.includes(faq.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white text-gray-700">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

