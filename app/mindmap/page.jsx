'use client'
import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

// API integration function
const generateMindMapWithGemini = async (prompt) => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': `${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a hierarchical learning path for "${prompt}" in the following format without any code blocks or backticks:
            {
              "name": "${prompt}",
              "children": [
                {
                  "name": "Main Topic 1",
                  "children": [
                    { "name": "Subtopic 1.1" },
                    { "name": "Subtopic 1.2" }
                  ]
                },
                {
                  "name": "Main Topic 2",
                  "children": [
                    { "name": "Subtopic 2.1" },
                    { "name": "Subtopic 2.2" }
                  ]
                }
              ]
            }
            Include 4-5 main topics with 2-3 subtopics each. Focus on practical learning steps.`
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate mind map');
    }

    const data = await response.json();
    // Clean up the response text and extract only the JSON part
    const jsonStr = data.candidates[0].content.parts[0].text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating mind map:', error);
    throw error;
  }
};

const MindMapGenerator = () => {
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = async () => {
    if (!skill.trim()) {
      setErrorMessage('Please enter a skill or goal');
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
      return;
    }

    setLoading(true);
    try {
      const data = await generateMindMapWithGemini(skill);
      setMindMapData(data);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to generate mind map. Please try again.');
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
    setLoading(false);
  };

  // Custom node component
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    // Color palette for different levels of nodes
    const nodeColors = {
      root: '#4f46e5',       // Deep indigo for root
      mainTopic: '#6366f1',  // Bright indigo for main topics
      subTopic: '#818cf8'    // Lighter indigo for subtopics
    };

    // Determine node level and color
    const getNodeColor = (node) => {
      if (!node.parent) return nodeColors.root;
      if (!node.children) return nodeColors.subTopic;
      return nodeColors.mainTopic;
    };

    // Adjust node size based on level
    const getNodeRadius = (node) => {
      if (!node.parent) return 30;  // Larger root
      if (!node.children) return 15; // Smaller subtopics
      return 25;  // Medium size for main topics
    };

    return (
      <g onClick={toggleNode}>
        <circle 
          r={getNodeRadius(nodeDatum)} 
          fill={getNodeColor(nodeDatum)} 
          fillOpacity={0.8}
          stroke="#ffffff"
          strokeWidth={2}
        />
        <text
          fill="white"
          strokeWidth="1"
          x={getNodeRadius(nodeDatum) + 10}
          y={5}
          style={{ 
            fontSize: nodeDatum.parent ? '12px' : '14px', 
            fontWeight: nodeDatum.parent ? 'normal' : 'bold'
          }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showSuccessAlert && (
        <Alert className="fixed top-4 right-4 z-50 bg-indigo-900/10 border-indigo-700">
          <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your mind map has been generated successfully.
          </AlertDescription>
        </Alert>
      )}

      {showErrorAlert && (
        <Alert variant="destructive" className="fixed top-4 right-4 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            ✨ Powered by Gemini AI
          </Badge>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
            Generate Learning Mind Maps
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter any skill, role, or goal you want to achieve, and we'll generate a comprehensive mind map to guide your learning journey.
          </p>
        </div>

        <Card className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Create Your Mind Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Enter a skill, role, or goal (e.g., 'Full Stack Developer', 'Digital Marketing')"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all transform hover:scale-[1.02]"
              >
                {loading ? 'Generating...' : 'Generate Mind Map'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {mindMapData && (
        <Card className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Your Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800 rounded-lg" style={{ height: '700px' }}>
              <Tree
                data={mindMapData}
                orientation="horizontal"
                renderCustomNodeElement={renderCustomNode}
                separation={{ siblings: 3, nonSiblings: 3 }}
                translate={{ x: 250, y: 350 }}
                pathFunc="step"
                nodeSize={{ x: 250, y: 150 }}
                rootNodeClassName="g-node-root"
                branchNodeClassName="g-node-branch"
                leafNodeClassName="g-node-leaf"
              />
            </div>
          </CardContent>
        </Card>
      )}

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Features included:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Interactive Tree View',
              'AI-Powered Generation',
              'Expandable Nodes',
              'Custom Learning Paths'
            ].map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapGenerator;