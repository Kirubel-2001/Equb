import React from "react";

export default function Footer() {
  return (
    /* Footer */
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-gray-600 text-sm">
              Modern platform for managing traditional Ethiopian Equb systems
              digitally.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-600">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Find Groups
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Create Equb
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>support@equb.com</li>
              <li>+251 911 123 456</li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Equb Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
