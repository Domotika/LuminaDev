from pocketsphinx import LiveSpeech
import sys
import subprocess

print("Initializing Trigger: HEY ...")

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
        # print(f"Heard: {text}") # Debug OFF para limpar o log
        
        # Filtro simples para a palavra "hey"
        if "hey" in text:
            print(f"!!! TRIGGER DETECTED: {text} !!!")
            sys.stdout.flush()
            
            # Envia mensagem no Telegram via CLI do OpenClaw
            subprocess.run([
                "openclaw", "message", "send", 
                "--to", "8458561202", 
                "--message", f"🚨 Ouvidos atentos! Detectei: '{text}'"
            ])

except Exception as e:
    print(f"Error: {e}")
