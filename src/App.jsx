import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import heroVisual from "./assets/hero.svg";
import algorithmVisual from "./assets/visual-algorithm.svg";
import onlineVisual from "./assets/visual-online.svg";
import seenVisual from "./assets/visual-seen.svg";
import signalVisual from "./assets/visual-signal.svg";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const IG_URL = "https://www.instagram.com/half_online?igsh=MWJ0YWprYXR0MWdscA==";
const THREADS_URL =
  "https://www.threads.com/@half_online?igshid=NTc4MTIwNjQ2YQ==";
const LINE_URL = "https://line.me/R/ti/p/@144naegv";
const TAIPEI_MENTAL_HEALTH_URL = "https://mental-health.gov.taipei/";
const SUPPORT_URL = TAIPEI_MENTAL_HEALTH_URL;
const MCU_COUNSELING_URL =
  "https://cpc.mcu.edu.tw/%E8%AB%AE%E5%95%86%E8%BC%94%E5%B0%8E%E4%B8%AD%E5%BF%83/";

const scenes = [
  ["opening", "00", "ONLINE EXHIBITION", "不是沒有人在，\n只是沒有人靠近。", "我們每天活在通知、訊息、限動與演算法裡。看起來永遠在線，實際上卻越來越習慣沉默。《在線，但不在身邊》想談的，不只是孤單，而是這個時代的連結方式。"],
  ["online", "01", "ALWAYS ON", "你在線", "早上醒來看通知，課堂中回訊息，午餐刷短影片，晚上睡前再看一次社群。你的手很忙，心卻很靜。"],
  ["seen", "02", "SEEN BY EVERYONE", "你被看見", "限動被看過，貼文被按讚，聊天室一直跳通知。可是當你真的難過時，那些互動突然都變得很薄。"],
  ["algorithm", "03", "SORTED FEELINGS", "你被分類", "演算法總是比你更快定義你。今天的你，被系統歸類成什麼樣的人？"],
  ["read", "04", "READ, NO REPLY", "已讀，不回", "這裡只有你發出的訊息，和一個冷冷的已讀。"],
  ["socials", "05", "OFFICIAL CHANNELS", "官方平台", "展覽的延伸敘事散落在不同平台。每一次觀看、停留與互動，都是這場策展的一部分。"],
  ["podcast", "06", "LISTENING ROOM", "聆聽 Podcast", "有些情緒無法被畫面完整承接，於是它們轉化成聲音。這裡收納那些更慢、更深的說話方式。"],
  ["resources", "07", "SUPPORT", "如果你真的很累", "你不需要一個人撐著。當孤單已經影響到情緒與生活，求助不是脆弱，而是照顧自己。"],
].map(([id, no, kicker, title, text]) => ({ id, no, kicker, title, text }));

const quotes = [
  "我們不是沒有被看見，只是很少被真正理解。",
  "有些孤單不是沒有人陪，而是沒有人靠近你真正的情緒。",
  "你每天都在線，卻不一定在任何人的心裡停留。",
  "訊息很多，能承接你的人很少。",
];

const details = ["被看見，不等於被理解", "被點開，不等於被接住", "更多訊息，不等於連結"];
const sceneVisuals = {
  opening: signalVisual,
  online: onlineVisual,
  seen: seenVisual,
  algorithm: algorithmVisual,
};
const articleDetails = {
  opening: {
    mode: "策展開場",
    note: "這是一段緩慢經過的情緒路徑。向下翻頁，重新感受那些在線卻不靠近的時刻。",
    tags: ["半在線", "情緒展覽", "慢速閱讀"],
  },
  online: {
    mode: "日常切片",
    note: "在線不是陪伴本身，有時候只是手指很忙，心卻很靜。",
    tags: ["通知", "課堂", "短影片"],
  },
  seen: {
    mode: "可見性",
    note: "被看見，不等於被理解。被點開，不等於被接住。",
    tags: ["限動", "按讚", "互動"],
  },
  algorithm: {
    mode: "演算法房間",
    note: "今天的你，被系統歸類成什麼樣的人？",
    tags: ["安靜", "已讀不回", "看起來很好"],
  },
  read: {
    mode: "等待介面",
    note: "已讀不是結局，它只是把等待變成一個沒有聲音的畫面。",
    tags: ["訊息", "沉默", "回應"],
  },
  socials: {
    mode: "展覽延伸",
    note: "社群不是出口，而是展場在不同螢幕上的回聲。",
    tags: ["Instagram", "Threads", "LINE"],
  },
  podcast: {
    mode: "聲音房間",
    note: "請戴上耳機，在一段不必急著回覆的時間裡，聽見那些被留在訊息之外的情緒。",
    tags: ["聲音", "停留", "陪伴"],
  },
  resources: {
    mode: "支持地圖",
    note: "你不需要一個人撐著。求助不是脆弱，而是照顧自己。",
    tags: ["臺北市", "銘傳大學"],
  },
};

