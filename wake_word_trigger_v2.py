from pocketsphinx import LiveSpeech
import sys
import subprocess

print("Initializing Trigger: HEY (v2)...")

try:
    speech = LiveSpeech(
        verbose=False,
        sampling_rate=16000,
        buffer_size=2048,
        no_search=False,
        full_utt=False
    )

    print("Listening... Say 'HEY'")

    for phrase in speech:
        text = str(phrase).lower()
        
        if "hey" in text:
            print(f"!!! TRIGGER DETECTED: {text} !!!")
            sys.stdout.flush()
            
            # Correção: Usando --target e garantindo o caminho completo se precisar
            subprocess.run([
                "openclaw", "message", "send", 
                "--channel", "telegram",
                "--target", "8458561202", 
                "--message", f"🎙️ OUVINDO: Detectei a palavra mágica no áudio local! ('{text}')"
            ])

except Exception as e:
    print(f"Error: {e}")
