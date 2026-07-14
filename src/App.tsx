import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Lock, 
  Settings, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Video, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Smartphone,
  ExternalLink,
  Tv
} from 'lucide-react';

const PRESET_VIDEOS = [
  { name: "🎬 Romance Coreano Brutal (YouTube)", url: "https://youtu.be/s4fnePxwFKA?is=CU6YJ6f42B42aaaN" },
  { name: "🎬 Romance Coreano (Mixkit CDN)", url: "https://assets.mixkit.co/videos/preview/mixkit-korean-street-at-night-with-neon-lights-and-people-41712-large.mp4" },
  { name: "🎬 Trailer Sintel (Google Cloud)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { name: "🎬 Big Buck Bunny (Storage)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
];

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const youtubeContainerId = "yt-player-container";

export default function App() {
  // Configurable States
  const [headline, setHeadline] = useState(
    "Seu marido por contrato é seu chefe. Ele mandou ela ficar longe... mas foi o primeiro a enlouquecer de ciúmes."
  );
  const [subHeadline, setSubHeadline] = useState("Assista o início grátis agora 👇");
  const [checkoutUrl, setCheckoutUrl] = useState("https://ggcheckout.app/checkout/v4/smX7xGQcZND4yx7t6s9N");
  const [driveId, setDriveId] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState(
    "https://youtu.be/s4fnePxwFKA"
  );
  const [pauseTime, setPauseTime] = useState(183); // 3:03 = 183 seconds
  const [isTestMode, setIsTestMode] = useState(false);
  const [offer1, setOffer1] = useState("Preciso ver o final agora");
  const [offer2, setOffer2] = useState("");

  // Operational States
  const [showOverlay, setShowOverlay] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isYTApiReady, setIsYTApiReady] = useState(false);

  // Determine active pause time (test mode is 5s, normal is configured time)
  const activePauseTime = isTestMode ? 5 : pauseTime;

  // Compute direct video source
  const getVideoSource = () => {
    if (driveId && driveId.trim() !== "") {
      return `https://drive.google.com/uc?export=download&id=${driveId.trim()}`;
    }
    return customVideoUrl;
  };

  // Check LocalStorage on Mount
  useEffect(() => {
    const hasSeen = localStorage.getItem('dorama_viu_gancho_183');
    if (hasSeen === 'true') {
      setIsReturningUser(true);
      setShowOverlay(true);
      if (videoRef.current) {
        videoRef.current.currentTime = activePauseTime;
        videoRef.current.pause();
      }
    }
  }, [activePauseTime]);

  // Handle YouTube Script loading and initialization
  useEffect(() => {
    const isYouTube = !!getYoutubeId(getVideoSource());
    if (!isYouTube) return;

    if ((window as any).YT && (window as any).YT.Player) {
      setIsYTApiReady(true);
      return;
    }

    let tag = document.getElementById('youtube-iframe-api');
    if (!tag) {
      tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      (tag as HTMLScriptElement).src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      setIsYTApiReady(true);
    };

    const checkInterval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        setIsYTApiReady(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [customVideoUrl, driveId]);

  // Initialize YouTube Player
  useEffect(() => {
    const ytId = getYoutubeId(getVideoSource());
    if (!ytId || !isYTApiReady) return;

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {}
      ytPlayerRef.current = null;
    }

    const container = document.getElementById(youtubeContainerId);
    if (!container) return;

    container.innerHTML = `<div id="yt-player-iframe" class="w-full h-full"></div>`;

    try {
      ytPlayerRef.current = new (window as any).YT.Player('yt-player-iframe', {
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          mute: isMuted ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }

            if (isReturningUser) {
              event.target.seekTo(activePauseTime, true);
              event.target.pauseVideo();
              setIsPlaying(false);
            } else {
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              setVideoError(null);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          },
          onError: () => {
            setVideoError("Erro ao carregar o vídeo do YouTube. Verifique se o ID está correto ou se o vídeo permite incorporação externa.");
          }
        }
      });
    } catch (err) {
      console.error("YouTube Player init error:", err);
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [isYTApiReady, customVideoUrl, driveId, isReturningUser, activePauseTime]);

  // Periodically poll YouTube player time
  useEffect(() => {
    const interval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          const state = ytPlayerRef.current.getPlayerState();
          
          if (state === 1) { // PLAYING
            setCurrentTime(current);
            const durationVal = ytPlayerRef.current.getDuration();
            if (durationVal > 0) {
              setDuration(durationVal);
            }

            // If reached pause time, freeze video and show overlay
            if (current >= activePauseTime && !showOverlay) {
              ytPlayerRef.current.pauseVideo();
              ytPlayerRef.current.seekTo(activePauseTime, true);
              setShowOverlay(true);
              localStorage.setItem('dorama_viu_gancho_183', 'true');
              setIsReturningUser(true);
              setIsPlaying(false);
            }
          }
        } catch (e) {}
      }
    }, 250);

    return () => clearInterval(interval);
  }, [activePauseTime, showOverlay]);

  // Handle Video Time Update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // If reached pause time, freeze video and show overlay
    if (current >= activePauseTime && !showOverlay) {
      videoRef.current.pause();
      videoRef.current.currentTime = activePauseTime;
      setShowOverlay(true);
      localStorage.setItem('dorama_viu_gancho_183', 'true');
      setIsReturningUser(true);
    }
  };

  // Handle Metadata Loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (isReturningUser) {
        videoRef.current.currentTime = activePauseTime;
        videoRef.current.pause();
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const isYouTube = !!getYoutubeId(getVideoSource());
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.isMuted === 'function') {
        if (ytPlayerRef.current.isMuted()) {
          ytPlayerRef.current.unMute();
          setIsMuted(false);
        } else {
          ytPlayerRef.current.mute();
          setIsMuted(true);
        }
      } else {
        setIsMuted(!isMuted);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    const isYouTube = !!getYoutubeId(getVideoSource());
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // PLAYING
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(!isPlaying);
      }
    } else {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Autoplay blocked or failed:", err);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Reset Storage / Simulated Visita
  const handleResetStorage = () => {
    localStorage.removeItem('dorama_viu_gancho_183');
    setIsReturningUser(false);
    setShowOverlay(false);
    setVideoError(null);
    const isYouTube = !!getYoutubeId(getVideoSource());

    if (isYouTube) {
      setIsMuted(true);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.mute();
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {}
      } else {
        setIsPlaying(true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
        setIsMuted(true);
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  };

  // Force returning user simulation
  const handleSimulateReturning = () => {
    localStorage.setItem('dorama_viu_gancho', 'true');
    setIsReturningUser(true);
    setShowOverlay(true);
    setIsPlaying(false);
    const isYouTube = !!getYoutubeId(getVideoSource());

    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
          ytPlayerRef.current.seekTo(activePauseTime, true);
        } catch (e) {}
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = activePauseTime;
      }
    }
  };

  // Handle Video Error
  const handleVideoError = () => {
    setVideoError(
      "Erro ao carregar vídeo. Se estiver usando o Google Drive, certifique-se de que o ID do arquivo é público e não ultrapassou o limite de cotas do Drive. Recomendamos usar links diretos de MP4 ou plataformas como Vimeo/YouTube em produção."
    );
  };

  // Helper to format seconds to MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Standalone Single-File HTML Template generator
  const generateStandaloneHTML = () => {
    const videoSource = getVideoSource();
    const ytId = getYoutubeId(videoSource);
    const isYouTube = !!ytId;

    const videoBlock = isYouTube ? `
            <!-- YouTube Player Container -->
            <div id="doramaPlayer" class="w-full h-full object-cover cursor-pointer"></div>
    ` : `
            <!-- Video Tag -->
            <video 
                id="doramaPlayer" 
                class="w-full h-full object-cover cursor-pointer"
                src="${videoSource}"
                preload="auto"
                playsinline
                autoplay
                muted
                onclick="togglePlay()"
            ></video>
    `;

    const scriptBlock = isYouTube ? `
    <!-- Script para carregar a API de IFrame do YouTube -->
    <script>
        let playerInstance;
        const paywall = document.getElementById('paywallOverlay');
        const unmuteBtn = document.getElementById('unmuteBtn');
        const volumeIcon = document.getElementById('volumeIcon');
        const volumeText = document.getElementById('volumeText');
        const progressBar = document.getElementById('progressBar');
        const playOverlay = document.getElementById('playOverlay');
        
        const PAUSE_TIME = ${pauseTime}; // segundos para pausar o vídeo

        // Carrega API do YouTube de forma assíncrona
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        function onYouTubeIframeAPIReady() {
            playerInstance = new YT.Player('doramaPlayer', {
                videoId: '${ytId}',
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    playsinline: 1,
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                }
            });
        }

        function onPlayerReady(event) {
            const hasSeen = localStorage.getItem('dorama_viu_gancho_183');
            if (hasSeen === 'true') {
                showPaywallDirectly();
            } else {
                event.target.playVideo();
                setInterval(checkTime, 250);
            }
        }

        function onPlayerStateChange(event) {
            if (event.data === 1) { // tocando
                playOverlay.classList.add('hidden');
            } else if (event.data === 2) { // pausado
                const current = playerInstance.getCurrentTime();
                if (current < PAUSE_TIME) {
                    playOverlay.classList.remove('hidden');
                }
            }
        }

        function checkTime() {
            if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
                const current = playerInstance.getCurrentTime();
                const duration = playerInstance.getDuration();
                
                if (duration) {
                    const percent = (current / PAUSE_TIME) * 100;
                    progressBar.style.width = Math.min(percent, 100) + '%';
                }

                if (current >= PAUSE_TIME) {
                    playerInstance.pauseVideo();
                    playerInstance.seekTo(PAUSE_TIME, true);
                    localStorage.setItem('dorama_viu_gancho_183', 'true');
                    showPaywallDirectly();
                }
            }
        }

        function showPaywallDirectly() {
            paywall.classList.remove('opacity-0', 'pointer-events-none');
            paywall.classList.add('opacity-100');
            unmuteBtn.style.display = 'none';
            playOverlay.style.display = 'none';
            
            const ctaFixed = document.getElementById('ctaFixed');
            if (ctaFixed) {
                ctaFixed.style.display = 'none';
            }
            
            const ctaBelow = document.getElementById('ctaBelowPlayer');
            if (ctaBelow) {
                ctaBelow.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
                ctaBelow.classList.add('max-h-[250px]', 'opacity-100', 'pointer-events-auto', 'mb-6');
            }

            if (playerInstance && typeof playerInstance.pauseVideo === 'function') {
                playerInstance.pauseVideo();
                playerInstance.seekTo(PAUSE_TIME, true);
            }
        }

        function togglePlay() {
            if (!playerInstance || typeof playerInstance.getPlayerState !== 'function') return;
            const state = playerInstance.getPlayerState();
            if (state === 1) { // Tocando
                playerInstance.pauseVideo();
                playOverlay.classList.remove('hidden');
            } else {
                playerInstance.playVideo();
                playOverlay.classList.add('hidden');
            }
        }

        function toggleVolume(event) {
            if (event) event.stopPropagation();
            if (!playerInstance || typeof playerInstance.isMuted !== 'function') return;

            if (playerInstance.isMuted()) {
                playerInstance.unMute();
                volumeIcon.innerText = '🔊';
                volumeText.innerText = 'Mudar para Mudo';
                unmuteBtn.classList.remove('bg-black/75');
                unmuteBtn.classList.add('bg-rose-600/90', 'border-rose-500/30');
            } else {
                playerInstance.mute();
                volumeIcon.innerText = '🔇';
                volumeText.innerText = 'Ativar Som';
                unmuteBtn.classList.remove('bg-rose-600/90', 'border-rose-500/30');
                unmuteBtn.classList.add('bg-black/75');
            }
        }
    </script>
    ` : `
    <!-- Script para tag HTML5 Video padrão -->
    <script>
        const player = document.getElementById('doramaPlayer');
        const paywall = document.getElementById('paywallOverlay');
        const unmuteBtn = document.getElementById('unmuteBtn');
        const volumeIcon = document.getElementById('volumeIcon');
        const volumeText = document.getElementById('volumeText');
        const progressBar = document.getElementById('progressBar');
        const playOverlay = document.getElementById('playOverlay');
        
        const PAUSE_TIME = ${pauseTime}; // segundos para pausar o vídeo

        function initLanding() {
            const hasSeen = localStorage.getItem('dorama_viu_gancho_183');
            if (hasSeen === 'true') {
                showPaywallDirectly();
            } else {
                setupVideoListeners();
            }
        }

        // Função de controle de play/pause
        function togglePlay() {
            if (player.paused) {
                player.play()
                    .then(() => {
                        playOverlay.classList.add('hidden');
                    })
                    .catch(err => {
                        console.log("Autoplay bloqueado pelo navegador.");
                    });
            } else {
                player.pause();
                playOverlay.classList.remove('hidden');
            }
        }

        function showPaywallDirectly() {
            paywall.classList.remove('opacity-0', 'pointer-events-none');
            paywall.classList.add('opacity-100');
            unmuteBtn.style.display = 'none';
            playOverlay.style.display = 'none';
            
            const ctaFixed = document.getElementById('ctaFixed');
            if (ctaFixed) {
                ctaFixed.style.display = 'none';
            }
            
            const ctaBelow = document.getElementById('ctaBelowPlayer');
            if (ctaBelow) {
                ctaBelow.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
                ctaBelow.classList.add('max-h-[250px]', 'opacity-100', 'pointer-events-auto', 'mb-6');
            }

            player.pause();
            try {
                player.currentTime = PAUSE_TIME;
            } catch(e) {}
        }

        function setupVideoListeners() {
            player.addEventListener('play', () => {
                playOverlay.classList.add('hidden');
            });

            player.addEventListener('pause', () => {
                const current = player.currentTime;
                if (current < PAUSE_TIME) {
                    playOverlay.classList.remove('hidden');
                }
            });

            player.addEventListener('timeupdate', () => {
                const current = player.currentTime;
                if (player.duration) {
                    const percent = (current / PAUSE_TIME) * 100;
                    progressBar.style.width = Math.min(percent, 100) + '%';
                }

                if (current >= PAUSE_TIME) {
                    player.pause();
                    player.currentTime = PAUSE_TIME;
                    localStorage.setItem('dorama_viu_gancho_183', 'true');
                    showPaywallDirectly();
                }
            });

            const playPromise = player.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    playOverlay.classList.remove('hidden');
                });
            }
        }

        function toggleVolume(event) {
            if (event) event.stopPropagation();
            if (player.muted) {
                player.muted = false;
                volumeIcon.innerText = '🔊';
                volumeText.innerText = 'Mudar para Mudo';
                unmuteBtn.classList.remove('bg-black/75');
                unmuteBtn.classList.add('bg-rose-600/90', 'border-rose-500/30');
            } else {
                player.muted = true;
                volumeIcon.innerText = '🔇';
                volumeText.innerText = 'Ativar Som';
                unmuteBtn.classList.remove('bg-rose-600/90', 'border-rose-500/30');
                unmuteBtn.classList.add('bg-black/75');
            }
        }

        window.addEventListener('DOMContentLoaded', initLanding);
    </script>
    `;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu marido por contrato é seu chefe.</title>
    <meta name="description" content="Ele mandou ela ficar longe... mas foi o primeiro a enlouquecer de ciúmes.">
    <meta property="og:title" content="Seu marido por contrato é seu chefe.">
    <meta property="og:description" content="Ele mandou ela ficar longe... mas foi o primeiro a enlouquecer de ciúmes.">
    <meta property="og:type" content="website">
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1833545720703515');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1833545720703515&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN para renderização em arquivo único -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        serif: ['Playfair Display', 'serif'],
                        sans: ['Inter', 'sans-serif'],
                    },
                    animation: {
                        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
                    },
                    keyframes: {
                        pulseSubtle: {
                            '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(185, 28, 28, 0.7)' },
                            '70%': { transform: 'scale(1.03)', boxShadow: '0 0 0 15px rgba(185, 28, 28, 0)' },
                            '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(185, 28, 28, 0)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #0a0a0a;
            color: #ffffff;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
            background: #222;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #333;
        }
    </style>
