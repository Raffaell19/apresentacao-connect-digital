/**
 * CONNECT DIGITAL — MOTION GRAPHICS ENGINE 16:9 (60 FPS)
 * Sincronização de Cenas, Áudio Narrado Nativo e Animações GSAP
 */

document.addEventListener('DOMContentLoaded', () => {

  // Definição das Cenas e Timings (Sincronizado com os áudios humanizados da Eric — ElevenLabs)
  const SCENES = [
    {
      id: 0,
      title: "Proposta Comercial",
      duration: 3.0,
      audioId: "audioScene0"
    },
    {
      id: 1,
      title: "Alavancagem & Estrutura Enxuta",
      duration: 29.2,
      audioId: "audioScene1"
    },
    {
      id: 2,
      title: "Google Ads & Intenção Imediata",
      duration: 12.2,
      audioId: "audioScene2"
    },
    {
      id: 3,
      title: "Redes Sociais & Mosaico Multi-Nicho",
      duration: 11.2,
      audioId: "audioScene3"
    },
    {
      id: 4,
      title: "O Destino: Landing Page de Alta Conversão",
      duration: 11.0,
      audioId: "audioScene4"
    },
    {
      id: 5,
      title: "I.A. 24/7 + Chatbot WhatsApp + CRM",
      duration: 16.8,
      audioId: "audioScene5"
    },
    {
      id: 6,
      title: "Connect Digital: Seu Diagnóstico Estratégico",
      duration: 8.2,
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

  // Gerenciamento de Timers das Animações
  let activeTimeouts = [];
  function clearAllActiveTimeouts() {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts = [];
  }
  function registerTimeout(fn, delay) {
    const t = setTimeout(fn, delay);
    activeTimeouts.push(t);
    return t;
  }

  /* ==========================================================================
     INDICADOR TOUCH ANIMADO (BOLINHA INTERATIVA 60FPS)
     ========================================================================== */
  const virtualCursor = document.getElementById('virtualCursor');
  const cursorRipple = document.getElementById('cursorRipple');
  const stageCanvas = document.querySelector('.stage-canvas');

  function moveCursor(targetX, targetY, options = {}) {
    if (!virtualCursor) return;
    const { duration = 0.8, delay = 0, clickAfter = null, onComplete = null } = options;

    gsap.to(virtualCursor, {
      x: targetX,
      y: targetY,
      opacity: 1,
      duration: duration,
      delay: delay,
      ease: 'power2.out',
      onComplete: () => {
        if (clickAfter !== null) {
          registerTimeout(() => {
            triggerCursorClick(onComplete);
          }, clickAfter * 1000);
        } else if (onComplete) {
          onComplete();
        }
      }
    });
  }

  function moveCursorToElement(selector, options = {}) {
    if (!virtualCursor || !stageCanvas) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;

    const canvasRect = stageCanvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const offsetX = options.offsetX !== undefined ? options.offsetX : (elRect.width / 2);
    const offsetY = options.offsetY !== undefined ? options.offsetY : (elRect.height / 2);

    const targetX = (elRect.left - canvasRect.left) + offsetX;
    const targetY = (elRect.top - canvasRect.top) + offsetY;

    moveCursor(targetX, targetY, options);
  }

  function triggerCursorClick(callback) {
    if (!virtualCursor) return;
    virtualCursor.classList.add('active-click');
    if (cursorRipple) {
      cursorRipple.classList.remove('ripple-active');
      void cursorRipple.offsetWidth;
      cursorRipple.classList.add('ripple-active');
    }
    playPopChime();
    setTimeout(() => {
      virtualCursor.classList.remove('active-click');
      if (callback) callback();
    }, 180);
  }

  function hideCursor() {
    if (!virtualCursor) return;
    gsap.to(virtualCursor, { opacity: 0, duration: 0.3 });
  }

  /* ==========================================================================
     1. GERENCIAMENTO DE TRANSIÇÃO DE CENAS
     ========================================================================== */
  function showScene(index) {
    if (index < 0 || index >= SCENES.length) return;

    // Cancela timers da cena anterior
    clearAllActiveTimeouts();

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
        triggerSceneAnimations(sceneData.id);
      } else {
        panel.classList.remove('active');
      }
    });

    // Atualiza Pills da Barra de Controle
    scenePills.forEach((pill) => {
      const pIndex = parseInt(pill.getAttribute('data-scene'), 10);
      if (pIndex === index) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    // Atualiza cabeçalho indicador
    if (sceneData.id === 0) {
      if (sceneBadge) sceneBadge.textContent = "ABERTURA";
      if (sceneTitleTag) sceneTitleTag.textContent = "Proposta Comercial";
      gsap.to('.stage-header', { opacity: 0, duration: 0.25 });
    } else {
      if (sceneBadge) sceneBadge.textContent = `CENA 0${sceneData.id} / 06`;
      if (sceneTitleTag) sceneTitleTag.textContent = sceneData.title;
      gsap.to('.stage-header', { opacity: 1, duration: 0.35 });
    }

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

    if (sceneNumber === 0) {
      // 0. Abertura Oficial: PROPOSTA COMERCIAL (4.2s)
      hideCursor();
      gsap.to('.stage-header', { opacity: 0, duration: 0.25 });

      gsap.fromTo('.hero-proposta-comercial', 
        { scale: 0.88, opacity: 0, filter: 'blur(12px)' }, 
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }
      );
    }

    if (sceneNumber === 1) {
      // 1. Alavancagem & Estrutura Enxuta em 3 Atos Sincronizados (29.2s)
      gsap.to('.stage-header', { opacity: 1, duration: 0.35 });

      const step1 = document.getElementById('stepIndicator1');
      const step2 = document.getElementById('stepIndicator2');
      const step3 = document.getElementById('stepIndicator3');

      const panel1 = document.getElementById('panelGrowth');
      const panel2 = document.getElementById('panelTools');
      const panel3 = document.getElementById('panelLeverage');

      const tagText = document.getElementById('alavancagemTagText');
      const heroTitle = document.getElementById('alavancagemTitle');
      const descText = document.getElementById('alavancagemDesc');
      const pIcon1 = document.getElementById('pillarIcon1');
      const pText1 = document.getElementById('pillarText1');
      const pIcon2 = document.getElementById('pillarIcon2');
      const pText2 = document.getElementById('pillarText2');

      const growthVal = document.getElementById('growthCounterVal');
      const toolGoogle = document.getElementById('toolCardGoogle');
      const toolMeta = document.getElementById('toolCardMeta');
      const toolWa = document.getElementById('toolCardWa');

      const dangerBlock = document.getElementById('dangerSideBlock');
      const successBlock = document.getElementById('successSideBlock');
      const dangerBar = document.getElementById('leakDangerBar');
      const successBar = document.getElementById('leakSuccessBar');

      // Helper para alternar painéis com transição suave
      function switchPanel(activePanel) {
        [panel1, panel2, panel3].forEach(p => {
          if (!p) return;
          if (p === activePanel) {
            p.classList.add('active');
            gsap.fromTo(p, { opacity: 0, y: 15, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' });
          } else {
            p.classList.remove('active');
          }
        });
      }

      function setStepper(activeStep) {
        [step1, step2, step3].forEach(s => {
          if (!s) return;
          if (s === activeStep) s.classList.add('active');
          else s.classList.remove('active');
        });
      }

      // Reset Inicial -> ATO 1
      setStepper(step1);
      switchPanel(panel1);
      if (tagText) tagText.textContent = "Parceria Comercial Estratégica";
      if (heroTitle) heroTitle.innerHTML = 'CRESCIMENTO CONJUNTO & <span class="highlight-cyan">FATURAMENTO</span>';
      if (descText) descText.textContent = "Nosso compromisso é direto: fazer a sua empresa crescer para crescermos juntos, conquistando o faturamento que é nosso por direito.";
      if (pIcon1) pIcon1.textContent = "🤝";
      if (pText1) pText1.textContent = "Alinhamento Total de Interesses";
      if (pIcon2) pIcon2.textContent = "📈";
      if (pText2) pText2.textContent = "Salto de Faturamento Real";

      if (toolGoogle) toolGoogle.classList.remove('highlight');
      if (toolMeta) toolMeta.classList.remove('highlight');
      if (toolWa) toolWa.classList.remove('highlight');

      if (dangerBlock) dangerBlock.classList.remove('pulse-highlight');
      if (successBlock) successBlock.classList.remove('pulse-highlight');
      if (dangerBar) dangerBar.style.width = '0%';
      if (successBar) successBar.style.width = '0%';

      // Posição inicial da bolinha touch
      if (virtualCursor) gsap.set(virtualCursor, { x: 120, y: 190, opacity: 0 });

      // Animação da Curva de Crescimento (Ato 1)
      if (growthVal) {
        let count = 0;
        const iv = setInterval(() => {
          count += 1750;
          if (count >= 28400) {
            count = 28400;
            clearInterval(iv);
          }
          growthVal.textContent = "+ R$ " + count.toLocaleString('pt-BR');
        }, 40);
      }

      // 1.2s: Bolinha destaca o título do Crescimento
      registerTimeout(() => {
        moveCursorToElement('#alavancagemTitle', {
          duration: 0.9,
          clickAfter: 0.15
        });
      }, 1200);

      // 4.5s: "...conquistando o faturamento que é nosso por direito..." -> Bolinha clica no salto do gráfico
      registerTimeout(() => {
        moveCursorToElement('#chartTargetTag', {
          duration: 1.0,
          clickAfter: 0.25,
          onComplete: () => {
            const tag = document.getElementById('chartTargetTag');
            if (tag) gsap.to(tag, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 });
          }
        });
      }, 4500);

      // ======================================================================
      // 8.5s: ATO 2 — FERRAMENTAS CERTAS & CLIENTE IDEAL
      // "...Através das ferramentas certas de posicionamento e inteligência artificial..."
      // ======================================================================
      registerTimeout(() => {
        setStepper(step2);
        switchPanel(panel2);
        playPopChime();

        // Transição da coluna esquerda
        gsap.fromTo(['#alavancagemTag', '#alavancagemTitle', '#alavancagemDesc', '#alavancagemPillars'], 
          { opacity: 0, y: 8 }, 
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }
        );

        if (tagText) tagText.textContent = "Posicionamento Cirúrgico & I.A.";
        if (heroTitle) heroTitle.innerHTML = 'FERRAMENTAS CERTAS & <span class="highlight-cyan">CLIENTE IDEAL</span>';
        if (descText) descText.textContent = "Colocamos seu negócio diante do cliente ideal com uma estrutura minimalista e inteligente, unindo Google, redes sociais e I.A. no WhatsApp.";
        if (pIcon1) pIcon1.textContent = "🎯";
        if (pText1) pText1.textContent = "Cliente Ideal no Radar";
        if (pIcon2) pIcon2.textContent = "⚡";
        if (pText2) pText2.textContent = "100% no Piloto Automático";
      }, 8500);

      // 10.0s: Bolinha toca na Ferramenta 1 (Google Search)
      registerTimeout(() => {
        if (toolGoogle) toolGoogle.classList.add('highlight');
        moveCursorToElement('#toolCardGoogle', {
          duration: 0.7,
          clickAfter: 0.15
        });
      }, 10000);

      // 12.5s: Bolinha toca na Ferramenta 2 (Meta Ads)
      registerTimeout(() => {
        if (toolMeta) toolMeta.classList.add('highlight');
        moveCursorToElement('#toolCardMeta', {
          duration: 0.7,
          clickAfter: 0.15
        });
      }, 12500);

      // 15.0s: Bolinha toca na Ferramenta 3 (I.A. WhatsApp)
      registerTimeout(() => {
        if (toolWa) toolWa.classList.add('highlight');
        moveCursorToElement('#toolCardWa', {
          duration: 0.7,
          clickAfter: 0.15
        });
      }, 15000);

      // 16.8s: Bolinha centraliza no Cliente Ideal Convertido
      registerTimeout(() => {
        moveCursorToElement('.tools-center-target', {
          duration: 0.8,
          clickAfter: 0.2
        });
      }, 16800);

      // ======================================================================
      // 18.0s: ATO 3 — ALAVANCAGEM & ZERO FUNCIONÁRIOS
      // "...sem precisar contratar novos funcionários e sem inflar sua folha de pagamento..."
      // ======================================================================
      registerTimeout(() => {
        setStepper(step3);
        switchPanel(panel3);
        playPopChime();

        // Transição da coluna esquerda
        gsap.fromTo(['#alavancagemTag', '#alavancagemTitle', '#alavancagemDesc', '#alavancagemPillars'], 
          { opacity: 0, y: 8 }, 
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }
        );

        if (tagText) tagText.textContent = "Máxima Eficiência Operacional";
        if (heroTitle) heroTitle.innerHTML = 'ESTRUTURA ENXUTA & <span class="highlight-cyan">LUCRO NO BOLSO</span>';
        if (descText) descText.textContent = "Sem precisar contratar novos funcionários e sem inflar sua folha de pagamento. Menos atrito, máxima eficiência e lucro real retido no seu bolso.";
        if (pIcon1) pIcon1.textContent = "❌";
        if (pText1) pText1.textContent = "Zero Custo de Equipe CLT";
        if (pIcon2) pIcon2.textContent = "💰";
        if (pText2) pText2.textContent = "Máximo Lucro Líquido";

        if (dangerBlock) dangerBlock.classList.add('pulse-highlight');
        if (dangerBar) dangerBar.style.width = '85%';
      }, 18000);

      // 20.0s: Bolinha aponta o risco de folha inflada
      registerTimeout(() => {
        moveCursorToElement('#dangerSideBlock', {
          offsetX: 110,
          offsetY: 60,
          duration: 0.9,
          clickAfter: 0.2
        });
      }, 20000);

      // 23.0s: "...máxima eficiência e lucro real..." -> Bolinha cruza para a estrutura enxuta
      registerTimeout(() => {
        if (successBlock) successBlock.classList.add('pulse-highlight');
        if (successBar) successBar.style.width = '98%';
        moveCursorToElement('#successSideBlock', {
          offsetX: 110,
          offsetY: 60,
          duration: 1.0,
          clickAfter: 0.25
        });
      }, 23000);

      // 26.5s: Bolinha pousa no rodapé de conclusão
      registerTimeout(() => {
        moveCursorToElement('.leak-card-footer', {
          duration: 0.8,
          offsetY: 15,
          clickAfter: 0.2
        });
      }, 26500);
    }

    if (sceneNumber === 2) {
      // 2. Google Ads & Intenção Imediata (13.1s)
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
        }, 75);
      }
      gsap.fromTo('.google-ad-card', { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, delay: 0.8, duration: 0.6, ease: 'back.out(1.7)' });

      // Cursor posiciona na busca do Google e depois clica em "Orçar no WhatsApp"
      registerTimeout(() => {
        moveCursorToElement('.google-search-bar', {
          duration: 0.9,
          offsetY: 16
        });
      }, 600);

      registerTimeout(() => {
        moveCursorToElement('.ad-btn.whatsapp', {
          duration: 1.1,
          clickAfter: 0.3,
          onComplete: () => {
            const btn = document.querySelector('.ad-btn.whatsapp');
            if (btn) {
              gsap.to(btn, { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1 });
            }
          }
        });
      }, 4800);
    }

    if (sceneNumber === 3) {
      // 3. Instagram & Facebook (12.3s)
      gsap.fromTo('#scene3 .phone-frame', 
        { scale: 0.94, opacity: 0, y: 15 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      const feedTrack = document.getElementById('instaFeedTrack');
      if (feedTrack) {
        gsap.killTweensOf(feedTrack);
        gsap.set(feedTrack, { y: 0 });

        const instaTl = gsap.timeline({ delay: 0.8 });
        instaTl.to(feedTrack, { y: -210, duration: 1.5, ease: 'power2.inOut' }, "+=1.2")
               .to(feedTrack, { y: -420, duration: 1.5, ease: 'power2.inOut' }, "+=1.4")
               .to(feedTrack, { y: -630, duration: 1.5, ease: 'power2.inOut' }, "+=1.4");
      }

      // Cursor inteligente rola o feed e clica no CTA do anúncio
      registerTimeout(() => {
        moveCursorToElement('#instaFeedViewport', {
          duration: 0.8,
          offsetY: 70
        });
      }, 700);

      registerTimeout(() => {
        moveCursorToElement('.insta-cta-bar', {
          duration: 0.9,
          clickAfter: 0.2,
          onComplete: () => {
            const cta = document.querySelector('.insta-cta-bar');
            if (cta) gsap.to(cta, { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 });
          }
        });
      }, 2600);

      // Acompanha a rolagem multi-nicho
      registerTimeout(() => {
        moveCursorToElement('#instaFeedViewport', {
          duration: 0.7,
          offsetY: 140
        });
      }, 5200);
    }

    if (sceneNumber === 4) {
      // Landing Page em Smartphone Mobile First rolando a estrutura completa
      gsap.fromTo('#scene4 .phone-frame', 
        { scale: 0.94, opacity: 0, y: 15 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo('.lp-phone-floating-wa', 
        { scale: 0 }, 
        { scale: 1, delay: 0.6, duration: 0.4, ease: 'back.out(2)' }
      );

      // Elementos do Formulário VIP de Alta Conversão
      const fieldNome = document.getElementById('fieldNome');
      const placeholderNome = document.getElementById('placeholderNome');
      const typingNome = document.getElementById('typingNome');
      const cursorNome = document.getElementById('cursorNome');

      const fieldPhone = document.getElementById('fieldPhone');
      const placeholderPhone = document.getElementById('placeholderPhone');
      const typingPhone = document.getElementById('typingPhone');
      const cursorPhone = document.getElementById('cursorPhone');

      const fieldSelect = document.getElementById('fieldSelect');
      const selectProcText = document.getElementById('selectProcText');

      const fieldSubmitBtn = document.getElementById('fieldSubmitBtn');
      const submitBtnIcon = document.getElementById('submitBtnIcon');
      const submitBtnLabel = document.getElementById('submitBtnLabel');
      const submitBtnArrow = document.getElementById('submitBtnArrow');
      const formToast = document.getElementById('formToast');

      // Reset inicial do Formulário
      if (fieldNome) {
        fieldNome.classList.remove('focused', 'filled');
        if (placeholderNome) placeholderNome.style.display = 'block';
        if (typingNome) typingNome.textContent = '';
        if (cursorNome) cursorNome.style.display = 'none';
      }
      if (fieldPhone) {
        fieldPhone.classList.remove('focused', 'filled');
        if (placeholderPhone) placeholderPhone.style.display = 'block';
        if (typingPhone) typingPhone.textContent = '';
        if (cursorPhone) cursorPhone.style.display = 'none';
      }
      if (fieldSelect) {
        fieldSelect.classList.remove('focused', 'filled');
        if (selectProcText) selectProcText.textContent = 'Selecione o procedimento...';
      }
      if (fieldSubmitBtn) {
        fieldSubmitBtn.classList.remove('active-tap', 'active-sent');
        if (submitBtnIcon) submitBtnIcon.textContent = '💬';
        if (submitBtnLabel) submitBtnLabel.textContent = 'Solicitar Orçamento no WhatsApp';
        if (submitBtnArrow) submitBtnArrow.style.display = 'inline';
      }
      if (formToast) formToast.classList.remove('show');

      const lpTrack = document.getElementById('lpScrollTrack');
      if (lpTrack) {
        gsap.killTweensOf(lpTrack);
        gsap.set(lpTrack, { y: 0 });

        const lpTl = gsap.timeline({ delay: 0.5 });
        // Rola revelando Provas Sociais e Abas de Tratamentos (1.0s)
        lpTl.to(lpTrack, { y: -140, duration: 1.1, ease: 'power2.inOut' }, "+=0.6")
        // Rola centralizando o Formulário VIP de Alta Conversão na tela (2.5s)
            .to(lpTrack, { y: -290, duration: 1.2, ease: 'power2.inOut' }, "+=0.6");
      }

      // Função de Digitação com Cursor Interativo
      function typeText(fieldEl, placeholderEl, typingEl, cursorEl, text, doneCb) {
        if (!fieldEl || !typingEl) return;
        fieldEl.classList.add('focused');
        if (placeholderEl) placeholderEl.style.display = 'none';
        if (cursorEl) cursorEl.style.display = 'inline-block';
        typingEl.textContent = '';
        let c = 0;
        const iv = setInterval(() => {
          if (c < text.length) {
            typingEl.textContent += text.charAt(c);
            c++;
          } else {
            clearInterval(iv);
            if (cursorEl) cursorEl.style.display = 'none';
            fieldEl.classList.remove('focused');
            fieldEl.classList.add('filled');
            if (doneCb) doneCb();
          }
        }, 50);
      }

      // Sincronização Perfeita com Cursor e Digitação
      registerTimeout(() => {
        moveCursorToElement('#fieldNome', {
          duration: 0.7,
          clickAfter: 0.1,
          onComplete: () => {
            typeText(fieldNome, placeholderNome, typingNome, cursorNome, "Mariana Silveira", () => {
              registerTimeout(() => {
                moveCursorToElement('#fieldPhone', {
                  duration: 0.6,
                  clickAfter: 0.1,
                  onComplete: () => {
                    typeText(fieldPhone, placeholderPhone, typingPhone, cursorPhone, "(51) 99877-7570", () => {
                      registerTimeout(() => {
                        moveCursorToElement('#fieldSelect', {
                          duration: 0.6,
                          clickAfter: 0.1,
                          onComplete: () => {
                            if (fieldSelect) {
                              fieldSelect.classList.add('focused');
                              registerTimeout(() => {
                                if (selectProcText) selectProcText.textContent = "✦ Harmonização Facial Sutil";
                                fieldSelect.classList.remove('focused');
                                fieldSelect.classList.add('filled');
                                playPopChime();

                                registerTimeout(() => {
                                  moveCursorToElement('#fieldSubmitBtn', {
                                    duration: 0.6,
                                    clickAfter: 0.15,
                                    onComplete: () => {
                                      if (fieldSubmitBtn) {
                                        fieldSubmitBtn.classList.add('active-tap');
                                        gsap.to(fieldSubmitBtn, { 
                                          scale: 0.94, 
                                          duration: 0.15, 
                                          yoyo: true, 
                                          repeat: 1, 
                                          ease: 'power2.inOut',
                                          onComplete: () => {
                                            fieldSubmitBtn.classList.remove('active-tap');
                                            fieldSubmitBtn.classList.add('active-sent');
                                            if (submitBtnIcon) submitBtnIcon.textContent = "✓";
                                            if (submitBtnLabel) submitBtnLabel.textContent = "Orçamento Solicitado!";
                                            if (submitBtnArrow) submitBtnArrow.style.display = "none";
                                            if (formToast) formToast.classList.add('show');

                                            gsap.fromTo('.lp-phone-floating-wa', 
                                              { scale: 1 }, 
                                              { scale: 1.25, duration: 0.22, yoyo: true, repeat: 3, ease: 'power2.inOut' }
                                            );
                                          }
                                        });
                                      }
                                    }
                                  });
                                }, 300);

                              }, 400);
                            }
                          }
                        });
                      }, 250);
                    });
                  }
                });
              }, 250);
            });
          }
        });
      }, 3200);
    }

    if (sceneNumber === 5) {
      // 5. I.A. 24/7 + CRM (16.8s)
      const msgs = ['iaMsg1', 'iaMsg2', 'iaMsg3', 'iaMsg4'];
      msgs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
      });

      const crmLiveCard = document.getElementById('crmLiveCard');
      if (crmLiveCard) crmLiveCard.classList.remove('show');

      // Cursor entra no chat do WhatsApp
      registerTimeout(() => {
        moveCursorToElement('.mini-wa-header', {
          duration: 0.6,
          offsetY: 20
        });
      }, 600);

      // 1.0s: Paciente pergunta
      registerTimeout(() => {
        const m1 = document.getElementById('iaMsg1');
        if (m1) { 
          m1.classList.add('show'); 
          playPopChime(); 
          moveCursorToElement(m1, { duration: 0.4 });
        }
      }, 1000);

      // 3.4s: Chatbot I.A. responde tirando dúvidas e propondo horário
      registerTimeout(() => {
        const m2 = document.getElementById('iaMsg2');
        if (m2) { 
          m2.classList.add('show'); 
          playPopChime(); 
          moveCursorToElement(m2, { duration: 0.5 });
        }
      }, 3400);

      // 6.8s: Paciente escolhe 15h
      registerTimeout(() => {
        const m3 = document.getElementById('iaMsg3');
        if (m3) { 
          m3.classList.add('show'); 
          playPopChime(); 
          moveCursorToElement(m3, { duration: 0.4 });
        }
      }, 6800);

      // 9.8s: Chatbot I.A. confirma e sincroniza com CRM
      registerTimeout(() => {
        const m4 = document.getElementById('iaMsg4');
        if (m4) { 
          m4.classList.add('show'); 
          playPopChime(); 
          moveCursorToElement(m4, { duration: 0.5 });
        }
      }, 9800);

      // 12.0s: Cursor cruza o conector para o CRM
      registerTimeout(() => {
        moveCursorToElement('.integration-connector', {
          duration: 0.6
        });
      }, 12000);

      // 13.4s: Card entra automaticamente na coluna do CRM com destaque
      registerTimeout(() => {
        if (crmLiveCard) {
          crmLiveCard.classList.add('show');
          playPopChime();
          gsap.fromTo(crmLiveCard, 
            { scale: 0.8, boxShadow: '0 0 0px var(--cyan-neon)' }, 
            { scale: 1, boxShadow: '0 0 25px rgba(0, 180, 255, 0.6)', duration: 0.6, ease: 'back.out(2)' }
          );
          moveCursorToElement(crmLiveCard, {
            duration: 0.5,
            clickAfter: 0.2
          });
        }
      }, 13400);
    }


    if (sceneNumber === 6) {
      // 6. Connect Digital CTA (8.2s)
      gsap.fromTo('.closing-brand-icon', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' });
      gsap.fromTo('.btn-cta-motion', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, delay: 0.4, duration: 0.6, ease: 'back.out(2)' });

      registerTimeout(() => {
        moveCursorToElement('.btn-cta-motion', {
          duration: 1.0,
          clickAfter: 0.35,
          onComplete: () => {
            const btn = document.querySelector('.btn-cta-motion');
            if (btn) gsap.to(btn, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 });
          }
        });
      }, 1500);
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
      const targetScene = parseInt(pill.getAttribute('data-scene'), 10);
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

