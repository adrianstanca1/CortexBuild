import React, { useState, useRef, useCallback, useEffect } from 'react';
import { aiSystem } from '../../services/ai/index';

interface VoiceInputProps {
    onTranscriptionComplete?: (transcript: string) => void;
    onError?: (error: string) => void;
    language?: string;
    className?: string;
}

export const AIVoiceInput: React.FC<VoiceInputProps> = ({
    onTranscriptionComplete,
    onError,
    language = 'en',
    className = ''
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setDuration(0);
        setVolume(0);
    }, []);

    // Audio level monitoring
    const monitorAudioLevel = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setVolume(Math.min(100, (average / 255) * 100));

        if (isRecording) {
            animationRef.current = requestAnimationFrame(monitorAudioLevel);
        }
    }, [isRecording]);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            streamRef.current = stream;

            // Setup audio context for volume monitoring
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            // Setup media recorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                setIsProcessing(true);
                try {
                    const result = await aiSystem.multimodalHandler.processVoice({
                        audioBlob,
                        language
                    });

                    setTranscript(result.transcript);
                    onTranscriptionComplete?.(result.transcript);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
                    onError?.(errorMessage);
                    console.error('Voice processing error:', error);
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start(1000); // Record in 1-second chunks
            setIsRecording(true);

            // Start duration counter
            intervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            // Start volume monitoring
            monitorAudioLevel();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone';
            onError?.(errorMessage);
            console.error('Recording error:', error);
        }
    }, [language, onTranscriptionComplete, onError, monitorAudioLevel]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            cleanup();
        }
    }, [isRecording, cleanup]);

    // Format duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // Clear transcript
    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Voice Input
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Language: {language.toUpperCase()}
                </div>
            </div>

            {/* Recording Controls */}
            <div className="text-center mb-6">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`relative w-20 h-20 rounded-full border-4 transition-all duration-200 focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                            ? 'bg-red-500 border-red-600 hover:bg-red-600 focus:ring-red-500'
                            : 'bg-blue-500 border-blue-600 hover:bg-blue-600 focus:ring-blue-500'
                        }`}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isProcessing ? (
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                        <svg
                            className={`w-8 h-8 text-white mx-auto ${isRecording ? 'animate-pulse' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            {isRecording ? (
                                <rect x="6" y="4" width="8" height="12" rx="1" />
                            ) : (
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                            )}
                        </svg>
                    )}

                    {/* Volume visualization */}
                    {isRecording && (
                        <div
                            className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"
                            style={{
                                animationDuration: `${2 - (volume / 100)}s`
                            }}
                        />
                    )}
                </button>

                <div className="mt-4 space-y-2">
                    {isRecording && (
                        <>
                            <div className="text-lg font-mono text-gray-900 dark:text-white">
                                {formatDuration(duration)}
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Volume:</div>
                                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100"
                                        style={{ width: `${volume}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {isProcessing && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Processing audio...
                        </div>
                    )}

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {isRecording
                            ? 'Click to stop recording'
                            : isProcessing
                                ? 'Please wait...'
                                : 'Click to start recording'
                        }
                    </div>
                </div>
            </div>

            {/* Transcript */}
            {transcript && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Transcript
                        </h4>
                        <button
                            onClick={clearTranscript}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {transcript}
                        </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Click the transcript to copy it to your clipboard
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Tips for better recognition:
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Speak clearly and at normal pace</li>
                    <li>• Minimize background noise</li>
                    <li>• Keep microphone close to your mouth</li>
                    <li>• Pause briefly between sentences</li>
                </ul>
            </div>
        </div>
    );
};