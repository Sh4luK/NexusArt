import whisper
import tempfile
import ffmpeg
import io
from typing import Optional, Tuple
import os
from datetime import datetime

class AudioProcessor:
    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper model for audio transcription
        
        Args:
            model_size: Size of Whisper model (tiny, base, small, medium, large)
        """
        self.model_size = model_size
        self.model = None
        
    def load_model(self):
        """Lazy load the Whisper model"""
        if self.model is None:
            print(f"Loading Whisper model ({self.model_size})...")
            self.model = whisper.load_model(self.model_size)
            print("Whisper model loaded")
        return self.model
    
    def transcribe_audio(self, audio_bytes: bytes, language: str = "pt") -> Tuple[str, dict]:
        """
        Transcribe audio using Whisper
        
        Args:
            audio_bytes: Audio file bytes
            language: Language code (default: Portuguese)
        
        Returns:
            Tuple of (transcription_text, metadata)
        """
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                # Convert audio if needed
                audio_path = self._convert_audio(tmp_path)
                
                # Load model
                model = self.load_model()
                
                # Transcribe
                result = model.transcribe(
                    audio_path,
                    language=language,
                    task="transcribe",
                    fp16=False  # CPU mode
                )
                
                transcription = result["text"].strip()
                
                metadata = {
                    "language": result.get("language", language),
                    "duration": result.get("duration", 0),
                    "model": self.model_size,
                    "processing_time": datetime.utcnow().isoformat()
                }
                
                return transcription, metadata
                
            finally:
                # Cleanup temporary files
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                try:
                    if 'audio_path' in locals() and audio_path != tmp_path:
                        os.unlink(audio_path)
                except:
                    pass
                    
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")
    
    def _convert_audio(self, input_path: str) -> str:
        """
        Convert audio to format compatible with Whisper (16kHz WAV)
        
        Args:
            input_path: Path to input audio file
        
        Returns:
            Path to converted audio file
        """
        # Check if already in correct format
        if input_path.endswith('.wav'):
            # Verify if needs conversion
            try:
                probe = ffmpeg.probe(input_path)
                audio_stream = next(
                    (stream for stream in probe['streams'] if stream['codec_type'] == 'audio'),
                    None
                )
                
                if audio_stream and audio_stream.get('sample_rate', '0') == '16000':
                    return input_path
            except:
                pass
        
        # Convert to 16kHz mono WAV
        output_path = input_path.replace('.ogg', '.wav').replace('.mp3', '.wav').replace('.m4a', '.wav')
        
        try:
            (
                ffmpeg
                .input(input_path)
                .output(
                    output_path,
                    ar=16000,
                    ac=1,
                    acodec='pcm_s16le'
                )
                .overwrite_output()
                .run(quiet=True, capture_stdout=True, capture_stderr=True)
            )
            return output_path
        except ffmpeg.Error as e:
            raise Exception(f"Audio conversion failed: {e.stderr.decode() if e.stderr else str(e)}")
    
    def get_supported_formats(self) -> list:
        """
        Get list of supported audio formats
        
        Returns:
            List of supported file extensions
        """
        return ['.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac']
    
    def validate_audio(self, audio_bytes: bytes, max_duration: int = 300) -> bool:
        """
        Validate audio file before processing
        
        Args:
            audio_bytes: Audio file bytes
            max_duration: Maximum duration in seconds
        
        Returns:
            True if audio is valid
        """
        try:
            with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                probe = ffmpeg.probe(tmp_path)
                duration = float(probe['format']['duration'])
                
                if duration > max_duration:
                    raise Exception(f"Audio too long ({duration}s > {max_duration}s)")
                
                # Check for audio stream
                audio_streams = [s for s in probe['streams'] if s['codec_type'] == 'audio']
                if not audio_streams:
                    raise Exception("No audio stream found")
                
                return True
                
            finally:
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
        except Exception as e:
            raise Exception(f"Audio validation failed: {str(e)}")
    
    def get_audio_info(self, audio_bytes: bytes) -> dict:
        """
        Get audio file information
        
        Args:
            audio_bytes: Audio file bytes
        
        Returns:
            Dictionary with audio information
        """
        try:
            with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                probe = ffmpeg.probe(tmp_path)
                
                audio_stream = next(
                    (stream for stream in probe['streams'] if stream['codec_type'] == 'audio'),
                    {}
                )
                
                return {
                    "duration": float(probe['format']['duration']),
                    "format": probe['format']['format_name'],
                    "size": int(probe['format']['size']),
                    "sample_rate": audio_stream.get('sample_rate'),
                    "channels": audio_stream.get('channels'),
                    "codec": audio_stream.get('codec_name')
                }
                
            finally:
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
        except Exception as e:
            raise Exception(f"Failed to get audio info: {str(e)}")