from pocketsphinx import LiveSpeech
import sys
import subprocess
import os
import time

print("Initializing Trigger: HEY (v3 - Recorder)...")

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
            
            # 1. Toca um bip (usando o comando 'play' do sox ou um beep do sistema se possível)
            # Como play pode não ter saída configurada, vamos direto gravar
            
            # 2. Grava 5 segundos de comando
            filename = f"command_{int(time.time())}.wav"
            print(f"Recording command to {filename}...")
            
            # Grava usando arecord (mais garantido que sox em alguns linux)
            # -d 5: duração 5s
            # -f cd: qualidade CD (16bit little endian, 44100Hz, stereo)
            subprocess.run(["arecord", "-D", "plughw:0,0", "-d", "5", "-f", "cd", filename])
            
            print("Recording done. Sending to Raphael...")

            # 3. Envia o áudio para o Telegram
            subprocess.run([
                "openclaw", "message", "send", 
                "--channel", "telegram",
                "--target", "8458561202", 
                "--message", f"🎙️ Comando de Voz Capturado:",
                "--media", filename
            ])
            
            # Pequena pausa para não disparar duas vezes seguido
            time.sleep(2)

except Exception as e:
    print(f"Error: {e}")