const readMessages = [
  "你今天還好嗎？",
  "剛剛想到你。",
  "如果你想說，我在。",
  "最近是不是很累？",
];

const platforms = [
  ["Instagram", "以視覺碎片與情緒片段延伸展覽敘事。", "前往 IG", IG_URL],
  ["Threads", "以文字與片段情緒延續展覽中的討論與共鳴。", "前往 Threads", THREADS_URL],
  ["LINE", "作為提醒、陪伴與展期互動的延伸入口。", "前往 LINE", LINE_URL],
];

const resources = [
  ["臺北市心理衛生中心", "提供心理健康資訊、資源與相關協助窗口。", "前往網站", TAIPEI_MENTAL_HEALTH_URL],
  ["銘傳大學諮商輔導中心", "可進一步了解校內諮商與輔導相關資源。", "前往網站", MCU_COUNSELING_URL],
];

export default function App() {
  const appRef = useRef(null);
  const stageRef = useRef(null);
  const lenisRef = useRef(null);
  const audioRef = useRef(null);
  const gainRef = useRef(null);
  const musicLoopRef = useRef(null);
  const activeRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(true);
  const [typed, setTyped] = useState("");
  const [quote, setQuote] = useState(quotes[0]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [message, setMessage] = useState(readMessages[0]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date()),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!opening) return undefined;
    const title = "在線，但不在身邊";
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(title.slice(0, index));
      if (index >= title.length) window.clearInterval(timer);
    }, 80);
    return () => window.clearInterval(timer);
  }, [opening]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      smoothWheel: true,
      wheelMultiplier: 1.45,
      touchMultiplier: 1.65,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    lenisRef.current = lenis;
    frame = window.requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sceneEls = gsap.utils.toArray(".scene");
      const total = (scenes.length - 1) * 820;

      gsap.set(sceneEls, {
        autoAlpha: 0,
        y: 72,
        scale: 0.97,
        pointerEvents: "none",
        filter: "blur(12px)",
      });
      gsap.set(sceneEls[0], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto",
        filter: "blur(0px)",
      });
      gsap.set(".reveal", { autoAlpha: 0, y: 28 });
      gsap.set(".scene-0 .reveal", { autoAlpha: 1, y: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "storyScroll",
          trigger: stageRef.current,
          start: "top top",
          end: () => `+=${total}`,
          scrub: 0.55,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextActive = Math.min(
              scenes.length - 1,
              Math.round(self.progress * (scenes.length - 1))
            );
            setProgress(Math.round(self.progress * 1000) / 10);
            if (activeRef.current !== nextActive) {
              activeRef.current = nextActive;
              setActive(nextActive);
            }
          },
        },
      });

      timeline.to(".aurora-track", { xPercent: -18, yPercent: 8, rotate: 5, scale: 1.08, duration: 7 }, 0);
      timeline.to(".visual-drift", { rotate: 16, y: -90, x: 54, scale: 1.06, duration: 7 }, 0);

      sceneEls.forEach((scene, index) => {
        if (index === 0) return;
        const at = index - 0.72;
        timeline.to(sceneEls[index - 1], {
          autoAlpha: 0,
          y: -70,
          scale: 0.96,
          pointerEvents: "none",
          filter: "blur(16px)",
          duration: 0.42,
        }, at);
        timeline.to(scene, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          pointerEvents: "auto",
          filter: "blur(0px)",
          duration: 0.48,
        }, at + 0.08);
        timeline.to(scene.querySelectorAll(".reveal"), {
          autoAlpha: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.34,
        }, at + 0.15);
      });

      ScrollTrigger.refresh();
    }, appRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const move = (event) => {
      gsap.to(".cursor-light", {
        x: (event.clientX / window.innerWidth - 0.5) * 26,
        y: (event.clientY / window.innerHeight - 0.5) * 20,
        duration: 0.8,
        ease: "power3.out",
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    return () => {
      if (musicLoopRef.current) window.clearInterval(musicLoopRef.current);
      if (audioRef.current) audioRef.current.close();
    };
  }, []);

  const playNote = (ctx, frequency, start, duration, volume) => {
    if (!gainRef.current) return;
    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1450, start);
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.linearRampToValueAtTime(volume, start + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.055, start + 0.36);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(gainRef.current);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.08);
  };

  const scheduleMusic = () => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = ctx.currentTime + 0.08;
    const beat = 60 / 66;
    [[196, 246.94, 329.63], [174.61, 220, 293.66], [164.81, 207.65, 261.63], [185, 233.08, 311.13]].forEach((chord, index) => {
      const start = now + index * beat * 4;
      playNote(ctx, chord[0], start, 1.8, 0.18);
      playNote(ctx, chord[1], start + beat * 0.75, 1.35, 0.11);
      playNote(ctx, chord[2], start + beat * 1.75, 1.2, 0.1);
      playNote(ctx, chord[1], start + beat * 2.8, 1.1, 0.08);
    });
  };

  const startMusic = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
      gainRef.current = audioRef.current.createGain();
      gainRef.current.gain.value = 0.0001;
      gainRef.current.connect(audioRef.current.destination);
    }
    if (audioRef.current.state === "suspended") await audioRef.current.resume();
    gainRef.current.gain.setTargetAtTime(0.22, audioRef.current.currentTime, 0.08);
    if (!musicLoopRef.current) {
      scheduleMusic();
      musicLoopRef.current = window.setInterval(scheduleMusic, Math.round((60 / 66) * 16 * 1000));
    }
    setMusicOn(true);
  };

  const stopMusic = () => {
    const ctx = audioRef.current;
    if (ctx && gainRef.current) {
      gainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
      window.setTimeout(() => ctx.state === "running" && ctx.suspend(), 180);
    }
    if (musicLoopRef.current) window.clearInterval(musicLoopRef.current);
    musicLoopRef.current = null;
    setMusicOn(false);
  };

  const scrollToScene = (index) => {
    const trigger = ScrollTrigger.getById("storyScroll");
    const ratio = index / (scenes.length - 1);
    const target = trigger
      ? trigger.start + (trigger.end - trigger.start) * ratio
      : (document.documentElement.scrollHeight - window.innerHeight) * ratio;
    lenisRef.current?.scrollTo(target, { duration: 0.8 });
  };

  const enter = () => {
    setOpening(false);
    startMusic();
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  const backToOpening = () => {
    setTyped("");
    setOpening(true);
    stopMusic();
    scrollToScene(0);
  };

  return (
    <div className="app" ref={appRef}>
      {loading && <div className="loader"><span>ONLINE BUT DISTANT</span></div>}
      {opening && (
        <Opening
          dateLabel={dateLabel}
          quote={quote}
          typed={typed}
          onEnter={enter}
          onRandomQuote={() => setQuote(quotes[Math.floor(Math.random() * quotes.length)])}
        />
      )}
      <div className="progress-track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <nav className="top-nav" aria-label="展覽段落">
        <button className="brand-button" type="button" onClick={() => scrollToScene(0)}>HALF ONLINE</button>
        <div className="section-nav">
          {scenes.map((scene, index) => (
            <button key={scene.id} type="button" className={active === index ? "active" : ""} onClick={() => scrollToScene(index)}>
              {scene.no}
            </button>
          ))}
        </div>
        <button className="sound-toggle" type="button" onClick={musicOn ? stopMusic : startMusic}>
          {musicOn ? "音樂 ON" : "音樂 OFF"}
        </button>
      </nav>
      <main className="story-stage" ref={stageRef}>
        <div className="stage-background" aria-hidden="true">
          <div className="aurora-track" />
          <div className="cursor-light" />
          <div className="scan-field" />
        </div>
        {scenes.map((scene, index) => (
          <section className={`scene scene-${index}`} key={scene.id}>
            <Scene scene={scene} index={index} message={message} setMessage={setMessage} />
          </section>
        ))}
      </main>
      <div className="quick-actions">
        <button type="button" onClick={backToOpening}>起始頁</button>
        <button type="button" onClick={() => scrollToScene(0)}>頂部</button>
      </div>
    </div>
  );
}

