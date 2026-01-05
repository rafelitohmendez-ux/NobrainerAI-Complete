'use client'
//hygen api = ZTNiMjc2NjgyOTAyNGNmN2FlYjAxZDczYzE5N2JlYTYtMTczMDc0NjQzNA==

import React, { useState, useRef} from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from "@/components/ui/slider";
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Type, Image as ImageIcon, 
  Wand2, Key, Upload, Maximize, Video,
  Check, User, Move, Layout, Eye
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Archivo } from 'next/font/google'

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
})


const supabase = createClient('https://tnijqmtoqpmgdhvltuhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaWpxbXRvcXBtZ2Rodmx0dWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTE3MzcsImV4cCI6MjA0MDY2NzczN30.3c2EqGn5n0jLmG4l2NO_ovN_aIAhaLDBa0EKdwdnhCg');

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const avatars = [
  {
    avatar_id: "nik_expressive_20240910",
    avatar_name: "Nik in Black Shirt",
    gender: "male",
    preview_image_url: "https://files2.heygen.ai/avatar/v3/Nik_Black_3_0_20240910/preview_target.webp"
  },
  {
    avatar_id: "nik_blue_expressive_20240910",
    avatar_name: "Nik in Blue Sweater",
    gender: "male",
    preview_image_url: "https://files2.heygen.ai/avatar/v3/Nik_Blue_3_0_20240910/preview_target.webp"
  },
  {
    avatar_id: "francis_expressive_20240910",
    avatar_name: "Francis in Blazer (Upper Body)",
    gender: "male",
    preview_image_url: "https://files2.heygen.ai/avatar/v3/Francis_in_Blazer_Front_3_0_20240910/preview_target.webp"
  }
];

