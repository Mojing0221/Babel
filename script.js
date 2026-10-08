/**
 * 角色資料庫設定
 * desc: 可直接使用 \n 進行換行，或使用反引號 (``) 自由折行
 */
const FACTION_CHARACTERS = {
    cult: [
        {
            name: "黑羊",
            enName: "Meilita",
            quote: "「瑪■亞、瑪利■、■■亞」",
            desc: "「捨棄污穢、升入天土…」\n「送世人往天土去…那是我們夢寐以求的，無病；無苦；無災的樂園」\n「我做到了，誇誇我…誇誇我吧■■…你在哪裡…？」",
            emblemImg: "../Babel/Img/Emblem_Eye.png",
            fullImg: "../Babel/Img/Role/Meilita_Plot.png",
            chibiImg: "../Babel/Img/Role/Meilita_Chibi.png"
        }
    ],
    rose: [
        {
            name: "莎莉絲特",
            enName: "Celeste",
            quote: "「……孚里埃？…不，你是、誰？」",
            desc: "冷靜而麻木、瘋狂而暴烈，失去一切的女人，將一切愛恨壓抑於爆炸的火光。\n當與故人相似的外來者出現，恍惚、怨嘆及憤怒一瞬化作猛烈的煙花。",
            emblemImg: "../Babel/Img/Emblem_Eye.png",
            fullImg: "../Babel/Img/Role/Celeste_Plot.png",
            chibiImg: "../Babel/Img/Role/Celeste_Battle.png"
        }
    ],
    tech: [
        {
            name: "主角",
            enName: "Protagonist",
            quote: "「……可以，尾款我要監察機關的管理權。」",
            desc: "初次踏入示拿的外來者，在大義與過去陰霾的驅使下，前往「天災」起始之地。\n——與天災似而不同的是，她曾有過身為人類的母親。",
            emblemImg: "../Babel/Img/Emblem_Eye.png",
            fullImg: "../Babel/Img/Role/Protagonist_Plot.png",
            chibiImg: "../Babel/Img/Role/Protagonist_Q.png"
        },
        {
            name: "盤長",
            enName: "PanChang",
            quote: "「看在你跟死人差不多的臉色上，算你九折吧。」",
            desc: "神秘的引路人，身兼軍火販子和情報商等多重身份。\n對島上的情況瞭若指掌，遊走於各方之間，看不清真心與真意。",
            emblemImg: "../Babel/Img/Emblem_Eye.png",
            fullImg: "../Babel/Img/Role/PanChang_Plot.png",
            chibiImg: "../Babel/Img/Role/PanChang-Q.png"
        }
    ]
};

/**
 * 圖片快取快照容器
 */
const imageCache = new Map();

/**
 * 取得所有角色圖片清單
 */
const getCharacterImageUrls = () => {
    const urls = new Set();
    Object.values(FACTION_CHARACTERS).forEach(list => {
        list.forEach(char => {
            if (char.emblemImg) urls.add(char.emblemImg);
            if (char.fullImg) urls.add(char.fullImg);
            if (char.chibiImg) urls.add(char.chibiImg);
        });
    });
    return Array.from(urls);
};

/**
 * 預加載單張圖片
 */
const preloadSingleImage = (url) => {
    return new Promise((resolve) => {
        if (!url || url.trim() === '') {
            resolve({ url, status: 'empty' });
            return;
        }

        const img = new Image();
        img.src = url;

        img.onload = () => {
            imageCache.set(url, { status: 'success', img });
            resolve({ url, status: 'success' });
        };

        img.onerror = () => {
            imageCache.set(url, { status: 'error', img: null });
            resolve({ url, status: 'error' });
        };
    });
};

/**
 * 批次預加載所有角色資源
 */
const preloadAllCharacterAssets = () => {
    const urls = getCharacterImageUrls();
    return Promise.all(urls.map(url => preloadSingleImage(url)));
};

/**
 * 安全設置圖片來源與顯示
 */
const setSafeImage = (imgEl, src, altText) => {
    if (!imgEl) return;

    if (!src || src.trim() === '') {
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        imgEl.classList.add('img-hidden');
        return;
    }

    const cached = imageCache.get(src);
    if (cached && cached.status === 'error') {
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        imgEl.classList.add('img-hidden');
        return;
    }

    imgEl.src = src;
    imgEl.alt = altText || '';
    imgEl.classList.remove('img-hidden');
};