function Opening({ dateLabel, quote, typed, onEnter, onRandomQuote }) {
  return (
    <div className="opening-screen">
      <div className="opening-grid">
        <div>
          <p className="opening-date">{dateLabel}</p>
          <h1>{typed}<span className="type-cursor" /></h1>
          <p className="opening-quote">{quote}</p>
          <div className="opening-actions">
            <button type="button" className="primary-action" onClick={onEnter}>進入展覽</button>
            <button type="button" onClick={onRandomQuote}>換一句語錄</button>
          </div>
        </div>
        <div className="opening-art" aria-hidden="true">
          <img src={heroVisual} alt="" />
          <div className="opening-readout"><span>00</span><span>signal found</span></div>
        </div>
      </div>
    </div>
  );
}

function Scene({ scene, index, message, setMessage }) {
  if (scene.id === "read") return <ReadScene scene={scene} message={message} setMessage={setMessage} />;
  if (scene.id === "socials") return <CardScene scene={scene} items={platforms} />;
  if (scene.id === "resources") return <CardScene scene={scene} items={resources} resource />;
  if (scene.id === "podcast") return <PodcastScene scene={scene} />;
  const visual = sceneVisuals[scene.id] ?? heroVisual;

  return (
    <>
      <Copy scene={scene}>
        <div className="micro-list reveal">
          {details.map((item) => <span key={item}>{item}</span>)}
        </div>
      </Copy>
      <div className="scene-visual reveal" aria-hidden="true">
        <div className="visual-frame">
          <img className="visual-drift" src={visual} alt="" />
          <div className="signal-lines"><span /><span /><span /></div>
          <p>{String(index).padStart(2, "0")}</p>
        </div>
      </div>
    </>
  );
}

