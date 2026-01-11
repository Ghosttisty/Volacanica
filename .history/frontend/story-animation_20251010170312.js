import { gsap } from "../node_modules/gsap/index.js";
import { ScrollTrigger } from "../node_modules/gsap/ScrollTrigger.js";

const getAttrs = (entity) => entity?.attributes ?? entity;

// --- DICCIONARIO DE ANIMACIONES FIELES AL ORIGINAL ---
// Cada función aquí crea una animación específica de la web de referencia.
const animationLibrary = {
    // Animación para el grupo "Nice and Easy Easing"
    'nice-group-entry': (elements, scrollTl) => {
        const { text_1, text_2, text_3 } = elements;
        gsap.to(elements.group, {
            opacity: 1,
            scrollTrigger: {
                trigger: elements.group,
                containerAnimation: scrollTl,
                start: "left 85%",
                end: "left 75%",
                scrub: 1,
            }
        });
        gsap.from(text_1, { scale: 0.6, xPercent: -20, scrollTrigger: { trigger: elements.group, containerAnimation: scrollTl, start: "left 80%", end: "left center", scrub: 1 } });
        gsap.from(text_2, { rotation: -15, yPercent: -100, scrollTrigger: { trigger: elements.group, containerAnimation: scrollTl, start: "left 80%", end: "left center", scrub: 1 } });
        gsap.from(text_3, { rotation: 15, scale: 0.8, scrollTrigger: { trigger: elements.group, containerAnimation: scrollTl, start: "left 80%", end: "left center", scrub: 1 } });
    },
    // Animación para el icono de la mano
    'icon-hand-float': (elements, scrollTl) => {
        gsap.from(elements.icon, { rotation: -45, yPercent: 100, opacity: 0, scrollTrigger: { trigger: elements.group, containerAnimation: scrollTl, start: "left 80%", end: "left center", scrub: 1 } });
    },
    // Animación para la palabra "Personality"
    'personality-pop': (elements, scrollTl) => {
        gsap.from(elements.text_1, { scale: 0.5, opacity: 0, scrollTrigger: { trigger: elements.group, containerAnimation: scrollTl, start: "left 80%", end: "left center", scrub: 1 } });
    },
    // Puedes añadir TODAS las demás animaciones de la referencia aquí...
    'default-fade-in': (elements, scrollTl) => {
        gsap.from(elements.group, {
            opacity: 0,
            scale: 0.9,
            scrollTrigger: {
                trigger: elements.group,
                containerAnimation: scrollTl,
                start: "left 80%",
                end: "left 60%",
                scrub: 1,
            }
        });
    }
};


