(() => {
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  const audioBasePath = !isLocalHost && location.pathname.includes("/online-exhibition-s2/")
    ? "/online-exhibition-s2/audio/"
    : "/audio/";

  const episodes = [
    {
      label: "Podcast 上集",
      note: "AI 的那些二三事：我們習慣遠距離，AI 總是身不由己",
      audio: `${audioBasePath}podcast-upper.mp3`,
      url: "https://youtu.be/ygikUJSXr8k?si=SWZMIUeiPifUnc8o",
    },
    {
      label: "Podcast 下集",
      note: "它才不是 AI，它是我的摯愛知己親朋手足",
      audio: `${audioBasePath}podcast-lower.mp3`,
      url: "https://youtu.be/cwp6rRNKGiI?si=gjjjkoijZV2PfGYn",
    },
  ];

  let rafId = 0;
  let lastActive = -1;

  const visible = (element) => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  };

  const activeSceneIndex = () => {
    const buttons = [...document.querySelectorAll(".section-nav button")];
    const navIndex = buttons.findIndex((button) => button.classList.contains("active"));
    if (navIndex >= 0) return navIndex;
    return [...document.querySelectorAll(".scene")].findIndex((scene) => visible(scene));
  };

  const rectUnion = (rects) => {
    if (!rects.length) return null;
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    return {
      left,
      top,
      right,
      bottom,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  };

  const createEpisodeCard = (episode, index) => {
    const card = document.createElement("article");
    card.className = "podcast-audio-card";

    const heading = document.createElement("h4");
    heading.textContent = `${String(index + 1).padStart(2, "0")} / ${episode.label}`;

    const note = document.createElement("p");
    note.textContent = episode.note;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = episode.audio;
    audio.setAttribute("aria-label", episode.label);

    const fallback = document.createElement("a");
    fallback.href = episode.url;
    fallback.target = "_blank";
    fallback.rel = "noreferrer";
    fallback.textContent = "在 YouTube 開啟";

    audio.addEventListener("loadedmetadata", scheduleFit);
    audio.addEventListener("error", () => {
      card.classList.add("missing-audio");
      fallback.textContent = "音檔未載入，先在 YouTube 開啟";
      scheduleFit();
    });

    card.append(heading, note, audio, fallback);
    return card;
  };

  const enhancePodcast = () => {
    const panel = document.querySelector(".scene-6 .podcast-panel");
    if (!panel || panel.dataset.podcastReady === "true") return;

    const oldButton = panel.querySelector("button");
    if (oldButton) oldButton.hidden = true;

    const list = document.createElement("div");
    list.className = "podcast-audio-list";
    list.setAttribute("aria-label", "Podcast 集數");
    episodes.forEach((episode, index) => list.appendChild(createEpisodeCard(episode, index)));

    panel.appendChild(list);
    panel.dataset.podcastReady = "true";
  };

  const fitActiveScene = () => {
    enhancePodcast();

    const index = activeSceneIndex();
    const scene = document.querySelector(`.scene-${index}`);
    if (!scene) return;

    scene.style.setProperty("--auto-fit-scale", "1");
    scene.removeAttribute("data-auto-fit");

    window.requestAnimationFrame(() => {
      const children = [...scene.children].filter(visible);
      const rects = children
        .map((child) => child.getBoundingClientRect())
        .filter((rect) => rect.width > 8 && rect.height > 8);
      const union = rectUnion(rects);
      if (!union) return;

      const phone = window.matchMedia("(max-width: 520px)").matches;
      const tablet = window.matchMedia("(max-width: 820px)").matches;
      const bottomGuard = phone ? 72 : tablet ? 82 : 96;
      const sideGuard = phone ? 48 : tablet ? 54 : 76;
      const bottomLimit = window.innerHeight - bottomGuard;
      const rightLimit = window.innerWidth - sideGuard;
      const availableHeight = Math.max(220, bottomLimit - union.top);
      const availableWidth = Math.max(240, rightLimit - Math.max(0, union.left));
      const rawScale = Math.min(1, availableWidth / union.width, availableHeight / union.height);
      const minimum = phone ? 0.62 : tablet ? 0.7 : 0.78;
      const scale = Math.max(minimum, Math.min(1, rawScale));

      if (scale < 0.995) {
        scene.dataset.autoFit = "true";
        scene.style.setProperty("--auto-fit-scale", scale.toFixed(3));
      }
    });
  };

  const scheduleFit = () => {
    window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(fitActiveScene);
  };

  const watchActiveScene = () => {
    const index = activeSceneIndex();
    if (index !== lastActive) {
      lastActive = index;
      scheduleFit();
    }
  };

  window.addEventListener("load", scheduleFit);
  window.addEventListener("resize", scheduleFit, { passive: true });
  window.addEventListener("orientationchange", scheduleFit);
  document.addEventListener("click", () => window.setTimeout(scheduleFit, 900), true);

  const observer = new MutationObserver(scheduleFit);
  observer.observe(document.body, { childList: true, subtree: true });

  window.setInterval(watchActiveScene, 350);
  scheduleFit();
})();