</head>
<body class="font-sans antialiased overflow-x-hidden min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-8 md:py-16">
    
    <!-- Background Ambient Glows -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-950/20 blur-[120px] pointer-events-none -z-10"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-950/20 blur-[120px] pointer-events-none -z-10"></div>

    <div class="w-full max-w-[750px] mx-auto flex flex-col items-center text-center">
        
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-900/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-5 animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Estreia Exclusiva
        </div>

        <!-- Headline -->
        <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight mb-5 max-w-[700px] italic">
            Seu marido por contrato é seu chefe. <br class="hidden md:inline" />
            <span class="text-red-600">Ele mandou ela ficar longe...</span> mas foi o primeiro a enlouquecer de ciúmes.
        </h1>

        <!-- Subheadline -->
        <p class="font-sans text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2 justify-center">
            \${subHeadline}
        </p>

        <!-- Video Player Wrapper -->
        <div class="w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 aspect-video relative shadow-2xl mb-8">
            
            ${videoBlock}

            <!-- Centered Play Button Overlay -->
            <div 
                id="playOverlay" 
                class="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/35 z-10"
                onclick="togglePlay()"
            >
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#B91C1C] hover:bg-red-700 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 flex-shrink-0 animate-pulse">
                    <svg class="w-8 h-8 md:w-10 md:h-10 fill-white translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                </div>
            </div>

            <!-- Floating Unmute Button -->
            <button 
                id="unmuteBtn" 
                class="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/75 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-sm border border-neutral-800 transition duration-300 active:scale-95"
                onclick="toggleVolume(event)"
            >
                <span id="volumeIcon">🔇</span> <span id="volumeText">Ativar Som</span>
            </button>

            <!-- Playback Timer Progress Bar -->
            <div id="progressBarContainer" class="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800/60 z-20 transition-all duration-300">
                <div id="progressBar" class="h-full bg-rose-600 transition-all duration-100" style="width: 0%"></div>
            </div>

            <!-- Overlaid Watermark (Indicates play) -->
            <div id="playWatermark" class="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-300 z-10"></div>

            <!-- Translucent Paywall Overlay (Keeps video frame visible in background) -->
            <div 
                id="paywallOverlay" 
                class="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center z-30 transition-all duration-500 opacity-0 pointer-events-none"
            >
                <!-- Lock Icon Decoration -->
                <div class="w-16 h-16 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-5 animate-bounce">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h3 class="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-[#D4AF37] mb-2 tracking-tight">
                    O final vai te deixar sem ar.
                </h3>
                <p class="text-gray-300 text-xs md:text-sm max-w-[420px] leading-relaxed">
                    Quem para aqui nunca descobre o que aconteceu com Susu. Você vai deixar assim?
                </p>
            </div>
        </div>

        <!-- Social Proof Section -->
        <div class="w-full flex flex-col items-center justify-center mt-12 mb-2 px-4">
            <div class="w-full max-w-[380px] p-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
                <p class="text-[11px] md:text-xs text-[#D4AF37] font-bold mb-5 uppercase tracking-widest text-center">
                    🔥 +1.200 mulheres já assistiram essa semana
                </p>
                
                <div class="space-y-4">
                    <!-- Comment 1 -->
                    <div class="flex gap-3 items-start">
                        <img src="/images/ana_paula_avatar_1783988424055.jpg" alt="Ana Paula" class="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" referrerPolicy="no-referrer">
                        <div class="flex flex-col">
                            <p class="text-[11px] text-gray-400 font-semibold mb-0.5">Ana Paula, SP</p>
                            <p class="text-[12px] text-gray-200 leading-snug italic">Eu fui assistir só o começo e não consegui parar. Precisei comprar na hora pra ver o final!</p>
                        </div>
                    </div>
                    
                    <!-- Comment 2 -->
                    <div class="flex gap-3 items-start border-t border-white/5 pt-4">
                        <img src="/images/fernanda_avatar_1783988433114.jpg" alt="Fernanda" class="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" referrerPolicy="no-referrer">
                        <div class="flex flex-col">
                            <p class="text-[11px] text-gray-400 font-semibold mb-0.5">Fernanda, RJ</p>
                            <p class="text-[12px] text-gray-200 leading-snug italic">Esse dorama me pegou demais. O final é surreal, não esperava isso 😭❤️</p>
                        </div>
                    </div>
                    
                    <!-- Comment 3 -->
                    <div class="flex gap-3 items-start border-t border-white/5 pt-4">
                        <img src="/images/camila_avatar_1783988442657.jpg" alt="Camila" class="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" referrerPolicy="no-referrer">
                        <div class="flex flex-col">
                            <p class="text-[11px] text-gray-400 font-semibold mb-0.5">Camila, MG</p>
                            <p class="text-[12px] text-gray-200 leading-snug italic">Minha amiga me mandou e eu assisti tudo de uma vez. Vale cada centavo!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Fixed CTA (Visible from the start) -->
        <div id="ctaFixed" class="w-full flex flex-col items-center justify-center mt-6 z-20">
            <a 
                href="\${checkoutUrl}" 
                target="_blank"
                onclick="handleCheckoutClick()"
                class="inline-flex items-center justify-center w-full max-w-[380px] px-8 py-4.5 rounded-full text-white font-extrabold text-sm md:text-base bg-[#B91C1C] hover:bg-red-700 transition duration-300 text-center animate-pulse-subtle border border-red-500/30 shadow-lg tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
            >
                Quero ver o filme completo agora
            </a>
            <p class="text-[13px] text-white/70 mt-2 text-center font-normal">Acesso imediato por apenas R$14,90</p>
        </div>

        <!-- CTA Section Below Player (Dynamically revealed when paused) -->
        <div 
            id="ctaBelowPlayer" 
            class="w-full flex flex-col items-center justify-center transition-all duration-500 max-h-0 opacity-0 pointer-events-none overflow-hidden mt-4"
        >
            <a 
                href="\${checkoutUrl}" 
                target="_blank"
                onclick="handleCheckoutClick()"
                class="inline-flex items-center justify-center w-full max-w-[380px] px-8 py-4.5 rounded-full text-white font-extrabold text-sm md:text-base bg-[#B91C1C] hover:bg-red-700 transition duration-300 text-center animate-pulse-subtle border border-red-500/30 shadow-lg tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
            >
                \${offer1}
            </a>
            <p class="text-[13px] text-white/70 mt-2 text-center font-normal">Acesso imediato por apenas R$14,90</p>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-3 text-center mb-6">Acesso vitalício imediato via e-mail</p>
        </div>

        <!-- Safe Footer Details -->
        <p class="text-neutral-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            🔒 Compra 100% Segura • Acesso Imediato
        </p>

        <!-- Visual Reinforcement Stats Grid -->
        <div class="mt-4 flex gap-8 md:gap-12 items-center opacity-45">
          <div class="flex flex-col items-center">
            <span class="text-lg md:text-xl font-serif italic text-white font-bold">4.9/5</span>
            <span class="text-[10px] uppercase tracking-tighter font-sans text-gray-400">Avaliação</span>
          </div>
          <div class="h-8 w-px bg-white/20"></div>
          <div class="flex flex-col items-center">
            <span class="text-lg md:text-xl font-serif italic text-white font-bold">1247</span>
            <span class="text-[10px] uppercase tracking-tighter font-sans text-gray-400">pessoas estão assistindo</span>
          </div>
          <div class="h-8 w-px bg-white/20"></div>
          <div class="flex flex-col items-center">
            <span class="text-lg md:text-xl font-serif italic text-white font-bold">Full HD</span>
            <span class="text-[10px] uppercase tracking-tighter font-sans text-gray-400">Qualidade</span>
          </div>
        </div>

    </div>
    
    <script>
        function handleCheckoutClick() {
            if (typeof fbq === 'function') {
                fbq('track', 'InitiateCheckout');
            }
        }
    </script>

    ${scriptBlock}
