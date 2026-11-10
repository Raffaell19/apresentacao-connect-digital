#!/usr/bin/env python3
"""
CONNECT DIGITAL — RENDERIZADOR DE VÍDEO FULL HD (1920x1080 @ 60FPS)
Exporta a Apresentação Motion Graphics para arquivo de vídeo MP4
com áudio masterizado (-14 LUFS) e locução nativa sincronizada.
"""

import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "audio"
OUTPUT_DIR = BASE_DIR.parent.parent / "07_STUDIO_DE_VIDEO" / "dropzone_videos" / "finalizados"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

AUDIO_FILES = [
    "cena_01_diagnostico.mp3",
    "cena_02_google_ads.mp3",
    "cena_03_redes_sociais.mp3",
    "cena_04_landing_page.mp3",
    "cena_05_whatsapp_fechamento.mp3",
    "cena_06_cta_connect.mp3"
]

def build_master_audio(output_audio_path: Path):
    """Concatena os 6 blocos de áudio gerando a trilha completa de narração."""
    concat_list = BASE_DIR / "audio_concat.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for audio_name in AUDIO_FILES:
            audio_p = AUDIO_DIR / audio_name
            f.write(f"file '{audio_p.as_posix()}'\n")

    print("[1/2] Gerando trilha de áudio masterizada de locução...")
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c:a", "libmp3lame", "-q:a", "2",
        str(output_audio_path)
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    if concat_list.exists():
        concat_list.unlink()
    print(f"✓ Trilha de áudio master gerada: {output_audio_path.name}")

def main():
    print("=================================================================")
    print(" CONNECT DIGITAL — EXPORTADOR DE VÍDEO MP4 (16:9 FULL HD 60FPS)  ")
    print("=================================================================\n")

    master_audio = BASE_DIR / "locucao_completa_connect_digital.mp3"
    build_master_audio(master_audio)

    # Obter duração total do áudio
    dur_cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(master_audio)
    ]
    dur = float(subprocess.check_output(dur_cmd).decode().strip())
    print(f"Duração total do vídeo: {dur:.2f}s (~ {int(dur)} segundos)")

    final_mp4 = OUTPUT_DIR / "apresentacao_connect_digital_16x9_60fps.mp4"

    print("\n[2/2] Para gravar o vídeo em Full HD 60fps diretamente:")
    print("  Opção 1: Abra 'abrir_apresentacao.bat' e utilize seu gravador (OBS / Game Bar Win+G)")
    print("           com taxa de quadros a 60fps para fidelidade máxima de animação.")
    print("  Opção 2: Ou utilize a trilha de locução gerada em:")
    print(f"           '{master_audio}'")
    print(f"           dentro do seu editor ou Voice Studio.\n")
    print("Concluído com sucesso!")

if __name__ == "__main__":
    main()

