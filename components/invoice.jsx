"use client";
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Plus, Trash2 } from 'lucide-react';

export default function Invoice() {
  const [invoice, setInvoice] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientCity: '',
    clientEmail: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    terms: 'Payment is due within 30 days.',
    taxRate: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  });

  const [logoPreview, setLogoPreview] = useState(null);
  
  const documentRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => documentRef.current,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    
    newItems[index][field] = value;
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newItems[index].quantity) || 0;
      const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = quantity * rate;
    }
    
    // Calculate totals
    const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const taxAmount = subtotal * (parseFloat(invoice.taxRate) / 100);
    const total = subtotal + taxAmount;

    setInvoice(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      tax: taxAmount,
      total
    }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = [...invoice.items];
    if (newItems.length > 1) {
      newItems.splice(index, 1);
      
      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const taxAmount = subtotal * (parseFloat(invoice.taxRate) / 100);
      const total = subtotal + taxAmount;

      setInvoice(prev => ({
        ...prev,
        items: newItems,
        subtotal,
        tax: taxAmount,
        total
      }));
    }
  };

  const handleTaxRateChange = (e) => {
    const taxRate = parseFloat(e.target.value) || 0;
    const taxAmount = invoice.subtotal * (taxRate / 100);
    const total = invoice.subtotal + taxAmount;

    setInvoice(prev => ({
      ...prev,
      taxRate,
      tax: taxAmount,
      total
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-500" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Template</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Enter Invoice Details</h2>
              
              <form className="space-y-6">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Your Business Information</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="mt-1 block w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={invoice.companyName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        name="companyPhone"
                        value={invoice.companyPhone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={invoice.companyAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={invoice.companyEmail}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City, State, ZIP</label>
                      <input
                        type="text"
                        name="companyCity"
                        value={invoice.companyCity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <input
                        type="text"
                        name="companyWebsite"
                        value={invoice.companyWebsite}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Client Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Client Name</label>
                      <input
                        type="text"
                        name="clientName"
                        value={invoice.clientName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        name="clientCompany"
                        value={invoice.clientCompany}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="clientAddress"
                        value={invoice.clientAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={invoice.clientEmail}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City, State, ZIP</label>
                      <input
                        type="text"
                        name="clientCity"
                        value={invoice.clientCity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Invoice Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                      <input
                        type="text"
                        name="invoiceNumber"
                        value={invoice.invoiceNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={invoice.dueDate}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Items</h3>
                  {invoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-5 mb-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rate</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                          type="text"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Tax Rate</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                      <input
                        type="number"
                        name="taxRate"
                        value={invoice.taxRate}
                        onChange={handleTaxRateChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Notes & Terms</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        name="notes"
                        rows="3"
                        value={invoice.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Terms</label>
                      <textarea
                        name="terms"
                        rows="3"
                        value={invoice.terms}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
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
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      {logoPreview && (
                        <img src={logoPreview} alt="Company Logo" className="h-16" />
                      )}
                      <div className="text-2xl font-bold text-blue-800">
                        {invoice.companyName || "Your Company Name"}
                      </div>
                      <div className="text-gray-600">
                        {invoice.companyAddress && `${invoice.companyAddress}, `}
                        {invoice.companyCity || "City, State ZIP"}
                      </div>
                      <div className="text-gray-600">
                        {invoice.companyPhone && `Phone: ${invoice.companyPhone}`}
                        {invoice.companyPhone && invoice.companyEmail && " | "}
                        {invoice.companyEmail && `Email: ${invoice.companyEmail}`}
                      </div>
                      {invoice.companyWebsite && (
                        <div className="text-gray-600">
                          Website: {invoice.companyWebsite}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">INVOICE</div>
                      <div className="text-gray-600">
                        Invoice #: {invoice.invoiceNumber || "0001"}
                      </div>
                      <div className="text-gray-600">
                        Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      {invoice.dueDate && (
                        <div className="text-gray-600">
                          Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Bill To:</div>
                      <div className="text-gray-600">
                        <div>{invoice.clientName || "Client Name"}</div>
                        {invoice.clientCompany && <div>{invoice.clientCompany}</div>}
                        <div>{invoice.clientAddress || "Street Address"}</div>
                        <div>{invoice.clientCity || "City, State ZIP"}</div>
                        {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
                      </div>
                    </div>
                  </div>
                  
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Quantity</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="text-right py-2">{item.quantity}</td>
                          <td className="text-right py-2">${item.rate.toFixed(2)}</td>
                          <td className="text-right py-2">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end">
                    <div className="w-1/3">
                      <div className="flex justify-between py-2">
                        <span className="font-medium">Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="font-medium">Tax ({invoice.taxRate}%):</span>
                        <span>${invoice.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold">${invoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    {invoice.notes && (
                      <div className="text-sm text-gray-600 mb-4">
                        <div className="font-medium">Notes:</div>
                        <div>{invoice.notes}</div>
                      </div>
                    )}
                    {invoice.terms && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">Terms:</div>
                        <div>{invoice.terms}</div>
                      </div>
                    )}
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
                    