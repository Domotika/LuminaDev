import os
from pocketsphinx import LiveSpeech

print("Listening for keywords: 'jarvis', 'computer'...")

# pocketsphinx configuration
speech = LiveSpeech(
    verbose=False,
    sampling_rate=16000,
    buffer_size=2048,
    no_search=False,
    full_utt=False,
    hmm=os.path.join(os.path.dirname(os.path.realpath(__file__)), 'pocketsphinx-data/en-us'),
    lm=False,
    keyphrase='jarvis',
    kws_threshold=1e-20
)

for phrase in speech:
    print(f"Detected: {phrase}")
    with open("wake_detected.txt", "w") as f:
        f.write(str(phrase))
