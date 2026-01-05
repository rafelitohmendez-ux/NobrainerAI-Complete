"use client";
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function BusinessLetter() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyPhone: '',
    companyEmail: '',
    recipientName: '',
    recipientCompany: '',
    recipientAddress: '',
    recipientCity: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    greeting: 'Dear',
    body: '',
    closing: 'Sincerely,',
    senderName: '',
    senderTitle: ''
  });

  const documentRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => documentRef.current,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-500" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Business Letter Template</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Enter Your Details</h2>
              
              <form className="space-y-6">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Sender Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City, State, ZIP</label>
                      <input
                        type="text"
                        name="companyCity"
                        value={formData.companyCity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Recipient Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
                      <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        name="recipientCompany"
                        value={formData.recipientCompany}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="recipientAddress"
                        value={formData.recipientAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City, State, ZIP</label>
                      <input
                        type="text"
                        name="recipientCity"
                        value={formData.recipientCity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Letter Content</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Greeting</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <select
                          name="greeting"
                          value={formData.greeting}
                          onChange={handleChange}
                          className="block w-1/3 border border-gray-300 rounded-l-md shadow-sm p-2"
                        >
                          <option value="Dear">Dear</option>
                          <option value="To">To</option>
                          <option value="Hello">Hello</option>
                          <option value="Hi">Hi</option>
                        </select>
                        <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                          {formData.recipientName || '[Recipient],'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Body</label>
                      <textarea
                        name="body"
                        rows="6"
                        value={formData.body}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Closing</label>
                      <select
                        name="closing"
                        value={formData.closing}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="Sincerely,">Sincerely,</option>
                        <option value="Best regards,">Best regards,</option>
                        <option value="Kind regards,">Kind regards,</option>
                        <option value="Yours truly,">Yours truly,</option>
                        <option value="Respectfully,">Respectfully,</option>
                        <option value="Thank you,">Thank you,</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                          type="text"
                          name="senderName"
                          value={formData.senderName}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Your Title</label>
                        <input
                          type="text"
                          name="senderTitle"
                          value={formData.senderTitle}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
                <div ref={documentRef} className="w-full bg-white border border-gray-200 p-6 min-h-screen shadow-md">
                  <div className="mb-8">
                    <div className="text-2xl font-bold text-blue-800">
                      {formData.companyName || "Your Company Name"}
                    </div>
                    <div className="text-gray-600">
                      {formData.companyAddress && `${formData.companyAddress}, `}
                      {formData.companyCity || "City, State ZIP"}
                    </div>
                    <div className="text-gray-600">
                      {formData.companyPhone && `Phone: ${formData.companyPhone}`}
                      {formData.companyPhone && formData.companyEmail && " | "}
                      {formData.companyEmail && `Email: ${formData.companyEmail}`}
                    </div>
                  </div>
                  
                  <div className="mb-6 text-sm">
                    <div>{formData.date && new Date(formData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div className="mt-6">
                      <div>{formData.recipientName || "Recipient Name"}</div>
                      {formData.recipientCompany && <div>{formData.recipientCompany}</div>}
                      <div>{formData.recipientAddress || "Street Address"}</div>
                      <div>{formData.recipientCity || "City, State ZIP"}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-bold">Subject: {formData.subject || "Your Subject Here"}</div>
                  </div>
                  
                  <div className="mb-4">
                    <p>{formData.greeting} {formData.recipientName || "Recipient"},</p>
                  </div>
                  
                  <div className="mb-6 whitespace-pre-line">
                    {formData.body || "Your letter content will appear here. Enter your message in the form to see it reflected in this preview."}
                  </div>
                  
                  <div>
                    <p>{formData.closing}</p>
                    <div className="mt-8">
                      <div className="font-semibold">{formData.senderName || "Your Name"}</div>
                      {formData.senderTitle && <div>{formData.senderTitle}</div>}
                      <div>{formData.companyName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Document
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
