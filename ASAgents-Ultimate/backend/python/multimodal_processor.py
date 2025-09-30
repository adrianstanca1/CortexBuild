#!/usr/bin/env python3
"""
Multimodal AI Processing Service - Python Backend
Advanced multimodal content processing using Python ML libraries
"""

import os
import json
import base64
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import aiohttp
from pathlib import Path

# ML and AI libraries
try:
    import cv2
    import numpy as np
    from PIL import Image
    import torch
    import transformers
    from transformers import pipeline
    import librosa
    import speech_recognition as sr
    from moviepy.editor import VideoFileClip
    import pytesseract
    import spacy
    from sentence_transformers import SentenceTransformer
except ImportError as e:
    logging.warning(f"Some ML libraries not available: {e}")

# FastAPI for REST API
try:
    from fastapi import FastAPI, HTTPException, UploadFile, File
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
except ImportError:
    logging.error("FastAPI not available. Install with: pip install fastapi uvicorn")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProcessingConfig:
    """Configuration for multimodal processing"""
    enable_gpu: bool = torch.cuda.is_available() if 'torch' in globals() else False
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    supported_image_formats: List[str] = None
    supported_audio_formats: List[str] = None
    supported_video_formats: List[str] = None
    model_cache_dir: str = "./models"
    temp_dir: str = "./temp"
    
    def __post_init__(self):
        if self.supported_image_formats is None:
            self.supported_image_formats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        if self.supported_audio_formats is None:
            self.supported_audio_formats = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
        if self.supported_video_formats is None:
            self.supported_video_formats = ['.mp4', '.avi', '.mov', '.mkv', '.webm']