export function buildDynamicStorySection(scene, mainContainer) {
    const textGroupsData = scene.textGroups || [];
    if (textGroupsData.length === 0) return;

    // Inyectamos los estilos FIELES al original
    const styles = `
        .home-animate { overflow: hidden; background-color: #0e100f; font-family: 'Inter', sans-serif; }
        .home-animate__wrapper { visibility: hidden; display:flex; height:100vh; width:fit-content; }
        .home-animate__scroll-wrapper { align-items: center; display: flex; padding-right: 37.037vh; width: fit-content; }
        .home-animate__text-track { align-items: center; display: flex; will-change: transform; }
        .home-animate__text-group { display: flex; flex-wrap: nowrap; align-items: center; font-size: max(4rem, min(4vw + 1rem, 6rem)); font-weight: 600; line-height: 1; position: relative; margin: 0 5vw; white-space: nowrap; }
        .home-animate__text { position: relative; margin: 0 0.5rem;}
        .home-animate__text:before { background-color: #000; border-radius: 0.5rem; content: ""; height: 100%; left: 0.5rem; opacity: 0.4; position: absolute; top: 0.5rem; width: 100%; z-index: 1; }
        .home-animate__text > span { border-radius: 0.5rem; color: #0e100f; display: inline-flex; padding: 1rem 1.375rem; position: relative; z-index: 2; }
        .home-animate__text--large > span { font-size: max(5rem, min(4.41176vw + 1.58088rem, 6.875rem)); padding: 0.875rem 1.125rem 1rem; }
        .home-animate__icon { width: 6rem; height: auto; display: inline-block; vertical-align: middle; }
        .home-animate-simple-text { color: #fffce1; margin: 0 0.5rem; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const section = document.createElement('section');
    section.id = 'dynamic-story-section';
    section.className = 'home-animate';

    const wrapperHTML = `
        <div id="home-animate-trigger" class="home-animate__wrapper">
            <div class="home-animate__scroll-wrapper">
                <div id="story-text-track" class="home-animate__text-track"></div>
            </div>
        </div>
    `;
    section.innerHTML = wrapperHTML;
    mainContainer.appendChild(section);

    const track = section.querySelector("#story-text-track");

    // Construimos dinámicamente el contenido del track desde Strapi
    textGroupsData.forEach(groupData => {
        const groupEl = document.createElement('div');
        groupEl.className = 'home-animate__text-group';
        groupEl.dataset.animation = groupData.animation_type || 'default-fade-in';

        // Estructura para el grupo "nice"
        if (groupData.animation_type === 'nice-group-entry') {
            groupEl.style.opacity = 0; // Oculto hasta que GSAP lo anime
            groupEl.innerHTML = `
                <div class="home-animate__text home-animate__text--large" data-child="text_1" style="z-index: 2;">
                    <span style="background: linear-gradient(114.41deg, #0ae448 20.74%, #abff84 65.5%);">${groupData.text_1 || ''}</span>
                </div>
                <div class="home-animate__text" data-child="text_2" style="position: absolute; top: -50%; right: 100%; z-index: 3;">
                    <span style="background: linear-gradient(153.58deg, #f7bdf8 32.25%, #2f3cc0 92.68%);">${groupData.text_2 || ''}</span>
                </div>
                <div class="home-animate__text" data-child="text_3" style="z-index: 2;">
                    <span style="background: linear-gradient(111.45deg, #ff8709 19.42%, #f7bdf8 73.08%); transform: rotate(15.6deg);">${groupData.text_3 || ''}</span>
                </div>
            `;
        } 
        // Estructura para un grupo con un icono
        else if (groupData.icon) {
             const iconData = getAttrs(groupData.icon.data);
             groupEl.innerHTML = `
                <span class="home-animate-simple-text">${groupData.text_1 || ''}</span>
                <div class="home-animate__icon" data-child="icon">
                    <img src="http://localhost:1337${iconData.url}" alt="${iconData.alternativeText || 'icon'}"/>
                </div>
                <span class="home-animate-simple-text">${groupData.text_2 || ''}</span>
             `;
        }
        // Estructura por defecto
        else {
             groupEl.innerHTML = `<span class="home-animate-simple-text">${groupData.text_1 || ''}</span>`;
        }
        track.appendChild(groupEl);
    });

    requestAnimationFrame(() => {
        const trigger = section.querySelector("#home-animate-trigger");
        const trackEl = section.querySelector("#story-text-track");

        gsap.set(".home-animate__wrapper", { visibility: "visible" });

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger,
                start: "top top",
                end: () => `+=${trackEl.scrollWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
        scrollTl.to(trackEl, { x: () => -(trackEl.scrollWidth - window.innerWidth), ease: "none" });
        
        // Aplicamos las animaciones de la librería
        gsap.utils.toArray('.home-animate__text-group').forEach(group => {
            const animationName = group.dataset.animation;
            const animFunc = animationLibrary[animationName];

            if (animFunc) {
                // Preparamos un objeto con los elementos internos para la función de animación
                const elements = { 
                    group,
                    text_1: group.querySelector('[data-child="text_1"]'),
                    text_2: group.querySelector('[data-child="text_2"]'),
                    text_3: group.querySelector('[data-child="text_3"]'),
                    icon: group.querySelector('[data-child="icon"]'),
                };
                animFunc(elements, scrollTl);
            }
        });

        ScrollTrigger.refresh();
    });
}
