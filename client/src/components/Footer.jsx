import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  // Content for modal popups
  const legalContent = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            We respect your privacy. Your personal information will only be used for
            managing your Equb participation, notifications, and security purposes.
          </p>
          <p>
            We never share your data with third parties without your consent, and all data is securely stored in accordance with best practices.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            By using the Equb platform, you agree to our community guidelines, provide accurate information, and comply with local laws regarding Equb participation.
          </p>
          <p>
            The platform reserves the right to remove fraudulent groups or users at any time.
          </p>
        </div>
      ),
    },
    security: {
      title: "Security",
      body: (
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            We use secure authentication and encrypted data storage. Physical verification is required for joining Equbs to prevent fraud.
          </p>
          <p>
            Please report any suspicious activity using the complaint system.
          </p>
        </div>
      ),
    },
  };

  // Updated About text per document
  const aboutText = (
    <div className="text-gray-600 text-sm space-y-2">
      <p>
        <strong>Equb Platform</strong> is a modern, secure, and automated solution for managing traditional Ethiopian Equb (rotating savings and credit associations) digitally.
      </p>
      <p>
        Easily <strong>create</strong> or <strong>join</strong> Equb groups, manage participation, automate lotteries and cycles, and receive notifications, all while ensuring physical verification for trust and safety.
      </p>
      <p>
        Both website and mobile app (Flutter) are supported for your convenience.
      </p>
    </div>
  );

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            {aboutText}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <button
                  onClick={() => navigate("/help")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  How it Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/signup")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  Find Equbs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/signup")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  Create Equb
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/help")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <button
                  onClick={() => setModal("privacy")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal("terms")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal("security")}
                  className="hover:text-indigo-600 bg-transparent border-none cursor-pointer outline-none focus:underline"
                  tabIndex={0}
                >
                  Security
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a
                  href="mailto:support@equb.com"
                  className="hover:text-indigo-600"
                >
                  support@equb.com
                </a>
              </li>
              <li>
                <a href="tel:+251911123456" className="hover:text-indigo-600">
                  +251 911 123 456
                </a>
              </li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Equb Platform. All rights reserved.
        </div>
      </div>

      {/* Modal popup for legal links */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{legalContent[modal].title}</h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold p-0 m-0 bg-transparent border-none cursor-pointer"
                aria-label="Close"
                tabIndex={0}
              >
                &times;
              </button>
            </div>
            <div>{legalContent[modal].body}</div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                tabIndex={0}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}