class MultimodalProcessor:
    """Advanced multimodal content processor using Python ML libraries"""
    
    def __init__(self, config: ProcessingConfig = None):
        self.config = config or ProcessingConfig()
        self.models = {}
        self._initialize_models()
        
        # Create directories
        Path(self.config.model_cache_dir).mkdir(exist_ok=True)
        Path(self.config.temp_dir).mkdir(exist_ok=True)
    
    def _initialize_models(self):
        """Initialize ML models"""
        try:
            # Text processing models
            if 'transformers' in globals():
                logger.info("Loading text processing models...")
                self.models['sentiment'] = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                    return_all_scores=True
                )
                self.models['ner'] = pipeline(
                    "ner",
                    model="dbmdz/bert-large-cased-finetuned-conll03-english",
                    aggregation_strategy="simple"
                )
                self.models['summarization'] = pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn"
                )
            
            # Sentence embeddings for similarity
            if 'SentenceTransformer' in globals():
                self.models['embeddings'] = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Computer vision models
            if 'cv2' in globals():
                # Load pre-trained models for object detection
                self.models['face_cascade'] = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
            
            # Speech recognition
            if 'sr' in globals():
                self.models['speech_recognizer'] = sr.Recognizer()
            
            # NLP model for advanced text processing
            if 'spacy' in globals():
                try:
                    self.models['nlp'] = spacy.load("en_core_web_sm")
                except OSError:
                    logger.warning("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            
            logger.info("Models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
    
    async def process_text(self, text: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advanced text processing with NLP"""
        try:
            results = {
                'extracted_text': text,
                'language': 'en',  # Could be detected
                'word_count': len(text.split()),
                'character_count': len(text),
                'sentiment': {'score': 0.0, 'label': 'neutral', 'confidence': 0.0},
                'entities': [],
                'keywords': [],
                'topics': [],
                'summary': '',
                'embeddings': None
            }
            
            # Sentiment analysis
            if 'sentiment' in self.models:
                sentiment_results = self.models['sentiment'](text)
                if sentiment_results and len(sentiment_results[0]) > 0:
                    best_sentiment = max(sentiment_results[0], key=lambda x: x['score'])
                    results['sentiment'] = {
                        'score': best_sentiment['score'] * (1 if best_sentiment['label'] == 'POSITIVE' else -1),
                        'label': best_sentiment['label'].lower(),
                        'confidence': best_sentiment['score']
                    }
            
            # Named Entity Recognition
            if 'ner' in self.models:
                entities = self.models['ner'](text)
                results['entities'] = [
                    {
                        'text': entity['word'],
                        'type': entity['entity_group'].lower(),
                        'confidence': entity['score']
                    }
                    for entity in entities
                ]
            
            # Text summarization (for longer texts)
            if 'summarization' in self.models and len(text) > 500:
                try:
                    summary = self.models['summarization'](
                        text, 
                        max_length=150, 
                        min_length=30, 
                        do_sample=False
                    )
                    if summary:
                        results['summary'] = summary[0]['summary_text']
                except Exception as e:
                    logger.warning(f"Summarization failed: {e}")
            
            # Advanced NLP with spaCy
            if 'nlp' in self.models:
                doc = self.models['nlp'](text)
                
                # Extract keywords (noun phrases and important entities)
                keywords = []
                for chunk in doc.noun_chunks:
                    if len(chunk.text) > 2:
                        keywords.append({
                            'text': chunk.text,
                            'relevance': 0.8  # Could be calculated more sophisticatedly
                        })
                
                # Add named entities as keywords
                for ent in doc.ents:
                    keywords.append({
                        'text': ent.text,
                        'relevance': 0.9
                    })
                
                results['keywords'] = keywords[:20]  # Limit to top 20
                
                # Extract topics (simplified - could use topic modeling)
                topics = list(set([ent.label_ for ent in doc.ents]))
                results['topics'] = topics
            
            # Generate embeddings for similarity search
            if 'embeddings' in self.models:
                embeddings = self.models['embeddings'].encode(text)
                results['embeddings'] = embeddings.tolist()
            
            return results
            
        except Exception as e:
            logger.error(f"Text processing error: {e}")
            raise
    
    async def process_image(self, image_data: bytes, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advanced image processing with computer vision"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Invalid image data")
            
            results = {
                'objects': [],
                'faces': [],
                'text': '',
                'scenes': [],
                'colors': [],
                'landmarks': [],
                'safety_labels': [],
                'description': '',
                'tags': []
            }
            
            # Face detection
            if 'face_cascade' in self.models:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                faces = self.models['face_cascade'].detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
                
                results['faces'] = [
                    {
                        'confidence': 0.8,  # Haar cascades don't provide confidence
                        'emotions': {},  # Would need additional model
                        'bounding_box': {
                            'x': int(x), 'y': int(y), 
                            'width': int(w), 'height': int(h)
                        }
                    }
                    for (x, y, w, h) in faces
                ]
            
            # OCR - Extract text from image
            if 'pytesseract' in globals():
                try:
                    # Convert BGR to RGB for pytesseract
                    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(rgb_image)
                    extracted_text = pytesseract.image_to_string(pil_image)
                    results['text'] = extracted_text.strip()
                except Exception as e:
                    logger.warning(f"OCR failed: {e}")
            
            # Color analysis
            height, width = image.shape[:2]
            total_pixels = height * width
            
            # Get dominant colors
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pixels = image_rgb.reshape(-1, 3)
            
            # Simple color clustering (could use K-means for better results)
            unique_colors, counts = np.unique(pixels, axis=0, return_counts=True)
            color_percentages = counts / total_pixels * 100
            
            # Get top 5 colors
            top_indices = np.argsort(counts)[-5:][::-1]
            results['colors'] = [
                {
                    'hex': f"#{r:02x}{g:02x}{b:02x}",
                    'percentage': float(color_percentages[i])
                }
                for i in top_indices
                for r, g, b in [unique_colors[i]]
            ]
            
            # Basic scene classification (simplified)
            # In a real implementation, you'd use a trained model
            avg_color = np.mean(image_rgb, axis=(0, 1))
            if avg_color[2] > 150 and avg_color[1] > 100:  # Lots of blue and green
                results['scenes'].append({'name': 'outdoor', 'confidence': 0.7})
            elif avg_color.mean() < 100:  # Dark image
                results['scenes'].append({'name': 'indoor', 'confidence': 0.6})
            else:
                results['scenes'].append({'name': 'mixed', 'confidence': 0.5})
            
            # Generate description based on analysis
            description_parts = []
            if results['faces']:
                description_parts.append(f"{len(results['faces'])} face(s) detected")
            if results['text']:
                description_parts.append("contains text")
            if results['scenes']:
                description_parts.append(f"{results['scenes'][0]['name']} scene")
            
            results['description'] = "Image with " + ", ".join(description_parts) if description_parts else "Image analysis completed"
            
            # Generate tags
            tags = []
            if results['faces']:
                tags.append('people')
            if results['text']:
                tags.append('text')
            tags.extend([scene['name'] for scene in results['scenes']])
            results['tags'] = list(set(tags))
            
            return results
            
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            raise
    
    async def process_audio(self, audio_data: bytes, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advanced audio processing with speech recognition"""
        try:
            # Save audio data to temporary file
            temp_path = Path(self.config.temp_dir) / f"temp_audio_{datetime.now().timestamp()}.wav"
            
            with open(temp_path, 'wb') as f:
                f.write(audio_data)
            
            results = {
                'transcription': {
                    'text': '',
                    'confidence': 0.0,
                    'language': 'en',
                    'speakers': []
                },
                'audio_features': {
                    'volume': 0.0,
                    'pitch': 0.0,
                    'tempo': 0.0,
                    'music_genre': '',
                    'instruments': []
                },
                'emotions': [],
                'noise_level': 0.0,
                'silence_segments': []
            }
            
            try:
                # Load audio with librosa
                if 'librosa' in globals():
                    y, sr = librosa.load(str(temp_path))
                    
                    # Audio features
                    results['audio_features']['volume'] = float(np.mean(np.abs(y)))
                    
                    # Pitch detection
                    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
                    pitch_values = pitches[magnitudes > np.max(magnitudes) * 0.1]
                    if len(pitch_values) > 0:
                        results['audio_features']['pitch'] = float(np.mean(pitch_values[pitch_values > 0]))
                    
                    # Tempo detection
                    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
                    results['audio_features']['tempo'] = float(tempo)
                
                # Speech recognition
                if 'speech_recognizer' in self.models:
                    with sr.AudioFile(str(temp_path)) as source:
                        audio = self.models['speech_recognizer'].record(source)
                        try:
                            text = self.models['speech_recognizer'].recognize_google(audio)
                            results['transcription']['text'] = text
                            results['transcription']['confidence'] = 0.8  # Google API doesn't provide confidence
                        except sr.UnknownValueError:
                            results['transcription']['text'] = "Could not understand audio"
                        except sr.RequestError as e:
                            logger.warning(f"Speech recognition error: {e}")
                
            finally:
                # Clean up temporary file
                if temp_path.exists():
                    temp_path.unlink()
            
            return results
            
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            raise
    
    async def process_video(self, video_data: bytes, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advanced video processing"""
        try:
            # Save video data to temporary file
            temp_path = Path(self.config.temp_dir) / f"temp_video_{datetime.now().timestamp()}.mp4"
            
            with open(temp_path, 'wb') as f:
                f.write(video_data)
            
            results = {
                'scenes': [],
                'faces': [],
                'audio': None,
                'motion': {
                    'intensity': 0.0,
                    'direction': '',
                    'camera_movement': 'static'
                },
                'quality': {
                    'resolution': '',
                    'frame_rate': 0.0,
                    'bitrate': 0,
                    'stability': 0.0
                }
            }
            
            try:
                if 'VideoFileClip' in globals():
                    # Load video
                    clip = VideoFileClip(str(temp_path))
                    
                    # Basic video info
                    results['quality']['resolution'] = f"{clip.w}x{clip.h}"
                    results['quality']['frame_rate'] = clip.fps
                    
                    # Extract audio if present
                    if clip.audio is not None:
                        audio_path = temp_path.with_suffix('.wav')
                        clip.audio.write_audiofile(str(audio_path), verbose=False, logger=None)
                        
                        with open(audio_path, 'rb') as f:
                            audio_data = f.read()
                        
                        results['audio'] = await self.process_audio(audio_data)
                        audio_path.unlink()  # Clean up
                    
                    # Sample frames for analysis
                    duration = clip.duration
                    sample_times = np.linspace(0, duration, min(10, int(duration)))
                    
                    scenes = []
                    for i, t in enumerate(sample_times):
                        frame = clip.get_frame(t)
                        
                        # Convert frame to bytes for image processing
                        pil_image = Image.fromarray(frame)
                        import io
                        img_bytes = io.BytesIO()
                        pil_image.save(img_bytes, format='JPEG')
                        frame_data = img_bytes.getvalue()
                        
                        # Process frame as image
                        frame_analysis = await self.process_image(frame_data)
                        
                        scenes.append({
                            'start': float(t),
                            'end': float(t + duration / len(sample_times)),
                            'description': frame_analysis['description'],
                            'keyframes': [],  # Would store frame URLs
                            'objects': frame_analysis['objects']
                        })
                    
                    results['scenes'] = scenes
                    clip.close()
                
            finally:
                # Clean up temporary file
                if temp_path.exists():
                    temp_path.unlink()
            
            return results
            
        except Exception as e:
            logger.error(f"Video processing error: {e}")
            raise

# FastAPI application
app = FastAPI(title="Multimodal AI Processing Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global processor instance
processor = MultimodalProcessor()

# Pydantic models for API
class ProcessingRequest(BaseModel):
    content_type: str
    metadata: Optional[Dict[str, Any]] = None

class ProcessingResponse(BaseModel):
    success: bool
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.post("/process/text", response_model=ProcessingResponse)
async def process_text_endpoint(text: str, metadata: Optional[Dict[str, Any]] = None):
    """Process text content"""
    try:
        results = await processor.process_text(text, metadata)
        return ProcessingResponse(success=True, results=results)
    except Exception as e:
        return ProcessingResponse(success=False, error=str(e))

@app.post("/process/image", response_model=ProcessingResponse)
async def process_image_endpoint(file: UploadFile = File(...)):
    """Process image content"""
    try:
        image_data = await file.read()
        metadata = {"filename": file.filename, "content_type": file.content_type}
        results = await processor.process_image(image_data, metadata)
        return ProcessingResponse(success=True, results=results)
    except Exception as e:
        return ProcessingResponse(success=False, error=str(e))

@app.post("/process/audio", response_model=ProcessingResponse)
async def process_audio_endpoint(file: UploadFile = File(...)):
    """Process audio content"""
    try:
        audio_data = await file.read()
        metadata = {"filename": file.filename, "content_type": file.content_type}
        results = await processor.process_audio(audio_data, metadata)
        return ProcessingResponse(success=True, results=results)
    except Exception as e:
        return ProcessingResponse(success=False, error=str(e))

@app.post("/process/video", response_model=ProcessingResponse)
async def process_video_endpoint(file: UploadFile = File(...)):
    """Process video content"""
    try:
        video_data = await file.read()
        metadata = {"filename": file.filename, "content_type": file.content_type}
        results = await processor.process_video(video_data, metadata)
        return ProcessingResponse(success=True, results=results)
    except Exception as e:
        return ProcessingResponse(success=False, error=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": len(processor.models)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