function Copy({ scene, children, wide = false }) {
  const article = articleDetails[scene.id];

  return (
    <article className={`scene-copy ${wide ? "wide-copy" : ""}`} data-scene-no={scene.no}>
      <div className="article-meta reveal">
        <span>{scene.no} / {scene.kicker}</span>
        <span>{article?.mode}</span>
      </div>
      <h2 className="reveal">{scene.title}</h2>
      <p className="scene-text reveal">{scene.text}</p>
      {article && (
        <div className="article-extras reveal">
          <div className="article-note">
            <span>NOTE</span>
            <p>{article.note}</p>
          </div>
          <div className="article-tags">
            {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      )}
      {children}
    </article>
  );
}

function ReadScene({ scene, message, setMessage }) {
  return (
    <>
      <Copy scene={scene} />
      <div className="message-panel reveal">
        <div className="message-topline"><span>HALF ONLINE</span><span>now</span></div>
        <div className="message-bubble">{message}</div>
        <div className="read-receipt">已讀</div>
        <button type="button" onClick={() => setMessage(readMessages[Math.floor(Math.random() * readMessages.length)])}>
          換一句訊息
        </button>
      </div>
    </>
  );
}

function CardScene({ scene, items, resource = false }) {
  return (
    <Copy scene={scene} wide>
      <div className={`cards-grid reveal ${resource ? "resources" : "three"}`}>
        {items.map(([name, text, label, href = SUPPORT_URL]) => {
          const className = `info-card ${!href ? "muted" : ""} ${resource ? "resource-card" : ""}`;
          const body = (
            <>
              <span className="card-number">{name}</span>
              <p>{text}</p>
              <strong>{label}</strong>
            </>
          );
          return href ? (
            <a className={className} href={href} target="_blank" rel="noreferrer" key={name}>{body}</a>
          ) : (
            <div className={className} key={name}>{body}</div>
          );
        })}
      </div>
    </Copy>
  );
}

function PodcastScene({ scene }) {
  return (
    <>
      <Copy scene={scene} />
      <div className="podcast-panel reveal">
        <div className="wave-bars" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => <span key={index} style={{ "--delay": `${index * 0.05}s` }} />)}
        </div>
        <h3>聲音篇章</h3>
        <p>請戴上耳機，在一段不必急著回覆的時間裡，聽見那些被留在訊息之外的情緒。</p>
        <button type="button" disabled>即將上線</button>
      </div>
    </>
  );
}
