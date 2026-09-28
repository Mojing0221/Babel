/**
 * 模組 0：資源載入遮罩
 */
const initLoader = () => {
    const removeLoader = () => {
        // 防止重複執行
        if (document.body.classList.contains('loaded')) return;
        
        document.body.classList.add('loaded');
        // 確保排版（圖片高度）完全穩定後，才啟動視窗滾動監測
        initRevealAnimations();
    };
    
    window.addEventListener('load', removeLoader);
    
    // 最大等待時間 3 秒
    setTimeout(removeLoader, 3000); 
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
        // 只有在元素真正進入視窗下方 25% 範圍時才觸發，避免頁面開啟時一次全部動畫觸發
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

// 立即執行載入條監聽
initLoader();

// DOM 載入完成後初始化其餘腳本 (移除了 initRevealAnimations，改由 initLoader 觸發)
document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initScrollSpy();
    initHeroParallax();
});