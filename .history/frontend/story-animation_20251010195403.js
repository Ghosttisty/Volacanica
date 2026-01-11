import { gsap } from "../node_modules/gsap/index.js";
import { ScrollTrigger } from "../node_modules/gsap/ScrollTrigger.js";
import { TextPlugin } from "../node_modules/gsap/TextPlugin.js";
import { SplitText } from "../node_modules/gsap/SplitText.js";

gsap.registerPlugin(TextPlugin, SplitText);

const getAttrs = (entity) => entity?.attributes ?? entity;

export function buildDynamicStorySection(scene, mainContainer) {
    const textGroupsData = scene.textGroups || [];
    if (textGroupsData.length === 0) return;

    const styles = `
        :root{--color-shockingly-green:#0ae448;--color-just-black:#0e100f;--color-surface-white:#fffce1;--color-pink:#fec5fb;--color-orangey:#ff8709;--color-lt-green:#abff84; --gradient-macha:linear-gradient(114.41deg,var(--color-shockingly-green) 20.74%,var(--color-lt-green) 65.5%);--gradient-orange-crush:linear-gradient(111.45deg,var(--color-orangey) 19.42%,#f7bdf8 73.08%);--gradient-purple-haze:linear-gradient(153.58deg,#f7bdf8 32.25%,#2f3cc0 92.68%);}
        .home-animate{ overflow:hidden; background-color: var(--color-just-black); font-family: 'Inter', sans-serif; color: var(--color-surface-white); }
        .home-animate__wrapper{ visibility:hidden; display:flex; height:100vh; width:fit-content; }
        .home-animate__scroll-wrapper{ align-items:center; display:flex; padding-right:37.037vh; width:fit-content; }
        .home-animate__scroll-wrapper span{ display:inline-block; white-space:nowrap; }
        .home-animate__text-track{ align-items:center; display:flex; will-change:transform; }
        .home-animate__text-group, .home-animate__huge{ align-items:center; display:flex; font-size:max(5.625rem,min(5.58824vw + 1.29412rem,8rem)); font-weight:600; line-height:1; position:relative; margin: 0 1.5vw; white-space:nowrap; }
        
        /* Estilos para "Nice" */
        .home-animate__text-group--nice .home-animate__text--purple-gradient{ position:absolute; right:max(6.25rem,min(1.47059vw + 5.11029rem,6.875rem)); top:max(-2rem,min(.441176vw - 2.34191rem,-1.8125rem)); z-index:3; }
        .home-animate__text-group--nice .home-animate__text--orange-gradient{ margin:0 .3125rem 0 .625rem; z-index:2; }
        .home-animate__text-group--nice .home-animate__text--orange-gradient > span { transform:rotate(15.6deg); }

        /* Estilos para cajas de texto coloreadas */
        .home-animate__text{ font-size:max(1.875rem,min(1.17647vw + .963235rem,2.375rem)); position:relative; }
        .home-animate__text:before{ background-color:#000; border-radius:.5rem; content:""; height:100%; left:.9375rem; opacity:.4; position:absolute; top:.9375rem; width:100%; z-index:1; }
        .home-animate__text > span{ border-radius:.5rem; color:var(--color-just-black); display:inline-flex; padding:1rem 1.375rem; position:relative; z-index:2; }
        .home-animate__text--large{ font-size:max(5rem,min(4.41176vw + 1.58088rem,6.875rem)); }
        .home-animate__text--large>span{ padding:.875rem 1.125rem 1rem; }
        .home-animate__text--green-gradient>span{ background:var(--gradient-macha); }
        .home-animate__text--purple-gradient span{ background:var(--gradient-purple-haze); }
        .home-animate__text--pink span{ background:var(--color-pink); }
        .home-animate__text--green > span { background:var(--color-shockingly-green); }
        .home-animate__text--orange span{ background:var(--color-orangey); }
        .home-animate__text--orange-gradient span{ background:var(--gradient-orange-crush); }

        /* Estilos para iconos */
        .home-animate__icon { width: 6rem; height: auto; display: inline-block; vertical-align: middle; margin: 0 1rem; }
        .icon-group { justify-content: center; }
        .icon-group .home-animate__icon { position: absolute; top: -100%; left: 50%; transform: translateX(-50%); width: 5rem; }

        /* --- CORRECCIÓN: Estilos para 'Super' y 'Choreograph' --- */
        .home-animate__text-group--super { perspective: 800px; }
        .home-animate__text-group--super .home-animate__text--green { position:absolute; top:max(-6.25rem,min(-1.47059vw - 4.48529rem,-5.625rem)); z-index:3; left: 0;}
        .home-animate__text-group--super .home-animate__text--green span { transform: rotate(6.5deg); }
        .home-animate__text-group--super .home-animate__text--pink span { transform: rotate(-7.5deg); }
        .home-animate__plug-and-play-wrap { position:relative; }
        .home-animate__text-group--choreograph .home-animate__text--green { position: absolute; left: 30%; top: 103%; z-index: 2; }

        .default-group, .typewriter-group, .icon-group > span, .home-animate__huge { font-family: 'Playfair Display', serif; }
        .typewriter-group { perspective: 400px; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const section = document.createElement('section');
    section.id = 'dynamic-story-section';
    section.className = 'home-animate';
    section.innerHTML = `
        <div id="home-animate-trigger" class="home-animate__wrapper">
            <div class="home-animate__scroll-wrapper">
                <div class="home-animate__text-track"></div>
            </div>
        </div>
    `;
    mainContainer.appendChild(section);
    const track = section.querySelector('.home-animate__text-track');

    textGroupsData.forEach(groupData => {
        let groupHTML = '';
        if (groupData.animation_type === 'nice-group-entry') {
            groupHTML = `<p class="home-animate__text-group home-animate__text-group--nice" aria-hidden="true">
                <span class="home-animate__text home-animate__text--green-gradient home-animate__text--large"><span>${groupData.text_1 || ''}</span></span>
                <span class="home-animate__text home-animate__text--purple-gradient"><span>${groupData.text_2 || ''}</span></span>
                <span class="home-animate__text home-animate__text--orange-gradient"><span>${groupData.text_3 || ''}</span></span>
            </p>`;
        } 
        else if (groupData.animation_type === 'huge-pop') {
            groupHTML = `<p class="home-animate__huge">${groupData.text_1 || ''}</p>`;
        }
        else if (groupData.animation_type === 'super-group') {
            groupHTML = `<p class="home-animate__text-group home-animate__text-group--super">
                <span class="home-animate__text home-animate__text--green home-animate__text--large"><span>${groupData.text_1 || ''}</span></span>
                <span class="home-animate__plug-and-play-wrap">
                    <span class="home-animate__text home-animate__text--pink home-animate__text--large"><span>${groupData.text_2 || ''}</span></span>
                </span>
            </p>`;
        }
        else if (groupData.animation_type === 'choreograph-group') {
            const iconUrl = groupData.icon ? `http://localhost:1337${getAttrs(groupData.icon).url}` : '';
            groupHTML = `<p class="home-animate__text-group home-animate__text-group--choreograph">
                <span class="home-animate__text home-animate__text--pink home-animate__text--large"><span>${groupData.text_1 || ''}</span></span>
                ${iconUrl ? `<img class="home-animate__icon home-animate__icon--key" src="${iconUrl}" />` : ''}
                <span class="home-animate__text home-animate__text--green home-animate__text--large"><span>${groupData.text_2 || ''}</span></span>
                <span class="home-animate__text home-animate__text--orange home-animate__text--large"><span>${groupData.text_3 || ''}</span></span>
            </p>`;
        }
        else if (groupData.animation_type === 'icon-hand-float' && groupData.icon) {
             const iconData = getAttrs(groupData.icon);
             const iconUrl = `http://localhost:1337${iconData.url}`;
             groupHTML = `<p class="home-animate__text-group icon-group">
                <span>${groupData.text_1 || ''}</span>
                <img class="home-animate__icon" src="${iconUrl}" alt="${iconData.alternativeText || 'icon'}"/>
                <span>${groupData.text_2 || ''}</span>
             </p>`;
        }
        else if (groupData.animation_type === 'typewriter') {
            groupHTML = `<p class="home-animate__text-group typewriter-group">${groupData.text_1 || ''}</p>`;
        }
        else {
            groupHTML = `<p class="home-animate__text-group default-group">${groupData.text_1 || ''}</p>`;
        }
        track.innerHTML += groupHTML;
    });
    
    requestAnimationFrame(() => {
        const trigger = document.querySelector("#home-animate-trigger");
        const trackEl = document.querySelector(".home-animate__text-track");
        if (!trackEl.children.length) return;

        gsap.set(".home-animate__wrapper",{visibility:"visible"});
        gsap.set(trackEl, { x: window.innerWidth });

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger,
                start: "top top",
                end: () => `+=${trackEl.scrollWidth * 1.5}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
        scrollTl.to(trackEl, { x: () => -(trackEl.scrollWidth - window.innerWidth / 2 + trackEl.lastElementChild.offsetWidth / 2), ease: "none" });

        const animConfigs=[
            // Huge Pop
            {sel:".home-animate__huge", props:{scale:1.5,opacity:0}, end:"left center"},
            // Super Group
            {sel:".home-animate__text-group--super .home-animate__text--green", props:{rotation:-45,yPercent:400}, end:"left center"},
            {sel:".home-animate__plug-and-play-wrap", props:{rotationX:90,transformOrigin:"center top"}, end:"left center"},
            // Choreograph Group
            {sel:".home-animate__text-group--choreograph .home-animate__text--pink", props:{xPercent:-100,opacity:0}, end:"left center"},
            {sel:".home-animate__text-group--choreograph .home-animate__icon--key", props:{rotation:360,scale:0}, end:"left center"},
            {sel:".home-animate__text-group--choreograph .home-animate__text--green", props:{yPercent:100,opacity:0}, end:"left center"},
            {sel:".home-animate__text-group--choreograph .home-animate__text--orange", props:{xPercent:100,opacity:0}, end:"left center"},
        ];

        // --- CORRECCIÓN: Separar 'to' de 'from' ---
        // Animaciones "from" (la mayoría)
        animConfigs.forEach(cfg=>{
            const config={scrollTrigger:{trigger:cfg.trigger||cfg.sel, containerAnimation:scrollTl, start: cfg.start || "left 80%", end:cfg.end||"left 50%", scrub:1}};
            gsap.from(cfg.sel, {...cfg.props, ...config});
        });
        
        // Animaciones "to" (solo 'nice-group' por ahora)
        const niceGroupConfig = {
            opacity:1, 
            scrollTrigger: { 
                trigger: ".home-animate__text-group--nice", 
                containerAnimation: scrollTl, 
                start: "left right", 
                end: "left 75%", 
                scrub:1 
            }
        };
        gsap.to(".home-animate__text-group--nice", niceGroupConfig);
        gsap.from(".home-animate__text-group--nice .home-animate__text--green-gradient", {scale:.6,xPercent:-20, scrollTrigger: { trigger: ".home-animate__text-group--nice", containerAnimation: scrollTl, start: "left right", end: "left center", scrub: 1}});
        gsap.from(".home-animate__text-group--nice .home-animate__text--purple-gradient", {rotation:-15,yPercent:-100, scrollTrigger: { trigger: ".home-animate__text-group--nice", containerAnimation: scrollTl, start: "left right", end: "left center", scrub: 1}});
        gsap.from(".home-animate__text-group--nice .home-animate__text--orange-gradient", {rotation:15,scale:.8, scrollTrigger: { trigger: ".home-animate__text-group--nice", containerAnimation: scrollTl, start: "left right", end: "left center", scrub: 1}});


        gsap.utils.toArray('.default-group, .icon-group, .typewriter-group').forEach(group => {
            gsap.from(group, { opacity: 0, scrollTrigger: { trigger: group, containerAnimation: scrollTl, start: "left 90%", end: "left 80%", scrub: true }});
        });

        gsap.utils.toArray('.icon-group .home-animate__icon').forEach(icon => {
            gsap.from(icon, { rotation:-45, yPercent:100, opacity:0, scrollTrigger: { trigger: icon.parentElement, containerAnimation:scrollTl, start:"left 80%", end:"left 60%", scrub:1 } });
        });

        gsap.utils.toArray('.typewriter-group').forEach(group => {
            const splitChars = new SplitText(group, { type: 'chars' });
            gsap.from(splitChars.chars, {
                opacity: 0, scale: 0, y: 80, rotationX: 180, transformOrigin: "0% 50% -50", ease: "back.out",
                stagger: { amount: 0.8 },
                scrollTrigger: { trigger: group, containerAnimation: scrollTl, start: "left 80%", end: "left 40%", scrub: 1.5 }
            });
        });
        
        ScrollTrigger.refresh();
        window.addEventListener('resize', () => ScrollTrigger.refresh());
    });
}

