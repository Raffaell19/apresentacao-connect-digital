/**
 * CONNECT DIGITAL — MOTION GRAPHICS ENGINE 16:9 (60 FPS)
 * Sincronização de Cenas, Áudio Narrado Nativo e Animações GSAP
 */

document.addEventListener('DOMContentLoaded', () => {

  // Definição das Cenas e Timings (Sincronizado com os áudios humanizados da Francisca Neural)
  const SCENES = [
    {
      id: 1,
      title: "O Diagnóstico dos Prestadores",
      duration: 16.9,
      audioId: "audioScene1"
    },
    {
      id: 2,
      title: "Google Ads & Intenção Imediata",
      duration: 13.1,
      audioId: "audioScene2"
    },
    {
      id: 3,
      title: "Redes Sociais & Mosaico Multi-Nicho",
      duration: 12.3,
      audioId: "audioScene3"
    },
    {
      id: 4,
      title: "O Destino: Landing Page de Alta Conversão",
      duration: 14.7,
      audioId: "audioScene4"
    },
    {
      id: 5,
      title: "I.A. 24/7 + Chatbot WhatsApp + CRM",
      duration: 22.1,
      audioId: "audioScene5"
    },
    {
      id: 6,
      title: "Connect Digital: Seu Diagnóstico Estratégico",
      duration: 11.4,
      audioId: "audioScene6"
    }
  ];

  const totalDuration = SCENES.reduce((acc, s) => acc + s.duration, 0);

  // Elementos da UI
  const playPauseBtn = document.getElementById('playPauseBtn');
  const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
  const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
  const restartBtn = document.getElementById('restartBtn');
  const muteBtn = document.getElementById('muteBtn');
  const iconUnmuted = muteBtn ? muteBtn.querySelector('.icon-unmuted') : null;
  const iconMuted = muteBtn ? muteBtn.querySelector('.icon-muted') : null;
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const timeDisplay = document.getElementById('timeDisplay');
  const sceneBadge = document.getElementById('sceneBadge');
  const sceneTitleTag = document.getElementById('sceneTitleTag');
  const scenePills = document.querySelectorAll('.pill-btn');

  // Estado do Player
  let currentSceneIndex = 0;
  let isPlaying = false;
  let isMuted = false;
  let sceneTimer = null;
  let progressInterval = null;
  let sceneElapsed = 0;
  let currentAudio = null;

  // Web Audio Context para Efeitos Sonoros Sutis (Pop do WhatsApp)
  let audioCtx = null;
  function playPopChime() {
    if (isMuted) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  }

  /* ==========================================================================
     1. GERENCIAMENTO DE TRANSIÇÃO DE CENAS
     ========================================================================== */
  function showScene(index) {
    if (index < 0 || index >= SCENES.length) return;

    // Para áudio anterior
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentSceneIndex = index;
    const sceneData = SCENES[index];

    // Atualiza classes ativas nos painéis
    document.querySelectorAll('.scene-panel').forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('active');
        triggerSceneAnimations(i + 1);
      } else {
        panel.classList.remove('active');
      }
    });

    // Atualiza Pills da Barra de Controle
    scenePills.forEach((pill, i) => {
      if (i === index) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    // Atualiza cabeçalho indicador
    if (sceneBadge) sceneBadge.textContent = `CENA 0${index + 1} / 0${SCENES.length}`;
    if (sceneTitleTag) sceneTitleTag.textContent = sceneData.title;

    // Toca áudio correspondente se estiver em modo play
    currentAudio = document.getElementById(sceneData.audioId);
    if (currentAudio) {
      currentAudio.muted = isMuted;
      currentAudio.currentTime = 0;
      if (isPlaying) {
        currentAudio.play().catch(() => {});
      }
    }

    sceneElapsed = 0;
  }

  /* ==========================================================================
     2. ANIMAÇÕES ESPECÍFICAS DE CADA CENA (MOTION GRAPHICS 60FPS)
     ========================================================================== */
  function triggerSceneAnimations(sceneNumber) {
    if (typeof gsap === 'undefined') return;

    if (sceneNumber === 1) {
      // Animação das barras de comparação
      gsap.fromTo('.bar-danger', { width: '0%' }, { width: '25%', duration: 1.2, ease: 'power2.out' });
      gsap.fromTo('.bar-cyan', { width: '0%' }, { width: '95%', duration: 1.5, delay: 0.3, ease: 'power2.out' });
      gsap.fromTo('.niche-chip', { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, delay: 0.5, ease: 'back.out(1.5)' });
    }

    if (sceneNumber === 2) {
      // Efeito de digitação no Google e pop do anúncio
      const typingEl = document.getElementById('typingQuery');
      if (typingEl) {
        typingEl.textContent = "";
        const text = "dentista em porto alegre";
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < text.length) {
            typingEl.textContent += text.charAt(charIndex);
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 80);
      }
      gsap.fromTo('.google-ad-card', { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, delay: 0.8, duration: 0.6, ease: 'back.out(1.7)' });
    }

    if (sceneNumber === 3) {
      // Feed do Instagram em Smartphone com rolagem fluida e pausas naturais
      gsap.fromTo('#scene3 .phone-frame', 
        { scale: 0.94, opacity: 0, y: 25 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      const feedTrack = document.getElementById('instaFeedTrack');
      if (feedTrack) {
        gsap.killTweensOf(feedTrack);
        gsap.set(feedTrack, { y: 0 });

        const instaTl = gsap.timeline({ delay: 0.8 });
        // Transição para o Post 2 (Restaurante Rancho da Âncora)
        instaTl.to(feedTrack, { y: -290, duration: 1.6, ease: 'power2.inOut' }, "+=1.2")
        // Transição para o Post 3 (Terra Verde Jardinagem)
               .to(feedTrack, { y: -580, duration: 1.6, ease: 'power2.inOut' }, "+=1.4")
        // Transição para o Post 4 (Alves Instaladora Elétrica 24h)
               .to(feedTrack, { y: -870, duration: 1.6, ease: 'power2.inOut' }, "+=1.4");
      }
    }

    if (sceneNumber === 4) {
      // Landing Page em Smartphone Mobile First rolando a estrutura completa
      gsap.fromTo('#scene4 .phone-frame', 
        { scale: 0.94, opacity: 0, y: 25 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo('.lp-phone-floating-wa', 
        { scale: 0 }, 
        { scale: 1, delay: 0.6, duration: 0.4, ease: 'back.out(2)' }
      );

      const lpTrack = document.getElementById('lpScrollTrack');
      if (lpTrack) {
        gsap.killTweensOf(lpTrack);
        gsap.set(lpTrack, { y: 0 });

        const lpTl = gsap.timeline({ delay: 0.9 });
        // Rola revelando Provas Sociais e Abas de Tratamentos
        lpTl.to(lpTrack, { y: -190, duration: 2.0, ease: 'power2.inOut' }, "+=1.6")
        // Rola revelando Formulário VIP e CTA do WhatsApp
            .to(lpTrack, { y: -380, duration: 2.2, ease: 'power2.inOut' }, "+=2.0");
      }
    }

    if (sceneNumber === 5) {
      // Split Screen: Mensagens da I.A. no WhatsApp + Card animado no CRM
      const msgs = ['iaMsg1', 'iaMsg2', 'iaMsg3', 'iaMsg4'];
      msgs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
      });

      const crmLiveCard = document.getElementById('crmLiveCard');
      if (crmLiveCard) crmLiveCard.classList.remove('show');

      // Sequência Sincronizada com a fala de 22s:
      // 1.5s: Paciente pergunta
      setTimeout(() => {
        const m1 = document.getElementById('iaMsg1');
        if (m1) { m1.classList.add('show'); playPopChime(); }
      }, 1500);

      // 4.5s: Chatbot I.A. responde tirando dúvidas e propondo horário
      setTimeout(() => {
        const m2 = document.getElementById('iaMsg2');
        if (m2) { m2.classList.add('show'); playPopChime(); }
      }, 4800);

      // 9.0s: Paciente escolhe 15h
      setTimeout(() => {
        const m3 = document.getElementById('iaMsg3');
        if (m3) { m3.classList.add('show'); playPopChime(); }
      }, 9200);

      // 12.5s: Chatbot I.A. confirma e sincroniza com CRM
      setTimeout(() => {
        const m4 = document.getElementById('iaMsg4');
        if (m4) { m4.classList.add('show'); playPopChime(); }
      }, 12800);

      // 15.5s: Card entra automaticamente na coluna do CRM com destaque
      setTimeout(() => {
        if (crmLiveCard) {
          crmLiveCard.classList.add('show');
          playPopChime();
          gsap.fromTo(crmLiveCard, 
            { scale: 0.8, boxShadow: '0 0 0px var(--cyan-neon)' }, 
            { scale: 1, boxShadow: '0 0 25px rgba(0, 180, 255, 0.6)', duration: 0.6, ease: 'back.out(2)' }
          );
        }
      }, 15500);
    }

    if (sceneNumber === 6) {
      // Logo Connect Digital e CTA final
      gsap.fromTo('.closing-brand-icon', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' });
      gsap.fromTo('.btn-cta-motion', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, delay: 0.4, duration: 0.6, ease: 'back.out(2)' });
    }
  }

  /* ==========================================================================
     3. MOTOR DE REPRODUÇÃO CONTÍNUA & PROGRESS BAR (60FPS)
     ========================================================================== */
  function play() {
    isPlaying = true;
    if (iconPlay) iconPlay.style.display = 'none';
    if (iconPause) iconPause.style.display = 'block';

    if (currentAudio) {
      currentAudio.play().catch(() => {});
    }

    clearInterval(progressInterval);
    progressInterval = setInterval(updateProgress, 100);

    // Inicia contagem regressiva da cena atual
    scheduleNextScene();
  }

  function pause() {
    isPlaying = false;
    if (iconPlay) iconPlay.style.display = 'block';
    if (iconPause) iconPause.style.display = 'none';

    if (currentAudio) {
      currentAudio.pause();
    }

    clearInterval(progressInterval);
    clearTimeout(sceneTimer);
  }

  function scheduleNextScene() {
    clearTimeout(sceneTimer);
    const sceneData = SCENES[currentSceneIndex];
    const remainingTime = Math.max(0, (sceneData.duration - sceneElapsed) * 1000);

    sceneTimer = setTimeout(() => {
      if (currentSceneIndex < SCENES.length - 1) {
        showScene(currentSceneIndex + 1);
        if (isPlaying) scheduleNextScene();
      } else {
        // Fim da apresentação
        pause();
      }
    }, remainingTime);
  }

  function updateProgress() {
    if (!isPlaying) return;

    sceneElapsed += 0.1;

    // Calcula tempo global percorrido
    let globalElapsed = 0;
    for (let i = 0; i < currentSceneIndex; i++) {
      globalElapsed += SCENES[i].duration;
    }
    globalElapsed += Math.min(sceneElapsed, SCENES[currentSceneIndex].duration);

    const percent = Math.min(100, (globalElapsed / totalDuration) * 100);
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;

    // Atualiza marcador de tempo mm:ss
    if (timeDisplay) {
      const curM = Math.floor(globalElapsed / 60);
      const curS = Math.floor(globalElapsed % 60);
      const totM = Math.floor(totalDuration / 60);
      const totS = Math.floor(totalDuration % 60);
      timeDisplay.textContent = `${pad(curM)}:${pad(curS)} / ${pad(totM)}:${pad(totS)}`;
    }
  }

  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  /* ==========================================================================
     4. CONTROLES E LISTENERS
     ========================================================================== */
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (isPlaying) pause();
      else play();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      pause();
      showScene(0);
      play();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (currentAudio) currentAudio.muted = isMuted;
      if (iconUnmuted) iconUnmuted.style.display = isMuted ? 'none' : 'block';
      if (iconMuted) iconMuted.style.display = isMuted ? 'block' : 'none';
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // Seletor de Cenas via Pills
  scenePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetScene = parseInt(pill.getAttribute('data-scene'), 10) - 1;
      showScene(targetScene);
      if (isPlaying) scheduleNextScene();
    });
  });

  // Clique na barra de progresso para pular
  if (progressBarContainer) {
    progressBarContainer.addEventListener('click', (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const clickPercent = (e.clientX - rect.left) / rect.width;
      const targetTime = clickPercent * totalDuration;

      // Descobre qual cena corresponde ao tempo
      let accumulated = 0;
      for (let i = 0; i < SCENES.length; i++) {
        if (targetTime <= accumulated + SCENES[i].duration || i === SCENES.length - 1) {
          showScene(i);
          sceneElapsed = targetTime - accumulated;
          if (currentAudio) currentAudio.currentTime = Math.max(0, sceneElapsed);
          if (isPlaying) scheduleNextScene();
          break;
        }
        accumulated += SCENES[i].duration;
      }
    });
  }

  // Atalhos de Teclado (Espaço = Play/Pause, M = Mute, F = Fullscreen)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (isPlaying) pause();
      else play();
    } else if (e.code === 'KeyM') {
      if (muteBtn) muteBtn.click();
    } else if (e.code === 'KeyF') {
      if (fullscreenBtn) fullscreenBtn.click();
    }
  });

  // Inicializa a primeira cena pronta
  showScene(0);

});

