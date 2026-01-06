'use client'

import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle, Mic, Loader2, Volume2, Plus, Trash2, Download, Clock, ChevronDown } from 'lucide-react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VOICE_MODELS = [
  {
    name: 'Asteria',
    value: 'aura-asteria-en',
    gender: 'Female',
    accent: 'English (US)',
    previewAudio: '/asteria.wav'
  },
  {
    name: 'Luna',
    value: 'aura-luna-en',
    gender: 'Female',
    accent: 'English (US)',
    previewAudio: '/luna.wav'
  },
  {
    name: 'Stella',
    value: 'aura-stella-en',
    gender: 'Female',
    accent: 'English (US)',
    previewAudio: '/stella.wav'
  },
  {
    name: 'Athena',
    value: 'aura-athena-en',
    gender: 'Female',
    accent: 'English (UK)',
    previewAudio: '/athena.wav'
  },
  {
    name: 'Hera',
    value: 'aura-hera-en',
    gender: 'Female',
    accent: 'English (US)',
    previewAudio: '/hera.wav'
  },
  {
    name: 'Orion',
    value: 'aura-orion-en',
    gender: 'Male',
    accent: 'English (US)',
    previewAudio: '/orion.wav'
  }
];

export default function PodcastGeneratorPage() {
  // Podcast settings
  const [podcastTitle, setPodcastTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  
  // Character management
  const [characters, setCharacters] = useState([
    { id: 1, name: 'Host', voice: VOICE_MODELS[0], color: '#6366f1' }
  ]);
  const [nextCharacterId, setNextCharacterId] = useState(2);
  
  // Script management
  const [scriptLines, setScriptLines] = useState([
    { id: 1, characterId: 1, text: '', isGenerating: false, audioUrl: null }
  ]);
  const [nextLineId, setNextLineId] = useState(2);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [fullEpisodeAudio, setFullEpisodeAudio] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs
  const audioRefs = useRef({});
  const fullAudioRef = useRef(null);

  // Generate audio for a single line
  const generateLineAudio = async (lineId, text, voiceModel) => {
    try {
      // Check text length
      if (text.length > 2000) {
        throw new Error('Text exceeds 2000 character limit');
      }
  
      const response = await axios.post(
        `https://api.deepgram.com/v1/speak?model=${voiceModel}`,
        { text },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`
          },
          responseType: 'blob'
        }
      );
  
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Audio generation error:', error.response ? error.response.data : error);
      throw new Error(error.response?.data?.message || 'Failed to generate audio');
    }
  };
  
  // Handle adding a new character
  const addCharacter = () => {
    // Find a voice that hasn't been used yet, or default to the first one
    const usedVoices = characters.map(c => c.voice.value);
    const availableVoice = VOICE_MODELS.find(v => !usedVoices.includes(v.value)) || VOICE_MODELS[0];
    
    // Generate a random color
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    setCharacters([
      ...characters,
      { 
        id: nextCharacterId, 
        name: `Character ${nextCharacterId}`, 
        voice: availableVoice,
        color: randomColor
      }
    ]);
    setNextCharacterId(nextCharacterId + 1);
  };
  
  // Handle removing a character
  const removeCharacter = (id) => {
    // Don't allow removing if only one character remains
    if (characters.length <= 1) {
      setError("You must have at least one character");
      return;
    }
    
    // Remove the character
    setCharacters(characters.filter(c => c.id !== id));
    
    // Update any script lines that used this character to use the first character
    const defaultCharId = characters[0].id;
    setScriptLines(scriptLines.map(line => 
      line.characterId === id ? {...line, characterId: defaultCharId} : line
    ));
  };
  
  // Handle updating character details
  const updateCharacter = (id, field, value) => {
    setCharacters(characters.map(char => 
      char.id === id ? {...char, [field]: value} : char
    ));
  };
  
  // Handle updating voice model for a character
  const updateCharacterVoice = (id, voiceModel) => {
    const selectedVoice = VOICE_MODELS.find(v => v.value === voiceModel);
    setCharacters(characters.map(char => 
      char.id === id ? {...char, voice: selectedVoice} : char
    ));
  };
  
  // Handle adding a new script line
  const addScriptLine = (afterId = null) => {
    const newLine = { 
      id: nextLineId, 
      characterId: characters[0].id, 
      text: '',
      isGenerating: false,
      audioUrl: null
    };
    
    if (afterId) {
      // Insert after the specified line
      const index = scriptLines.findIndex(line => line.id === afterId);
      if (index !== -1) {
        const newLines = [...scriptLines];
        newLines.splice(index + 1, 0, newLine);
        setScriptLines(newLines);
      }
    } else {
      // Add to the end
      setScriptLines([...scriptLines, newLine]);
    }
    
    setNextLineId(nextLineId + 1);
  };
  
  // Handle removing a script line
  const removeScriptLine = (id) => {
    // Don't allow removing if it's the last line
    if (scriptLines.length <= 1) {
      setError("You must have at least one script line");
      return;
    }
    
    // Clean up any audio URL for this line
    const lineToRemove = scriptLines.find(line => line.id === id);
    if (lineToRemove && lineToRemove.audioUrl) {
      URL.revokeObjectURL(lineToRemove.audioUrl);
    }
    
    setScriptLines(scriptLines.filter(line => line.id !== id));
  };
  
  // Handle updating script line text
  const updateScriptLine = (id, field, value) => {
    setScriptLines(scriptLines.map(line => 
      line.id === id ? {...line, [field]: value} : line
    ));
  };
  
  // Generate audio for a single line
  const handleGenerateLine = async (lineId) => {
    const line = scriptLines.find(l => l.id === lineId);
    if (!line || !line.text.trim()) return;
    
    const character = characters.find(c => c.id === line.characterId);
    if (!character) return;
    
    // Clean up previous audio URL if it exists
    if (line.audioUrl) {
      URL.revokeObjectURL(line.audioUrl);
    }
    
    // Update line status to generating
    setScriptLines(scriptLines.map(l => 
      l.id === lineId ? {...l, isGenerating: true, audioUrl: null} : l
    ));
    
    try {
      const audioUrl = await generateLineAudio(lineId, line.text, character.voice.value);
      
      // Update line with new audio URL
      setScriptLines(scriptLines.map(l => 
        l.id === lineId ? {...l, isGenerating: false, audioUrl} : l
      ));
    } catch (err) {
      setError(err.message);
      setScriptLines(scriptLines.map(l => 
        l.id === lineId ? {...l, isGenerating: false} : l
      ));
    }
  };
  
  // Generate audio for all lines
  const handleGenerateAll = async () => {
    setError(null);
    setIsGeneratingFull(true);
    
    try {
      // Generate audio for each line that doesn't have audio yet
      for (const line of scriptLines) {
        if (!line.audioUrl && line.text.trim()) {
          const character = characters.find(c => c.id === line.characterId);
          if (character) {
            // Update line status to generating
            setScriptLines(prevLines => prevLines.map(l => 
              l.id === line.id ? {...l, isGenerating: true} : l
            ));
            
            const audioUrl = await generateLineAudio(line.id, line.text, character.voice.value);
            
            // Update line with new audio URL
            setScriptLines(prevLines => prevLines.map(l => 
              l.id === line.id ? {...l, isGenerating: false, audioUrl} : l
            ));
          }
        }
      }
      
      // Now combine all the audio (in a real app, this would need server-side processing)
      // Here we'll simulate by creating a playlist functionality
      setFullEpisodeAudio("combined");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingFull(false);
    }
  };
  
  // Play audio for a single line
  const playLineAudio = (lineId) => {
    // Stop any currently playing audio
    if (currentPlayingIndex !== null) {
      const currentLine = scriptLines.find(l => l.id === currentPlayingIndex);
      if (currentLine && audioRefs.current[currentLine.id]) {
        audioRefs.current[currentLine.id].pause();
      }
    }
    
    // Play the selected line
    const line = scriptLines.find(l => l.id === lineId);
    if (line && line.audioUrl && audioRefs.current[lineId]) {
      audioRefs.current[lineId].volume = volume;
      audioRefs.current[lineId].play();
      setCurrentPlayingIndex(lineId);
      setIsPlaying(true);
    }
  };
  
  // Play all audio sequentially
  const playFullEpisode = () => {
    if (isPlaying) {
      // Pause all audio
      scriptLines.forEach(line => {
        if (audioRefs.current[line.id]) {
          audioRefs.current[line.id].pause();
        }
      });
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
      return;
    }
    
    // Find the first line with audio
    const firstLineWithAudio = scriptLines.find(line => line.audioUrl);
    if (firstLineWithAudio) {
      playLineAudio(firstLineWithAudio.id);
    }
  };
  
  // Handle when a line's audio ends
  const handleLineAudioEnded = (lineId) => {
    // Find the next line with audio
    const currentIndex = scriptLines.findIndex(line => line.id === lineId);
    if (currentIndex < scriptLines.length - 1) {
      const nextLines = scriptLines.slice(currentIndex + 1);
      const nextLineWithAudio = nextLines.find(line => line.audioUrl);
      
      if (nextLineWithAudio) {
        // Play the next line
        playLineAudio(nextLineWithAudio.id);
      } else {
        // No more lines with audio
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
      }
    } else {
      // Last line ended
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    }
  };

  const exportAsMP3 = () => {
    // Find the first script line with audio
    const firstLineWithAudio = scriptLines.find((line) => line.audioUrl);
    if (!firstLineWithAudio || !firstLineWithAudio.audioUrl) {
      setError("No audio files available to download.");
      return;
    }
  
    // Create a download link for the first audio file
    const url = firstLineWithAudio.audioUrl;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${podcastTitle || "podcast"}_episode.mp3`;
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
  };
  
  // Handle volume change
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    // Update volume for all audio elements
    scriptLines.forEach(line => {
      if (audioRefs.current[line.id]) {
        audioRefs.current[line.id].volume = newVolume;
      }
    });
    
    if (fullAudioRef.current) {
      fullAudioRef.current.volume = newVolume;
    }
  };
  
  // Calculate total duration
  const getTotalDuration = () => {
    let totalSeconds = 0;
    scriptLines.forEach(line => {
      // Estimate duration based on character count
      // A rough estimate: 15 characters per second for English speech
      const characterCount = line.text.length;
      const estimatedSeconds = characterCount / 15;
      totalSeconds += estimatedSeconds;
    });
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      scriptLines.forEach(line => {
        if (line.audioUrl) {
          URL.revokeObjectURL(line.audioUrl);
        }
      });
      
      if (fullEpisodeAudio && fullEpisodeAudio !== "combined") {
        URL.revokeObjectURL(fullEpisodeAudio);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
            ✨ AI Podcast Generator
          </Badge>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
            Create multi-voice podcasts with AI
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Generate natural-sounding conversations between multiple characters using AI voices
          </p>
        </div>

        {/* Podcast Settings */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
          <CardTitle className="text-gray-100">Podcast Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your podcast episode details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Podcast Title
                </label>
                <Input
                  placeholder="My Awesome Podcast"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={podcastTitle}
                  onChange={(e) => setPodcastTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Episode Title
                </label>
                <Input
                  placeholder="Episode 1: Introduction"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">Estimated Duration</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-gray-400 text-sm">{getTotalDuration()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Management */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle className="text-gray-100">Characters</CardTitle>
              <CardDescription className="text-gray-400">
                Add and configure the voices in your podcast
              </CardDescription>
            </div>
            <Button 
              onClick={addCharacter}
              variant="ghost" 
              className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Character
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {characters.map((character) => (
                <div 
                  key={character.id} 
                  className="p-4 rounded-lg bg-gray-800 border border-gray-700 relative"
                  style={{ borderLeftWidth: '4px', borderLeftColor: character.color }}
                >
                  <div className="absolute top-4 right-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            onClick={() => removeCharacter(character.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove character</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Character Name
                      </label>
                      <Input
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Voice
                      </label>
                      <Select 
                        value={character.voice.value}
                        onValueChange={(value) => updateCharacterVoice(character.id, value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {VOICE_MODELS.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.name} - {voice.accent} ({voice.gender})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={character.color}
                          onChange={(e) => updateCharacter(character.id, 'color', e.target.value)}
                          className="w-12 h-8 p-1 bg-gray-700 border-gray-600"
                        />
                        <Input
                          value={character.color}
                          onChange={(e) => updateCharacter(character.id, 'color', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Script Editor */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
          <CardTitle className="text-gray-100">Podcast Script</CardTitle>
            <CardDescription className="text-gray-400">
              Create your conversation script
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scriptLines.map((line, index) => {
                const character = characters.find(c => c.id === line.characterId);
                return (
                  <div 
                    key={line.id} 
                    className="p-4 rounded-lg bg-gray-800 border border-gray-700 relative"
                    style={{ borderLeftWidth: '4px', borderLeftColor: character ? character.color : 'gray' }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Select 
                        value={line.characterId.toString()}
                        onValueChange={(value) => updateScriptLine(line.id, 'characterId', parseInt(value))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {characters.map((char) => (
                            <SelectItem key={char.id} value={char.id.toString()}>
                              {char.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center space-x-2">
                        {line.audioUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-400 hover:text-indigo-300 h-8"
                            onClick={() => playLineAudio(line.id)}
                          >
                            {currentPlayingIndex === line.id && isPlaying ? (
                              <PauseCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <PlayCircle className="h-4 w-4 mr-1" />
                            )}
                            Play
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 h-8"
                          onClick={() => removeScriptLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Textarea
                        placeholder={`${character ? character.name : 'Character'}'s line...`}
                        className="bg-gray-700 border-gray-600 text-white min-h-20"
                        value={line.text}
                        onChange={(e) => updateScriptLine(line.id, 'text', e.target.value)}
                        maxLength={2000}
                      />
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {line.text.length}/2000 characters
                        </p>
                        
                        <audio 
                          ref={(el) => audioRefs.current[line.id] = el}
                          src={line.audioUrl}
                          onEnded={() => handleLineAudioEnded(line.id)}
                          className="hidden"
                        />
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-white h-8"
                            onClick={() => addScriptLine(line.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add After
                          </Button>
                          
                          <Button
                            className="bg-indigo-800 hover:bg-indigo-700 h-8"
                            size="sm"
                            onClick={() => handleGenerateLine(line.id)}
                            disabled={line.isGenerating || !line.text.trim()}
                          >
                            {line.isGenerating ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Mic className="mr-1 h-3 w-3" />
                                Generate Audio
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Button 
                onClick={() => addScriptLine()} 
                variant="outline" 
                className="w-full mt-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-1" /> Add New Line
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-32"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700"
                onClick={playFullEpisode}
                disabled={!scriptLines.some(line => line.audioUrl)}
              >
                {isPlaying ? (
                  <>
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Pause All
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Play All
                  </>
                )}
              </Button>
              
              <Button
                className="bg-gradient-to-r from-indigo-800 to-purple-900 hover:from-indigo-700 hover:to-purple-800"
                onClick={handleGenerateAll}
                disabled={isGeneratingFull || !scriptLines.some(line => line.text.trim())}
              >
                {isGeneratingFull ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Full Episode...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Generate All Lines
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Export Options */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
          <CardTitle className="text-gray-100">Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={exportAsMP3}
                className="w-full md:w-auto flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                disabled={!fullEpisodeAudio}
              >
                <Download className="mr-2 h-4 w-4" />
                Export as MP3
              </Button>
              
              <Button
                variant="outline"
                className="w-full md:w-auto flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                disabled={!scriptLines.some(line => line.text.trim())}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Script as Text
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error display */}
        {error && (
     <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-900 text-red-400">
     <AlertTitle>Error</AlertTitle>
     <AlertDescription>{error}</AlertDescription>
   </Alert>
 )}
 
 {/* Hidden audio elements for full episode playback */}
 {fullEpisodeAudio && (
   <audio
     ref={fullAudioRef}
     src={fullEpisodeAudio === "combined" ? undefined : fullEpisodeAudio}
     onEnded={() => setIsPlaying(false)}
     className="hidden"
   />
 )}
 </div>
 </div>
 );
 }