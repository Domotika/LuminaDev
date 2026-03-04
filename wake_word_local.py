import pyaudio
import numpy as np
import openwakeword
from openwakeword.model import Model
import os

# Load the locally downloaded model
print("Loading model from local file...")
model = Model(wakeword_models=["hey_jarvis_v0.1.tflite"]) 

# Get microphone stream
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1280
audio = pyaudio.PyAudio()
mic_stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

print("Listening for 'Hey Jarvis'...")

while True:
    try:
        # Get audio
        audio_data = np.frombuffer(mic_stream.read(CHUNK, exception_on_overflow=False), dtype=np.int16)

        # Feed to openWakeWord model
        prediction = model.predict(audio_data)

        # Check predictions
        for mdl in model.prediction_buffer.keys():
            scores = list(model.prediction_buffer[mdl])
            if scores[-1] > 0.5: # Threshold
                print(f"Detected {mdl} with score {scores[-1]}")
                model.reset()
                # Create a file to signal detection
                with open("wake_detected.txt", "w") as f:
                    f.write("detected")
    except Exception as e:
        print(f"Error: {e}")
        break