</body>
</html>`;
  };

  // Write compiled template file on state changes to keep workspace current
  useEffect(() => {
    // We can save the file or let the user export it.
    // In React App, writing this output automatically allows the build artifact to have a static downloadable html file!
    // We will generate the HTML string and offer easy copying in the UI.
  }, [headline, subHeadline, checkoutUrl, driveId, customVideoUrl, pauseTime, isTestMode, offer1]);

  // Copy standalone HTML code to clipboard
  const handleCopyHTML = () => {
    const htmlCode = generateStandaloneHTML();
    navigator.clipboard.writeText(htmlCode);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
  };

  // Download standalone HTML file directly
  const handleDownloadHTML = () => {
    const htmlCode = generateStandaloneHTML();
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dorama_landing_page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-rose-600 selection:text-white">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-950/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-950/20 blur-[120px] pointer-events-none -z-10" />


      {/* Producer Admin/Config Drawer */}
      {isAdminOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-neutral-900/98 backdrop-blur-md border-l border-neutral-800 z-40 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-500" />
                <h2 className="font-bold text-lg tracking-tight">Painel de Configurações</h2>
              </div>
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="text-neutral-400 hover:text-white text-sm font-semibold px-2 py-1 rounded hover:bg-neutral-800"
              >
                Fechar ✕
              </button>
            </div>

            {/* Quick Simulation Toggles */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Testar Fluxos de Visita
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetStorage}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 text-xs font-semibold rounded-lg border border-neutral-800 text-rose-400 hover:text-rose-300 transition"
                  title="Simular como se o usuário nunca tivesse acessado a página antes"
                >
                  <RefreshCw className="w-3 h-3" /> 1ª Visita
                </button>
                <button
                  onClick={handleSimulateReturning}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-semibold rounded-lg border border-rose-900/30 text-rose-400 hover:text-rose-300 transition"
                  title="Simular como se o usuário já tivesse visto o vídeo de gancho"
                >
                  <Eye className="w-3 h-3" /> Visita de Retorno
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">Status do LocalStorage:</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isReturningUser ? 'bg-rose-950 text-rose-400 border border-rose-900/30' : 'bg-neutral-800 text-neutral-400'}`}>
                  {isReturningUser ? 'Gancho Visto' : 'Nova Visita'}
                </span>
              </div>
            </div>

            {/* Config Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Headline Principal</label>
                <textarea 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white min-h-[70px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Sub-Headline</label>
                <input 
                  type="text" 
                  value={subHeadline} 
                  onChange={(e) => setSubHeadline(e.target.value)}
                  className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tempo de Pausa (s)</label>
                    <span className="text-[10px] text-neutral-500 font-mono">({formatTime(activePauseTime)})</span>
                  </div>
                  <input 
                    type="number" 
                    value={pauseTime} 
                    disabled={isTestMode}
                    onChange={(e) => setPauseTime(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-neutral-950 border border-neutral-800 hover:border-rose-950 rounded-lg transition">
                    <input 
                      type="checkbox" 
                      checked={isTestMode} 
                      onChange={(e) => setIsTestMode(e.target.checked)}
                      className="accent-rose-500" 
                    />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Modo Teste (5s)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Google Drive File ID (Alternativa)</label>
                <input 
                  type="text" 
                  value={driveId} 
                  placeholder="ID do arquivo (deixe em branco para usar URL direta)"
                  onChange={(e) => setDriveId(e.target.value)}
                  className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Se preenchido, gera o link de download direto do Drive.
                </p>
              </div>

              {!driveId && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">URL Direta do Vídeo (MP4)</label>
                  <input 
                    type="text" 
                    value={customVideoUrl} 
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white text-xs"
                  />
                  
                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-850 space-y-2">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3 text-rose-500" /> Presets Rápidos de Vídeo
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {PRESET_VIDEOS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomVideoUrl(preset.url);
                            setDriveId("");
                            setVideoError(null);
                          }}
                          className={`text-left text-[11px] px-2.5 py-1.5 rounded border transition-all duration-150 flex items-center justify-between ${
                            customVideoUrl === preset.url && !driveId
                              ? "bg-rose-950/40 border-rose-900/50 text-rose-400 font-semibold"
                              : "bg-neutral-900/55 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                          }`}
                        >
                          <span>{preset.name}</span>
                          <span className="text-[9px] opacity-65 font-mono">Testar</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Link de Redirecionamento (Checkout)</label>
                <input 
                  type="text" 
                  value={checkoutUrl} 
                  onChange={(e) => setCheckoutUrl(e.target.value)}
                  className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                />
              </div>

              <div className="border-t border-neutral-800 pt-4 mt-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Texto do Botão (CTA)</label>
                <input 
                  type="text" 
                  value={offer1} 
                  onChange={(e) => setOffer1(e.target.value)}
                  className="w-full bg-neutral-950 text-sm p-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 mt-6 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              📦 Exportar Landing Page Única
            </h3>
            
            <button
              onClick={handleCopyHTML}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-sm font-bold rounded-lg border border-neutral-750 text-white transition active:scale-98"
            >
              {htmlCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-400" /> Copiar Código HTML Único
                </>
              )}
            </button>

            <button
              onClick={handleDownloadHTML}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-sm font-bold rounded-lg text-white transition active:scale-98 shadow-lg shadow-rose-950/40"
            >
              <Download className="w-4 h-4" /> Baixar Arquivo HTML único
            </button>
            <p className="text-[10px] text-center text-neutral-500">
              Gera um arquivo .html 100% autônomo contendo todos os estilos e roteiros prontos para colocar no ar.
            </p>
          </div>
        </div>
      )}
      <div className="w-full max-w-[750px] mx-auto px-4 py-12 md:py-16 flex-grow flex flex-col justify-center items-center">
        
        {/* Category Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-900/35 text-rose-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Estreia Exclusiva
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center italic leading-[1.2] tracking-tight mb-5 max-w-[700px]">
          Seu marido por contrato é seu chefe. <br className="hidden md:inline" />
          <span className="text-red-600">Ele mandou ela ficar longe...</span> mas foi o primeiro a enlouquecer de ciúmes.
        </h1>

        {/* Sub-headline */}
        <p className="font-sans text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center flex items-center gap-2 justify-center mb-8">
          {subHeadline}
        </p>

        {/* Video Player Box */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 aspect-video relative shadow-2xl mb-8 group">
          
          {!!getYoutubeId(getVideoSource()) ? (
            <div 
              id={youtubeContainerId} 
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
            />
          ) : (
            <video 
              ref={videoRef}
              src={getVideoSource()}
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => { setIsPlaying(true); setVideoError(null); }}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              playsInline
              autoPlay
              muted={isMuted}
            />
          )}

          {/* Centered Play Button Overlay */}
          {!showOverlay && !isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/35 z-10"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 flex-shrink-0 animate-pulse">
                <Play className="w-8 h-8 md:w-10 md:h-10 fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Floating Unmute Banner */}
          {!showOverlay && isMuted && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black/95 text-white text-xs font-semibold backdrop-blur-md border border-neutral-800 transition-all duration-200 active:scale-95 shadow-lg shadow-black/40"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              <span>Ativar Som</span>
            </button>
          )}

          {!showOverlay && !isMuted && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold backdrop-blur-md border border-rose-500/20 transition-all duration-200 active:scale-95 shadow-lg shadow-rose-950/40"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Mudar para Mudo</span>
            </button>
          )}

          {/* Inline Timer Progress Bar (Only visible while playing) */}
          {!showOverlay && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900/60 z-20">
              <div 
                className="h-full bg-rose-600 transition-all duration-100" 
                style={{ width: `${(currentTime / activePauseTime) * 100}%` }}
              />
            </div>
          )}

          {/* Technical Video Loading / CORS Error Banner */}
          {videoError && !showOverlay && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-4">
                {videoError}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => {
                    setVideoError(null);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg border border-neutral-800 transition"
                >
                  Tentar Novamente
                </button>
                <button 
                  onClick={() => {
                    setDriveId("");
                    setCustomVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-korean-street-at-night-with-neon-lights-and-people-41712-large.mp4");
                    setVideoError(null);
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {});
                      }
                    }, 100);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Usar Vídeo de Teste Estável (Dorama)
                </button>
              </div>
            </div>
          )}

          {/* Paywall Overlay */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center z-25 transition-all duration-500 ${
              showOverlay ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-105'
            }`}
          >
            {/* Animated Padlock Badge */}
            <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-[#D4AF37] mb-2 tracking-tight">
              O final vai te deixar sem ar.
            </h3>
            
            <p className="text-gray-300 text-xs md:text-sm max-w-[420px] leading-relaxed">
              Quem para aqui nunca descobre o que aconteceu com Susu. Você vai deixar assim?
            </p>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="w-full flex flex-col items-center justify-center mt-12 mb-2 px-4">
          <div className="w-full max-w-[380px] p-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
            <p className="text-[11px] md:text-xs text-[#D4AF37] font-bold mb-5 uppercase tracking-widest text-center">
              🔥 +1.200 mulheres já assistiram essa semana
            </p>
            
            <div className="space-y-4">
              {/* Comment 1 */}
              <div className="flex gap-3 items-start">
                <img 
                  src="/images/ana_paula_avatar_1783988424055.jpg" 
                  alt="Ana Paula" 
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Ana Paula, SP</p>
                  <p className="text-[12px] text-gray-200 leading-snug italic">Eu fui assistir só o começo e não consegui parar. Precisei comprar na hora pra ver o final!</p>
                </div>
              </div>
              
              {/* Comment 2 */}
              <div className="flex gap-3 items-start border-t border-white/5 pt-4">
                <img 
                  src="/images/fernanda_avatar_1783988433114.jpg" 
                  alt="Fernanda" 
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Fernanda, RJ</p>
                  <p className="text-[12px] text-gray-200 leading-snug italic">Esse dorama me pegou demais. O final é surreal, não esperava isso 😭❤️</p>
                </div>
              </div>
              
              {/* Comment 3 */}
              <div className="flex gap-3 items-start border-t border-white/5 pt-4">
                <img 
                  src="/images/camila_avatar_1783988442657.jpg" 
                  alt="Camila" 
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Camila, MG</p>
                  <p className="text-[12px] text-gray-200 leading-snug italic">Minha amiga me mandou e eu assisti tudo de uma vez. Vale cada centavo!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed CTA (Visible from the start) */}
        <div className={`w-full flex flex-col items-center justify-center mt-6 ${showOverlay ? 'hidden' : ''}`}>
          <a 
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof (window as any).fbq === 'function') {
                (window as any).fbq('track', 'InitiateCheckout');
              }
            }}
            className="inline-flex items-center justify-center w-full max-w-[380px] px-8 py-4.5 rounded-full text-white font-extrabold text-sm md:text-base bg-[#B91C1C] hover:bg-red-700 transition duration-300 text-center animate-pulse-subtle border border-red-500/30 shadow-lg tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Quero ver o filme completo agora</span>
          </a>
          <p className="text-[13px] text-white/70 mt-2 text-center font-normal">Acesso imediato por apenas R$14,90</p>
        </div>

        {/* Dynamic CTA Below Player in React */}
        <div 
          className={`w-full flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${
            showOverlay 
              ? 'max-h-[250px] opacity-100 mt-4 mb-6 pointer-events-auto' 
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <a 
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof (window as any).fbq === 'function') {
                (window as any).fbq('track', 'InitiateCheckout');
              }
            }}
            className="inline-flex items-center justify-center w-full max-w-[380px] px-8 py-4.5 rounded-full text-white font-extrabold text-sm md:text-base bg-[#B91C1C] hover:bg-red-700 transition duration-300 text-center animate-pulse-subtle border border-red-500/30 shadow-lg tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{offer1}</span>
          </a>
          <p className="text-[13px] text-white/70 mt-2 text-center font-normal">Acesso imediato por apenas R$14,90</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 text-center">Acesso vitalício imediato via e-mail</p>
        </div>

        {/* Secure Purchase Footer Tag */}
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
          🔒 Compra 100% Segura • Acesso Imediato
        </p>

        {/* Visual Reinforcement (Footer) */}
        <div className="mt-4 flex gap-8 md:gap-12 items-center opacity-45">
          <div className="flex flex-col items-center">
            <span className="text-lg md:text-xl font-serif italic text-white font-bold">4.9/5</span>
            <span className="text-[10px] uppercase tracking-tighter font-sans text-gray-400">Avaliação</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-lg md:text-xl font-serif italic text-white font-bold">1247</span>
            <span className="text-[10px] uppercase tracking-tighter font-sans text-gray-400">pessoas estão assistindo</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-lg md:text-xl font-serif italic text-white font-bold">Full HD</span>
            <span className="text-[10px] uppercase tracking-tighter font-sans text-gray-400">Qualidade</span>
          </div>
        </div>
      </div>

      {/* Simplified Mobile-First Friendly Footnote */}
      <footer 
        className="w-full text-center py-6 border-t border-neutral-900/40 text-[10px] text-neutral-700 font-medium uppercase tracking-wider cursor-default select-none hover:text-neutral-600 transition"
        onDoubleClick={() => setIsAdminOpen(!isAdminOpen)}
        title="Dê duplo clique para gerenciar as configurações"
      >
        © {new Date().getFullYear()} Dorama Exclusivo • Todos os direitos reservados
      </footer>
    </div>
  );
}