/**
 * 綁定圖片載入錯誤處理，避免破圖渲染
 */
const setupImageErrorHandling = () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.removeAttribute('src');
            img.alt = '';
            img.classList.add('img-hidden');
        });
    });
};

/**
 * 模組 0：資源載入遮罩（整合靜態與動態預加載）
 */
const initLoader = () => {
    const windowLoadPromise = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    });

    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

    Promise.race([
        Promise.all([windowLoadPromise, preloadAllCharacterAssets()]),
        timeoutPromise
    ]).then(() => {
        if (document.body.classList.contains('loaded')) return;
        document.body.classList.add('loaded');
        initRevealAnimations();
    });
};

/**
 * 模組 1：頂部導覽列滾動行為控制
 */
const initNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    const hideThreshold = 100;

    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop && currentScroll > hideThreshold) {
            navbar.style.top = '-100px';
        } else {
            navbar.style.top = '20px';
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
};

/**
 * 模組 2：元素進入視窗動畫
 */
const initRevealAnimations = () => {
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -25% 0px',
        threshold: 0.15
    };

    revealElements.forEach((element) => {
        if (element.closest('#hero')) {
            element.classList.add('active');
            return;
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealObserver.observe(element);
    });
};

/**
 * 模組 3：右側垂直導覽列滾動監控 (Scroll Spy)
 */
const initScrollSpy = () => {
    const sections = document.querySelectorAll('section, footer');
    const navDots = document.querySelectorAll('.side-dot');

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navDots.forEach(dot => dot.classList.remove('active'));
                const id = entry.target.getAttribute('id');
                const activeDot = document.querySelector(`.side-dot[href="#${id}"]`);
                if (activeDot) {
                    activeDot.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.id) {
            scrollSpyObserver.observe(section);
        }
    });
};

/**
 * 模組 4：主視覺區塊滑鼠視差透視效果
 */
const initHeroParallax = () => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        hero.style.setProperty('--mouseX', `${percentX * -15}px`);
        hero.style.setProperty('--mouseY', `${percentY * -15}px`);
    });

    hero.addEventListener('mouseleave', () => {
        hero.style.setProperty('--mouseX', '0px');
        hero.style.setProperty('--mouseY', '0px');
    });
};

/**
 * 模組 5：陣營畫框點擊與角色介紹彈窗系統
 */
const initCharacterModal = () => {
    const modal = document.getElementById('character-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    const nameEl = document.getElementById('char-name');
    const enNameEl = document.getElementById('char-en-name');
    const quoteEl = document.getElementById('char-quote');
    const descEl = document.getElementById('char-desc');
    const emblemImgEl = document.getElementById('char-emblem-img');
    const chibiImgEl = document.getElementById('char-chibi-img');
    const fullImgEl = document.getElementById('char-full-img');

    let currentFaction = 'rose';
    let currentCharIndex = 0;

    const renderCharacter = () => {
        const list = FACTION_CHARACTERS[currentFaction];
        if (!list || list.length === 0) return;

        const char = list[currentCharIndex];
        nameEl.textContent = char.name;
        enNameEl.textContent = char.enName;
        quoteEl.textContent = char.quote;
        descEl.textContent = char.desc;

        setSafeImage(emblemImgEl, char.emblemImg, `${char.name} 陣營圖騰`);
        setSafeImage(chibiImgEl, char.chibiImg, `${char.name} 小立繪`);
        setSafeImage(fullImgEl, char.fullImg, `${char.name} 主立繪`);
    };

    const openModal = (factionKey) => {
        if (!FACTION_CHARACTERS[factionKey]) return;
        currentFaction = factionKey;
        currentCharIndex = 0;
        renderCharacter();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    document.querySelectorAll('.collage-item[data-faction]').forEach(item => {
        item.addEventListener('click', () => {
            const faction = item.getAttribute('data-faction');
            openModal(faction);
        });
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const list = FACTION_CHARACTERS[currentFaction];
        currentCharIndex = (currentCharIndex - 1 + list.length) % list.length;
        renderCharacter();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const list = FACTION_CHARACTERS[currentFaction];
        currentCharIndex = (currentCharIndex + 1) % list.length;
        renderCharacter();
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
};

initLoader();

document.addEventListener('DOMContentLoaded', () => {
    setupImageErrorHandling();
    initNavbarScroll();
    initScrollSpy();
    initHeroParallax();
    initCharacterModal();
});