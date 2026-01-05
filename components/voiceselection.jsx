'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Predefined ElevenLabs voices with audio samples
const ELEVENLABS_VOICES = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Professional male voice',
    audioSrc: '/adam.mp3',
    provider: '11labs'
  },
  {
    id: 'pqHfZKP75CvOlQylNhV4',
    name: 'Bill',
    description: 'Professional male voice',
    audioSrc: '/bill.mp3',
    provider: '11labs'
  },
  {
    id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    description: 'Warm female voice',
    audioSrc: '/jessica.mp3',
    provider: '11labs'
  },
  {
    id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    description: 'Authoritative male voice',
    audioSrc: '/laura.mp3',
    provider: '11labs'
  }
];

const VoiceSelectorComponent = ({ onVoiceSelect }) => {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingVoice, setPlayingVoice] = useState(null);
  const audioRefs = useRef({});

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    onVoiceSelect({
      provider: voice.provider,
      voiceId: voice.id
    });
  };

  const togglePlay = (voiceId) => {
    // Stop any currently playing audio
    Object.keys(audioRefs.current).forEach(key => {
      if (key !== voiceId && audioRefs.current[key]) {
        audioRefs.current[key].pause();
        audioRefs.current[key].currentTime = 0;
      }
    });

    const audioElement = audioRefs.current[voiceId];
    
    if (playingVoice === voiceId) {
      // If already playing, pause
      audioElement.pause();
      setPlayingVoice(null);
    } else {
      // Play the selected voice audio
      audioElement.play();
      setPlayingVoice(voiceId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-gray-200 text-sm font-medium">Select Voice</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {ELEVENLABS_VOICES.map((voice) => (
          <motion.div 
            key={voice.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`
                ${selectedVoice?.id === voice.id 
                  ? 'border-green-400 bg-green-900/30' 
                  : 'border-gray-700 hover:border-blue-400'
                } 
                cursor-pointer transition-all duration-300
              `}
              onClick={() => handleVoiceSelect(voice)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex justify-between items-center">
                  {voice.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(voice.id);
                    }}
                    className="text-white hover:bg-blue-500/30"
                  >
                    {playingVoice === voice.id ? <Pause /> : <Play />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 text-sm">
                {voice.description}
              </CardContent>
              
              {/* Hidden audio elements for playback */}
              <audio 
                ref={(el) => audioRefs.current[voice.id] = el}
                src={voice.audioSrc}
                onEnded={() => setPlayingVoice(null)}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelectorComponent;