/**
 * CONNECT DIGITAL — AI CREATORS & AVATAR INFLUENCER 9:16 ENGINE
 * Sincronização em tempo real: Locução Neural (ElevenLabs) + Motion Graphics HUD +
 * Efeitos Sonoros Sintetizados via Web Audio API (Whoosh, Pop, Chime, Bass, Ping) +
 * Legendas Dinâmicas Karaoke (Estilo Reels/TikTok).
 */

const AVATAR_SCENES = [
  {
    id: 0,
    title: "1. Fachada Alphaville",
    audioFile: "audio/avatar_imoveis/avatar_cena_01_fachada.mp3",
    fallbackDuration: 14.5,
    text: "Se você procura exclusividade absoluta em Alphaville São Paulo, precisa conhecer esta mansão contemporânea recém-finalizada. São oitocentos e cinquenta metros quadrados de arquitetura autoral, em um terreno único com vista definitiva para a reserva.",
    cues: [
      { time: 0.2, targetId: "mg-c1-loc", sfx: "bass" },
      { time: 4.5, targetId: "mg-c1-area", sfx: "whoosh" },
      { time: 8.8, targetId: "mg-c1-chips", sfx: "pop" },
      { time: 11.5, targetId: "mg-c1-autor", sfx: "chime" }
    ]
  },
  {
    id: 1,
    title: "2. Living 7m",
    audioFile: "audio/avatar_imoveis/avatar_cena_02_living.mp3",
    fallbackDuration: 15.2,
    text: "Logo na entrada, o living com pé-direito duplo de sete metros integra três ambientes banhados por luz natural. Piso em mármore italiano Calacatta, lareira ecológica e esquadrias automatizadas que conectam toda a área social.",
    cues: [
      { time: 0.3, targetId: "mg-c2-badge", sfx: "whoosh" },
      { time: 2.2, targetId: "mg-c2-pedireito", sfx: "pop" },
      { time: 6.5, targetId: "mg-c2-marmore", sfx: "chime" },
      { time: 10.2, targetId: "mg-c2-chips", sfx: "pop" }
    ]
  },
  {
    id: 2,
    title: "3. Gourmet & Piscina",
    audioFile: "audio/avatar_imoveis/avatar_cena_03_gourmet.mp3",
    fallbackDuration: 14.5,
    text: "O espaço gourmet é um espetáculo à parte: ilha em quartzo, churrasqueira a gás profissional e integração total com a piscina aquecida de borda infinita, revestida em pedra vulcânica Hijau e lareira externa rebaixada para receber amigos.",
    cues: [
      { time: 0.3, targetId: "mg-c3-gourmet", sfx: "whoosh" },
      { time: 5.2, targetId: "mg-c3-piscina", sfx: "chime" },
      { time: 9.8, targetId: "mg-c3-chips", sfx: "pop" }
    ]
  },
  {
    id: 3,
    title: "4. Suíte Master",
    audioFile: "audio/avatar_imoveis/avatar_cena_04_suite.mp3",
    fallbackDuration: 12.4,
    text: "Na área íntima, são cinco suítes plenas. A suíte master conta com mais de noventa metros quadrados, closet boutique senhor e senhora, sala de banho com hidromassagem dupla e varanda privativa para o pôr do sol.",
    cues: [
      { time: 0.3, targetId: "mg-c4-suites", sfx: "whoosh" },
      { time: 3.8, targetId: "mg-c4-master", sfx: "chime" },
      { time: 7.4, targetId: "mg-c4-chips", sfx: "pop" }
    ]
  },
  {
    id: 4,
    title: "5. Valor & Visita",
    audioFile: "audio/avatar_imoveis/avatar_cena_05_cta.mp3",
    fallbackDuration: 9.5,
    text: "Disponível por doze milhões e quinhentos mil reais, com seis vagas subterrâneas e porteira fechada. Toque no botão abaixo e agende agora sua visita privada em Alphaville.",
    cues: [
      { time: 0.25, targetId: "mg-c5-price", sfx: "chime" },
      { time: 3.2, targetId: "mg-c5-chips", sfx: "pop" },
      { time: 5.4, targetId: "mg-c5-cta", sfx: "ping" }
    ]
  }
];

/* ==========================================================================
   SINTETIZADOR DE EFEITOS SONOROS DE ESTÚDIO (WEB AUDIO API)
   ========================================================================== */
class StudioSFXEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  trigger(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    switch (type) {
      case "whoosh":
        this.playWhoosh();
        break;
      case "pop":
        this.playPop();
        break;
      case "chime":
        this.playLuxuryChime();
        break;
      case "bass":
        this.playBassImpact();
        break;
      case "ping":
        this.playNotificationPing();
        break;
    }
  }

  // Efeito Sonoro 1: Whoosh Cinematográfico de Transição / Entrada de Card
  playWhoosh() {
    const now = this.ctx.currentTime;
    const duration = 0.28;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(2.5, now);
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Efeito Sonoro 2: Pop Digital Limpo para Tags e Specs
  playPop() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.065);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  // Efeito Sonoro 3: Luxury Shimmer Chime para Destaques de Alto Padrão e Preço
  playLuxuryChime() {
    const now = this.ctx.currentTime;
    const freqs = [587.33, 880, 1174.66, 1760]; // Acorde D5 - A5 - D6 - A6
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + idx * 0.035);

      gain.gain.setValueAtTime(0.001, now + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.035 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.035 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.58);
    });
  }

  // Efeito Sonoro 4: Sub-Bass Impact no Gancho Inicial
  playBassImpact() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.45);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Efeito Sonoro 5: Ping Duplo de Conversão / CTA WhatsApp
  playNotificationPing() {
    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.09;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.3);
    });
  }
}

/* ==========================================================================
   CONTROLADOR PRINCIPAL DO PLAYER 9:16
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const sfx = new StudioSFXEngine();
  const audioPlayer = new Audio();
  audioPlayer.preload = "auto";
  // Playback levemente dinâmico (1.12x) para fechar ~60 segundos cravados com ritmo de Reels
  const PLAYBACK_SPEED = 1.12;

  let currentSceneIdx = 0;
  let isPlaying = false;
  let firedCues = new Set();
  let rafId = null;
  let sceneWordChunks = [];

  // Elementos DOM
  const startOverlay = document.getElementById("startSoundOverlay");
  const playPauseBtn = document.getElementById("reelPlayPauseBtn");
  const iconPlay = document.getElementById("reelIconPlay");
  const iconPause = document.getElementById("reelIconPause");
  const muteBtn = document.getElementById("reelMuteBtn");
  const sfxToggleBtn = document.getElementById("sfxStatusTag");
  const fullscreenBtn = document.getElementById("reelFullscreenBtn");
  const phoneFrame = document.getElementById("phoneFrame916");
  const timeLabel = document.getElementById("reelTimeLabel");
  const voiceWavePill = document.getElementById("voiceWavePill");
  const captionContainer = document.getElementById("captionKaraokePill");
  const visualFlash = document.getElementById("sfxVisualFlash");

  const sceneEls = document.querySelectorAll(".avatar-scene");
  const storyFills = document.querySelectorAll(".story-seg-fill");
  const storySegs = document.querySelectorAll(".story-seg");
  const jumpPills = document.querySelectorAll(".scene-jump-pill");

  // Divide o texto da cena em blocos de 6 palavras para legenda dinâmica estilo Reels
  function buildWordChunks(text) {
    const words = text.trim().split(/\s+/);
    const chunks = [];
    const chunkSize = 6;
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize));
    }
    return { totalWords: words.length, chunks };
  }

  function renderCaptionProgress(progressRatio) {
    if (!sceneWordChunks || !sceneWordChunks.chunks.length) return;
    const totalWords = sceneWordChunks.totalWords;
    const currentGlobalWordIdx = Math.min(
      totalWords - 1,
      Math.floor(progressRatio * totalWords)
    );

    let accumulated = 0;
    let activeChunk = sceneWordChunks.chunks[0];
    let chunkStartIdx = 0;

    for (const chunk of sceneWordChunks.chunks) {
      if (currentGlobalWordIdx < accumulated + chunk.length) {
        activeChunk = chunk;
        chunkStartIdx = accumulated;
        break;
      }
      accumulated += chunk.length;
    }

    captionContainer.innerHTML = activeChunk
      .map((word, idx) => {
        const wordGlobalIdx = chunkStartIdx + idx;
        if (wordGlobalIdx === currentGlobalWordIdx) {
          return `<span class="caption-word active-word">${word}</span>`;
        } else if (wordGlobalIdx < currentGlobalWordIdx) {
          return `<span class="caption-word spoken">${word}</span>`;
        }
        return `<span class="caption-word">${word}</span>`;
      })
      .join(" ");
  }

  function triggerVisualFlash() {
    if (!visualFlash) return;
    visualFlash.classList.add("trigger");
    setTimeout(() => visualFlash.classList.remove("trigger"), 220);
  }

  function resetAllMotionGraphics() {
    document.querySelectorAll(".mg-item").forEach((el) => {
      el.classList.remove("mg-visible");
    });
    firedCues.clear();
  }

  function loadScene(index, autoPlay = true) {
    if (index < 0 || index >= AVATAR_SCENES.length) index = 0;
    currentSceneIdx = index;
    const sceneData = AVATAR_SCENES[index];

    // Atualiza Cenas Visuais
    sceneEls.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });

    // Atualiza Pílulas de Salto
    jumpPills.forEach((pill, i) => {
      pill.classList.toggle("active", i === index);
    });

    // Atualiza Barras de Stories Anteriores/Futuras
    storyFills.forEach((fill, i) => {
      if (i < index) fill.style.width = "100%";
      else if (i > index) fill.style.width = "0%";
      else fill.style.width = "0%";
    });

    resetAllMotionGraphics();
    sceneWordChunks = buildWordChunks(sceneData.text);
    renderCaptionProgress(0);
    triggerVisualFlash();

    audioPlayer.src = sceneData.audioFile;
    audioPlayer.playbackRate = PLAYBACK_SPEED;

    if (autoPlay) {
      audioPlayer
        .play()
        .then(() => {
          setPlayingState(true);
        })
        .catch(() => {
          setPlayingState(false);
        });
    }
  }

  function setPlayingState(playing) {
    isPlaying = playing;
    if (iconPlay && iconPause) {
      iconPlay.style.display = playing ? "none" : "block";
      iconPause.style.display = playing ? "block" : "none";
    }
    if (voiceWavePill) {
      voiceWavePill.classList.toggle("paused", !playing);
    }
    if (playing) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateLoop);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }

  function getElapsedBeforeScene(sceneIndex) {
    let sum = 0;
    for (let i = 0; i < sceneIndex; i++) {
      sum += AVATAR_SCENES[i].fallbackDuration / PLAYBACK_SPEED;
    }
    return sum;
  }

  function getTotalVideoDuration() {
    return AVATAR_SCENES.reduce(
      (acc, sc) => acc + sc.fallbackDuration / PLAYBACK_SPEED,
      0
    );
  }

  function updateLoop() {
    if (!isPlaying) return;

    const sceneData = AVATAR_SCENES[currentSceneIdx];
    const curTime = audioPlayer.currentTime || 0;
    const rawDur =
      audioPlayer.duration && !isNaN(audioPlayer.duration)
        ? audioPlayer.duration
        : sceneData.fallbackDuration;

    const progress = Math.min(1, curTime / Math.max(0.1, rawDur));

    // 1. Barra de Story da Cena Atual
    if (storyFills[currentSceneIdx]) {
      storyFills[currentSceneIdx].style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // 2. Legenda Karaoke Palavra por Palavra
    renderCaptionProgress(progress);

    // 3. Disparo de Motion Graphics HUD + Efeitos Sonoros (SFX)
    sceneData.cues.forEach((cue) => {
      const cueKey = `${currentSceneIdx}-${cue.targetId}`;
      if (curTime >= cue.time && !firedCues.has(cueKey)) {
        firedCues.add(cueKey);
        const el = document.getElementById(cue.targetId.trim());
        if (el) {
          el.classList.add("mg-visible");
          sfx.trigger(cue.sfx);
        }
      }
    });

    // 4. Relógio Geral (~01:00)
    const globalElapsed =
      getElapsedBeforeScene(currentSceneIdx) + curTime / PLAYBACK_SPEED;
    const totalDur = getTotalVideoDuration();
    if (timeLabel) {
      timeLabel.textContent = `${formatTime(globalElapsed)} / ${formatTime(totalDur)}`;
    }

    rafId = requestAnimationFrame(updateLoop);
  }

  // Quando termina o áudio de uma cena, avança automaticamente para a próxima
  audioPlayer.addEventListener("ended", () => {
    if (currentSceneIdx < AVATAR_SCENES.length - 1) {
      loadScene(currentSceneIdx + 1, true);
    } else {
      // Fim do vídeo de 1 minuto
      if (storyFills[currentSceneIdx]) {
        storyFills[currentSceneIdx].style.width = "100%";
      }
      setPlayingState(false);
    }
  });

  // Clique no Overlay Inicial para liberar Áudio + Web Audio SFX
  if (startOverlay) {
    startOverlay.addEventListener("click", () => {
      sfx.init();
      startOverlay.classList.add("hidden");
      loadScene(0, true);
    });
  }

  // Botão Play / Pause
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      sfx.init();
      if (startOverlay && !startOverlay.classList.contains("hidden")) {
        startOverlay.classList.add("hidden");
        loadScene(0, true);
        return;
      }
      if (isPlaying) {
        audioPlayer.pause();
        setPlayingState(false);
      } else {
        if (
          currentSceneIdx === AVATAR_SCENES.length - 1 &&
          audioPlayer.ended
        ) {
          loadScene(0, true);
        } else {
          audioPlayer.play();
          setPlayingState(true);
        }
      }
    });
  }

  // Botão Mute / Unmute Voz
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      audioPlayer.muted = !audioPlayer.muted;
      muteBtn.style.opacity = audioPlayer.muted ? "0.45" : "1";
    });
  }

  // Toggle SFX On/Off
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener("click", () => {
      sfx.enabled = !sfx.enabled;
      sfxToggleBtn.textContent = sfx.enabled ? "🔊 SFX ON" : "🔇 SFX OFF";
      sfxToggleBtn.style.opacity = sfx.enabled ? "1" : "0.5";
    });
  }

  // Botão Tela Cheia 9:16
  if (fullscreenBtn && phoneFrame) {
    fullscreenBtn.addEventListener("click", () => {
      phoneFrame.classList.toggle("fullscreen-mode");
    });
  }

  // Clique nas barras de story ou pílulas de cena
  storySegs.forEach((seg, idx) => {
    seg.addEventListener("click", () => {
      sfx.init();
      if (startOverlay) startOverlay.classList.add("hidden");
      loadScene(idx, true);
    });
  });

  jumpPills.forEach((pill, idx) => {
    pill.addEventListener("click", () => {
      sfx.init();
      if (startOverlay) startOverlay.classList.add("hidden");
      loadScene(idx, true);
    });
  });

  // Inicializa visualmente na Cena 0 pausado aguardando o toque para som
  sceneWordChunks = buildWordChunks(AVATAR_SCENES[0].text);
  renderCaptionProgress(0);
});