const HeyGenVideoCreator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultVideo, setResultVideo] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [backgroundType, setBackgroundType] = useState('color');
  const [backgroundColor, setBackgroundColor] = useState('#f6f6fc');
  const [backgroundAssetId, setBackgroundAssetId] = useState('');
  const [voiceId, setVoiceId] = useState('ff2ecc8fbdef4273a28bed7b5e35bb57');
  const [customWidth, setCustomWidth] = useState('1280');
  const [customHeight, setCustomHeight] = useState('720');
  const fileInputRef = useRef(null);
  const [backgroundPlayStyle, setBackgroundPlayStyle] = useState('loop');
  const [resolutionPreset, setResolutionPreset] = useState('standard');
  // New state for avatar positioning and style
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [avatarStyle, setAvatarStyle] = useState('normal');
  const [avatarScale, setAvatarScale] = useState(1.0);
  const [videoId, setVideoId] = useState(null);

  const { user } = useUser();
  

  const [videoFormat, setVideoFormat] = useState('youtube'); // 'youtube' or 'reel'
  
  // Format-specific dimensions
  const resolutionPresets = {
    standard: {
      youtube: { width: '854', height: '480' },
      reel: { width: '720', height: '1280' }
    },
    hd: {
      youtube: { width: '1280', height: '720' },
      reel: { width: '1080', height: '1920' }
    },
    '4k': {
      youtube: { width: '3840', height: '2160' },
      reel: { width: '2160', height: '3840' }
    }
  };

  // Handle resolution preset change
  const handleResolutionChange = (preset) => {
    setResolutionPreset(preset);
    const dimensions = resolutionPresets[preset][videoFormat];
    setCustomWidth(dimensions.width);
    setCustomHeight(dimensions.height);
  };

  // Handle format change with current resolution preset
  const handleFormatChange = (format) => {
    setVideoFormat(format);
    const dimensions = resolutionPresets[resolutionPreset][format];
    setCustomWidth(dimensions.width);
    setCustomHeight(dimensions.height);
  };

  

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !apiKey) return;

    setUploadLoading(true);
    setError('');

    try {
      // Determine content type based on file type
      let contentType;
      if (file.type.startsWith('image/')) {
        contentType = file.type;
      } else if (file.type.startsWith('video/')) {
        contentType = file.type;
      } else {
        throw new Error('Unsupported file type');
      }

      const response = await fetch('https://upload.heygen.com/v1/asset', {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'X-Api-Key': apiKey
        },
        body: file
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      console.log(data.data.id)
      setBackgroundAssetId(data.data.id);
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };

 

  const createVideo = async () => {
    if (!apiKey) {
      setError('Please enter your HeyGen API key');
      return;
    }
  
    if (!script) {
      setError('Please enter a script');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      let background;
      switch (backgroundType) {
        case 'color':
          background = {
            type: 'color',
            value: backgroundColor
          };
          break;
        case 'image':
          if (!backgroundAssetId) {
            throw new Error('Please upload an image first');
          }
          background = {
            type: 'image',
            image_asset_id: backgroundAssetId
          };
          break;
        case 'video':
          if (!backgroundAssetId) {
            throw new Error('Please upload a video first');
          }
          background = {
            type: 'video',
            video_asset_id: backgroundAssetId,
            play_style: backgroundPlayStyle
          };
          break;
      }
  
      const videoConfig = {
        caption: true,
        dimension: {
          width: parseInt(customWidth),
          height: parseInt(customHeight)
        },
        video_inputs: [{
          character: {
            type: "avatar",
            avatar_id: selectedAvatar.avatar_id,
            scale: avatarScale,
            avatar_style: avatarStyle,
            offset: {
              x: avatarOffsetX,
              y: avatarOffsetY
            }
          },
          voice: {
            type: "text",
            voice_id: voiceId,
            input_text: script,
            speed: 1.0,
            pitch: 0
          },
          background
        }]
      };
  
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        },
        body: JSON.stringify(videoConfig)
      });
  
      const data = await response.json();
      console.log(data);
  
      if (data.data?.error?.code === 401029) {
        console.log(data);
        setError('Your current plan does not support this resolution. Please select a lower resolution or upgrade your plan.');
        handleResolutionChange('standard');
        setLoading(false);
        return;
      }
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create video');
      }
  
      // Store the video ID
      const videoId = data.data.video_id;
      setVideoId(videoId);
  
      // Start polling for video status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
            headers: {
              'Accept': 'application/json',
              'X-Api-Key': apiKey
            }
          });
  
          if (!statusResponse.ok) {
            throw new Error('Failed to fetch video status');
          }
  
          const statusData = await statusResponse.json();
          const { status, video_url } = statusData.data;
  
          console.log('Video status:', status);
  
          if (status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);
            setResultVideo(video_url);
    
          if (error) {
            console.error('Error saving video to Supabase:', error);
            return;
          }

          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setError('Video generation failed');
          }
          // Continue polling if status is 'processing'
        } catch (err) {
          console.error('Status check error:', err);
          clearInterval(pollInterval);
          setLoading(false);
          setError('Failed to check video status');
        }
      }, 5000); // Check every 5 seconds
  
      // Clean up interval if component unmounts
      return () => clearInterval(pollInterval);
  
    } catch (err) {
      console.error('Create Video Error:', err);
      setError(err.message || 'Failed to create video');
      setLoading(false);
    }
  };

  const canProceedToStep2 = apiKey && selectedAvatar;
  const canProceedToStep3 = script.length > 0;
  const canGenerate = backgroundType === 'color' || (backgroundType !== 'color' && backgroundAssetId);

  const StepIndicator = ({ number, title, active, completed }) => (
    <div className={`flex items-center ${active ? 'text-indigo-400' : 'text-gray-400'}`}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center mr-2
        ${active ? 'bg-indigo-900/50 text-indigo-300 border-2 border-indigo-700' : 
          completed ? 'bg-green-900/50 border-2 border-green-700' : 'bg-gray-800'}
      `}>
        {completed ? <Check className="w-5 h-5" /> : number}
      </div>
      <span className="font-medium">{title}</span>
    </div>
  );

 
  
  const AvatarPreview = ({ offsetX, offsetY, scale, avatarStyle, avatarUrl }) => {
    const containerStyle = {
      aspectRatio: videoFormat === 'youtube' ? '16/9' : '9/16',
      position: 'relative',
      overflow: 'hidden',
      margin: 'auto',
      borderRadius: '0.5rem',
      height: videoFormat === 'youtube' ? '225px' : '400px',
    };
  
    const xPosition = ((offsetX + 1) / 2) * 100;
    const yPosition = ((offsetY + 1) / 2) * 100;
    const avatarSize = scale * 40;
  
    return (
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl">
        <div style={containerStyle}>
          {/* Guide lines */}
          <div className="absolute left-1/2 h-full w-px bg-gray-700/20" />
          <div className="absolute top-1/2 w-full h-px bg-gray-700/20" />
          
          <div style={{
            position: 'absolute',
            left: `${xPosition}%`,
            top: `${yPosition}%`,
            transform: 'translate(-50%, -50%)',
            width: `${avatarSize}%`,
            height: `${avatarSize}%`,
          }}>
            <img 
              src={avatarUrl} 
              alt="Avatar Preview"
              className={`w-full h-full object-cover transition-all ${
                avatarStyle === 'circle' ? 'rounded-full' : 
                avatarStyle === 'closeUp' ? 'scale-150' : 'rounded-lg'
              }`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    
      <div className={` min-h-screen bg-gray-950 relative overflow-hidden pt-8`}>
      <div className="text-center mb-12">
        <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
          ✨ Build Your Custom UGC videos
        </Badge>
        <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4 `}>
          Create and Publish your AI UGC videos
        </h1>
        <p className={`text-gray-400 max-w-2xl mx-auto `}>
          Fill all the inputs and get started to create your AI generated UGC Vidoes
        </p>
      </div>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto relative px-4 border border-black/10"
    >
       <Card className="border-gray-800 bg-gray-900 shadow-2xl">
       
        <CardContent className="space-y-8 p-8">
          {/* Steps Indicator */}
          <div className="flex justify-between mb-8 px-4">
              <StepIndicator 
                number={1} 
                title="API Key & Avatar" 
                active={currentStep === 1} 
                completed={currentStep > 1}
              />
              <StepIndicator 
                number={2} 
                title="Script & Position" 
                active={currentStep === 2} 
                completed={currentStep > 2}
              />
              <StepIndicator 
                number={3} 
                title="Background & Generate" 
                active={currentStep === 3} 
                completed={false}
              />
            </div>

          {/* Step 1: API Key & Avatar Selection */}
          {currentStep === 1 && (
            <motion.div
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg ">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <Key className="w-4 h-4" />
                  HeyGen API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white border-black/20 text-black"
                  placeholder="Enter your API key"
                />
              </div>

              <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <Layout className="w-4 h-4" />
                  Video Format & Resolution
                </label>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Button
                    onClick={() => handleFormatChange('youtube')}
                    variant={videoFormat === 'youtube' ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      videoFormat === 'youtube' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'bg-white hover:bg-black/5 border-black/20'
                    }`}
                  >
                    <div className="w-16 h-9 bg-black/10 rounded" />
                    <span>YouTube (16:9)</span>
                  </Button>
                  <Button
                    onClick={() => handleFormatChange('reel')}
                    variant={videoFormat === 'reel' ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      videoFormat === 'reel' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'bg-white hover:bg-black/5 border-black/20'
                    }`}
                  >
                    <div className="w-9 h-16 bg-black/10 rounded" />
                    <span>Reel (9:16)</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <label className="text-sm text-black/60 mb-2 block">Resolution</label>
                  <Select
                    value={resolutionPreset}
                    onValueChange={handleResolutionChange}
                  >
                    <SelectTrigger className="bg-white border-black/20 text-black">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard ({resolutionPresets.standard[videoFormat].width}x{resolutionPresets.standard[videoFormat].height})
                      </SelectItem>
                      <SelectItem value="hd">
                        HD ({resolutionPresets.hd[videoFormat].width}x{resolutionPresets.hd[videoFormat].height})
                      </SelectItem>
                      <SelectItem value="4k">
                        4K ({resolutionPresets['4k'][videoFormat].width}x{resolutionPresets['4k'][videoFormat].height})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {resolutionPreset !== 'standard' && (
                  <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Higher resolutions may require a premium plan. If generation fails, try using Standard resolution.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className=" p-6 rounded-lg  bg-gradient-to-r from-indigo-400 to-purple-300">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <User className="w-4 h-4" />
                  Select Avatar
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.avatar_id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`
                        cursor-pointer rounded-lg p-2 transition-all
                        ${selectedAvatar?.avatar_id === avatar.avatar_id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'bg-white border-black/20 hover:bg-black/5'
                        }
                        border-2
                      `}
                    >
                      <img
                        src={avatar.preview_image_url}
                        alt={avatar.avatar_name}
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                      <p className="text-black text-sm text-center">{avatar.avatar_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                className="w-full bg-gradient-to-r from-indigo-800 to-purple-900 text-white py-3 px-6 rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 transform hover:scale-[1.02]"
              >
                Continue to Script
              </Button>
            </motion.div>
          )}

          {/* Step 2: Script */}
          {currentStep === 2 && (
            <motion.div
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <Type className="w-4 h-4" />
                  Video Script
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={6}
                  className="bg-white border-black/20 text-black"
                  placeholder="Enter your video script here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                    <Move className="w-4 h-4" />
                    Avatar Position
                  </label>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-black/60 mb-2 block">Horizontal Position (X)</label>
                      <Slider
                        value={[avatarOffsetX]}
                        onValueChange={(values) => setAvatarOffsetX(values[0])}
                        min={-1}
                        max={1}
                        step={0.1}
                        className="mb-4"
                      />
                      <div className="text-black/50 text-xs text-center">
                        Value: {avatarOffsetX.toFixed(1)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-black/60 mb-2 block">Vertical Position (Y)</label>
                      <Slider
                        value={[avatarOffsetY]}
                        onValueChange={(values) => setAvatarOffsetY(values[0])}
                        min={-1}
                        max={1}
                        step={0.1}
                        className="mb-4"
                      />
                      <div className="text-black/50 text-xs text-center">
                        Value: {avatarOffsetY.toFixed(1)}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-black/60 mb-2 block">Avatar Scale</label>
                      <Slider
                        value={[avatarScale]}
                        onValueChange={(values) => setAvatarScale(values[0])}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mb-4"
                      />
                      <div className="text-black/50 text-xs text-center">
                        Scale: {avatarScale.toFixed(1)}x
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-black/60 mb-2 block">
                        <Layout className="w-4 h-4 inline mr-2" />
                        Avatar Style
                      </label>
                      <Select
                        value={avatarStyle}
                        onValueChange={setAvatarStyle}
                      >
                        <SelectTrigger className="bg-white border-black/20 text-black">
                          <SelectValue placeholder="Select avatar style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="closeUp">Close Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                    <Eye className="w-4 h-4" />
                    Preview
                  </label>
                  <AvatarPreview
                    offsetX={avatarOffsetX}
                    offsetY={avatarOffsetY}
                    scale={avatarScale}
                    avatarStyle={avatarStyle}
                    avatarUrl={selectedAvatar?.preview_image_url}
                  />
                  <div className="mt-2 text-black/50 text-xs text-center">
                    Preview shows approximate positioning. Final video may vary slightly.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="w-1/2 h-12 bg-white hover:bg-black/5 text-black border border-black/20"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="w-1/2 h-12 bg-gradient-to-r from-indigo-800 to-purple-900 hover:bg-purple-700 text-white"
                >
                  Continue to Background
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Background & Generate */}
          {currentStep === 3 && (
            <motion.div
              variants={fadeIn}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-400 to-purple-300 p-6 rounded-lg">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <ImageIcon className="w-4 h-4" />
                  Background Settings
                </label>
                
                <div className="space-y-4">
                  <Select
                    value={backgroundType}
                    onValueChange={setBackgroundType}
                  >
                    <SelectTrigger className="bg-white border-black/20 text-black">
                      <SelectValue placeholder="Select background type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>

                  {backgroundType === 'color' && (
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 bg-white border-black/20"
                    />
                  )}

                  {(backgroundType === 'image' || backgroundType === 'video') && (
                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept={backgroundType === 'image' ? "image/*" : "video/*"}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="w-full bg-white hover:bg-black/5 text-black border border-black/20"
                      >
                        {uploadLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload {backgroundType === 'image' ? 'Image' : 'Video'}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-1/2 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={createVideo} 
                  disabled={loading || !canGenerate}
                  className="w-1/2 h-12 bg-gradient-to-r from-indigo-800 to-purple-900 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-[#4361EE]" />
                </div>
              )}

              {resultVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <video 
                    controls 
                    className="w-full rounded-lg border border-gray-200"
                    src={resultVideo}
                  >
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  </div>
  </>
  );
};

export default HeyGenVideoCreator;