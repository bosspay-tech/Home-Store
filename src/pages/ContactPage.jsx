import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react"; // Optional: Install lucide-react for icons

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Vyaapar Vault Private Limited is here to help you secure your
            business future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information Card */}
          <div className="bg-indigo-700 rounded-2xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <p className="text-indigo-100 mb-8">
              Visit our office or reach out to us directly. We'd love to hear
              from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-indigo-300 mt-1" />
                <div>
                  <p className="font-semibold text-lg">Office Address</p>
                  <p className="text-indigo-100">
                    B-1225, Dev Atelier,
                    <br />
                    Anandnagar Cross Road, Satellite,
                    <br />
                    Ahmedabad, Gujarat - 380015
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-indigo-300" />
                <div>
                  <p className="font-semibold text-lg">Call Us</p>
                  <p className="text-indigo-100">+91 9909009479</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 text-indigo-300" />
                <div>
                  <p className="font-semibold text-lg">Business Hours</p>
                  <p className="text-indigo-100">
                    Mon - Sat: 10:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <form className="grid grid-cols-1 gap-y-6">
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-gray-50 border"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-gray-50 border"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  rows="4"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-gray-50 border"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
