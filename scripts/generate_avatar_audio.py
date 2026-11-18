"""
CONNECT DIGITAL — GERADOR DE VOZ NEURAL PARA AVATAR INFLUENCER (9:16)
Gera as 5 faixas de áudio da Corretora Virtual (Valentina Moraes) em Alphaville SP
usando ElevenLabs Multilingual v2 e mede a duração exata de cada cena.
"""

import os
import json
import urllib.request
import subprocess

API_KEY = "sk_deedb0195c4fa62251f395c1aa8d82f885732d845eb807b3"
# Bella - Professional, Bright, Warm (premade voice, natural PT-BR executive tone)
VOICE_ID = "hpp4J3VqNfWAUOO0d1Us"

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(BASE_DIR, "audio", "avatar_imoveis")
os.makedirs(OUT_DIR, exist_ok=True)

SCENES = [
    {
        "id": 1,
        "file": "avatar_cena_01_fachada.mp3",
        "text": "Se você procura exclusividade absoluta em Alphaville São Paulo, precisa conhecer esta mansão contemporânea recém-finalizada. São oitocentos e cinquenta metros quadrados de arquitetura autoral, em um terreno único com vista definitiva para a reserva."
    },
    {
        "id": 2,
        "file": "avatar_cena_02_living.mp3",
        "text": "Logo na entrada, o living com pé-direito duplo de sete metros integra três ambientes banhados por luz natural. Piso em mármore italiano Calacatta, lareira ecológica e esquadrias automatizadas que conectam toda a área social."
    },
    {
        "id": 3,
        "file": "avatar_cena_03_gourmet.mp3",
        "text": "O espaço gourmet é um espetáculo à parte: ilha em quartzo, churrasqueira a gás profissional e integração total com a piscina aquecida de borda infinita, revestida em pedra vulcânica Hijau e lareira externa rebaixada para receber amigos."
    },
    {
        "id": 4,
        "file": "avatar_cena_04_suite.mp3",
        "text": "Na área íntima, são cinco suítes plenas. A suíte master conta com mais de noventa metros quadrados, closet boutique senhor e senhora, sala de banho com hidromassagem dupla e varanda privativa para o pôr do sol."
    },
    {
        "id": 5,
        "file": "avatar_cena_05_cta.mp3",
        "text": "Disponível por doze milhões e quinhentos mil reais, com seis vagas subterrâneas e porteira fechada. Toque no botão abaixo e agende agora sua visita privada em Alphaville."
    }
]

def get_duration(path):
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path
        ]
        out = subprocess.check_output(cmd).decode().strip()
        return round(float(out), 2)
    except Exception as e:
        print(f"Erro ffprobe: {e}")
        return 12.0

def main():
    total = 0.0
    results = []
    for scene in SCENES:
        out_path = os.path.join(OUT_DIR, scene["file"])
        print(f"Gerando Cena {scene['id']} -> {scene['file']}...")
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
        payload = {
            "text": scene["text"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.48,
                "similarity_boost": 0.80,
                "style": 0.15,
                "use_speaker_boost": True
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": API_KEY,
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req) as resp:
            audio_bytes = resp.read()
            with open(out_path, "wb") as f:
                f.write(audio_bytes)
        dur = get_duration(out_path)
        total += dur
        results.append({"id": scene["id"], "file": scene["file"], "duration": dur})
        print(f"  OK ({len(audio_bytes)} bytes) - Duração: {dur}s")

    print(f"\nDuração Total da Locução: {round(total, 2)}s")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
