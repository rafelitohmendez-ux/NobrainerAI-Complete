'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, AlertCircle, Download, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const documentTypes = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'freelance-agreement', label: 'Freelance Agreement' },
  { value: 'property-lease', label: 'Property Lease Agreement' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'proposal', label: 'Business Proposal' }
];

const DocumentGenerator = () => {
  const [docType, setDocType] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generateDocument = async () => {
    if (!docType || !details) {
      setErrorMessage('Please select document type and provide details');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'AIzaSyAVatQQ5qhcrb0mFWb31RnEjZ_wxBJ9szU',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional ${docType} with these details: ${details}. 
                     Format it as a proper legal/business document with appropriate sections, 
                     clauses, and formatting. Include all necessary components for a ${docType}.`
            }]
          }]
        })
      });

      const data = await response.json();
      setGeneratedDoc(data.candidates[0].content.parts[0].text);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to generate document. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showSuccess && (
        <Alert className="fixed top-4 right-4 z-50 bg-indigo-900/10 border-indigo-700">
          <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Document generated successfully.</AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert variant="destructive" className="fixed top-4 right-4 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            ✨ AI-Powered Documents
          </Badge>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
            Generate Professional Documents
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create customized legal and business documents instantly using AI
          </p>
        </div>

        <Card className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={setDocType}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter document details (e.g., parties involved, terms, dates, amounts...)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="bg-gray-800 border-gray-700 min-h-[150px]"
            />

            <Button
              onClick={generateDocument}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl"
            >
              {loading ? 'Generating...' : 'Generate Document'}
            </Button>
          </CardContent>
        </Card>

        {generatedDoc && (
          <Card className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white">Generated Document</CardTitle>
              <Button onClick={handleDownload} variant="outline" className="bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {generatedDoc}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator;