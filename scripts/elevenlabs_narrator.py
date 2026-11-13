"""
CONNECT DIGITAL — ELEVENLABS NARRATOR AUTOMATION
Gera locuções ultra-realistas com voz humana (nativa ou clonada),
mede a duração exata com ffprobe e atualiza os timings do motion.js.
"""

import os
import sys
import json
import urllib.request
import subprocess

API_KEY = "sk_deedb0195c4fa62251f395c1aa8d82f885732d845eb807b3"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIO_DIR = os.path.join(BASE_DIR, "audio")

# Roteiro das Cenas da Apresentação
SCENE_SCRIPTS = {
    0: {
        "title": "Proposta Comercial",
        "file": "cena_00_abertura.mp3",
        "text": "Proposta Comercial. Connect Digital."
    },
    1: {
        "title": "Alavancagem & Estrutura Enxuta",
        "file": "cena_01_diagnostico.mp3",
        "text": "Nosso compromisso é direto: fazer a sua empresa crescer para crescermos juntos, conquistando o faturamento que é nosso por direito. Através das ferramentas certas de posicionamento e inteligência artificial, colocamos seu negócio diante do cliente ideal com uma estrutura minimalista e inteligente — sem precisar contratar novos funcionários e sem inflar sua folha de pagamento. Menos atrito, máxima eficiência e lucro real no seu bolso."
    },
    2: {
        "title": "Google Ads & Intenção Imediata",
        "file": "cena_02_google_ads.mp3",
        "text": "Quem pesquisa no Google quer contratar hoje. Nós posicionamos o seu negócio no primeiro resultado da busca no raio exato do seu bairro, gerando chamadas e orçamentos direto no WhatsApp."
    },
    3: {
        "title": "Redes Sociais & Mosaico Multi-Nicho",
        "file": "cena_03_redes_sociais.mp3",
        "text": "No Instagram e no Facebook, criamos anúncios visuais magnéticos com as fotos reais dos seus serviços e ofertas irresistíveis que despertam desejo imediato no seu público local."
    },
    4: {
        "title": "O Destino: Landing Page de Alta Conversão",
        "file": "cena_04_landing_page.mp3",
        "text": "O interessado não cai em um site lento e confuso. Ele entra em uma página profissional, rápida e desenhada para celular, que conduz a pessoa em segundos para pedir orçamento."
    },
    5: {
        "title": "I.A. 24/7 + Chatbot WhatsApp + CRM",
        "file": "cena_05_whatsapp_fechamento.mp3",
        "text": "Você não perde tempo respondendo perguntas repetitivas. Nossa inteligência artificial atende no WhatsApp 24 horas por dia em dois segundos, qualifica o lead, quebra objeções e organiza tudo automaticamente no seu funil comercial do CRM."
    },
    6: {
        "title": "Connect Digital: Seu Diagnóstico Estratégico",
        "file": "cena_06_cta_connect.mp3",
        "text": "Chega de deixar dinheiro na mesa para a concorrência. Toque no botão abaixo e vamos ativar a máquina de vendas da sua empresa agora mesmo."
    }
}

def get_audio_duration(file_path):
    try:
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
        res = subprocess.check_output(cmd).decode().strip()
        return round(float(res), 1)
    except Exception as e:
        print(f"Aviso ao ler ffprobe: {e}")
        return None

def generate_scene(scene_id, voice_id="cjVigY5qzO86Huf0OWal"):
    if scene_id not in SCENE_SCRIPTS:
        print(f"Cena {scene_id} inexistente.")
        return None

    scene = SCENE_SCRIPTS[scene_id]
    out_path = os.path.join(AUDIO_DIR, scene["file"])
    print(f"\n[Gerando Cena {scene_id}] '{scene['title']}'...")
    print(f"Texto: \"{scene['text']}\"")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    payload = {
        "text": scene["text"],
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.78,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(out_path, "wb") as f:
                f.write(data)
            duration = get_audio_duration(out_path)
            print(f"✓ Salvo em: {out_path} ({len(data)} bytes | Duração: {duration}s)")
            return duration
    except Exception as e:
        print(f"Erro ao gerar áudio da cena {scene_id}: {e}")
        return None

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "status"
    voice = sys.argv[2] if len(sys.argv) > 2 else "cjVigY5qzO86Huf0OWal"

    if action == "generate_all":
        print(f"=== Gerando Todas as 7 Cenas com a voz {voice} ===")
        durations = {}
        for s_id in range(7):
            dur = generate_scene(s_id, voice_id=voice)
            durations[s_id] = dur
        print("\nResultado das durações:", durations)
    elif action == "generate":
        s_id = int(sys.argv[2])
        v_id = sys.argv[3] if len(sys.argv) > 3 else "cjVigY5qzO86Huf0OWal"
        generate_scene(s_id, voice_id=v_id)
    else:
        print("Uso:")
        print("  python elevenlabs_narrator.py generate_all [voice_id]")
        print("  python elevenlabs_narrator.py generate <scene_id> [voice_id]")

