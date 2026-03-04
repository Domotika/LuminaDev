import pyaudio
import numpy as np
import openwakeword
from openwakeword.model import Model
import os

# Create the model (using a pre-trained model)
print("Loading model...")
# openwakeword comes with 'hey jarvis', 'alexa', 'hey mycroft', 'timer', 'weather' etc.
model = Model(wakeword_models=["hey_jarvis.tflite"]) 

# Get microphone stream
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1280
audio = pyaudio.PyAudio()
mic_stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

print("Listening for 'Hey Jarvis'...")

while True:
    # Get audio
    audio_data = np.frombuffer(mic_stream.read(CHUNK), dtype=np.int16)

    # Feed to openWakeWord model
    prediction = model.predict(audio_data)

    # Check predictions
    for mdl in model.prediction_buffer.keys():
        scores = list(model.prediction_buffer[mdl])
        if scores[-1] > 0.5: # Threshold
            print(f"Detected {mdl} with score {scores[-1]}")
            # Reset buffer to avoid multiple triggers
            model.reset()
            # Here we would trigger the action (e.g. record command)
            os.system("echo 'WAKE WORD DETECTED' >> wake_log.txt")
