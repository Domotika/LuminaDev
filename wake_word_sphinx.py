from pocketsphinx import LiveSpeech
import sys

print("Initializing PocketSphinx...")

# Create a LiveSpeech instance
# We are using the default model which should be installed with the package
try:
    speech = LiveSpeech(
        verbose=False,
        sampling_rate=16000,
        buffer_size=2048,
        no_search=False,
        full_utt=False
    )
    
    print("Listening... (Say 'hello' or something in English)")
    
    for phrase in speech:
        print(f"Heard: {phrase}")
        # Flush stdout to ensure we see it immediately
        sys.stdout.flush()

except Exception as e:
    print(f"Error: {e}")
