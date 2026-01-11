import { gsap } from "../node_modules/gsap/index.js";
import { ScrollTrigger } from "../node_modules/gsap/ScrollTrigger.js";

const getAttrs = (entity) => entity?.attributes ?? entity;

/**
 * Construye la sección de historia dinámica con scroll horizontal.
 * Esta función espera una estructura de datos específica desde Strapi.
 *
 * ESTRUCTURA ESPERADA EN STRAPI para el componente 'scenes.scene-history':
 * --------------------------------------------------------------------
 * Componente: scene-history
 * Campos:
 * - textGroups (Componente Repetible): "Grupo de Texto Animado"
 * - text (Texto, p.ej. "Nuestra")
 * - style (Enumeración, p.ej. 'default', 'large', 'highlight')
 * - background_color (Color Picker, p.ej. '#FFA500')
 * - text_color (Color Picker, p.ej. '#0a0a0a')
 * - animation_in (Enumeración, p.ej. 'fade-in', 'slide-up', 'scale-in')
 * - decorative_icon (Relación de Medios, opcional): Una imagen para decorar el texto.
 * - icon_position (Enumeración, p.ej. 'top-left', 'bottom-right')
 * - icon_animation (Enumeración, p.ej. 'rotate', 'pop')
 */
export function buildDynamicStorySection(scene, mainContainer) {
    const textGroups = scene.textGroups || [];
    if (textGroups.length === 0) return;

    const section = document.createElement('section');
    section.id = 'dynamic-story-section';
    section.className = 'h-screen w-full overflow-hidden relative bg-transparent';

    const wrapper = document.createElement('div');
    wrapper.className = 'story-wrapper h-full relative flex items-center'; // Usamos flex
    wrapper.style.willChange = 'transform';
    section.appendChild(wrapper);
    mainContainer.appendChild(section);

    // Crear y añadir los elementos de texto e iconos al wrapper
    textGroups.forEach((groupData, index) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'story-group relative shrink-0 mx-12 lg:mx-24'; // shrink-0 evita que flex los encoja
        groupEl.style.visibility = 'hidden'; // Oculto hasta que GSAP lo active

        const textEl = document.createElement('span');
        textEl.className = 'story-text font-heading';
        textEl.textContent = groupData.text || '';

        // Aplicar estilos desde Strapi
        const bgColor = groupData.background_color || 'var(--primary-color, #ffffff)';
        const textColor = groupData.text_color || '#0a0a0a';
        
        textEl.style.backgroundColor = bgColor;
        textEl.style.color = textColor;
        textEl.style.padding = '0.2em 0.5em';
        textEl.style.borderRadius = '0.25em';
        textEl.style.whiteSpace = 'nowrap';
        
        // Estilos basados en la enumeración 'style'
        switch(groupData.style) {
            case 'large':
                textEl.classList.add('text-7xl', 'md:text-9xl');
                break;
            case 'highlight':
                textEl.classList.add('text-6xl', 'md:text-8xl');
                textEl.style.transform = 'rotate(-5deg)';
                break;
            default:
                textEl.classList.add('text-5xl', 'md:text-7xl');
        }
        
        groupEl.appendChild(textEl);
        
        // Añadir icono decorativo si existe
        const iconData = getAttrs(groupData.decorative_icon?.data);
        if (iconData && iconData.url) {
            const iconEl = document.createElement('img');
            iconEl.src = `http://localhost:1337${iconData.url}`;
            iconEl.className = `story-icon absolute w-20 h-20 md:w-32 md:h-32 object-contain`;
            
            // Posicionar icono
            switch(groupData.icon_position) {
                case 'top-left': iconEl.style.cssText = 'top: -50%; left: -25%;'; break;
                case 'bottom-right': iconEl.style.cssText = 'bottom: -50%; right: -25%;'; break;
                // Añadir más posiciones si se necesitan
                default: iconEl.style.cssText = 'top: -50%; right: -25%; transform: rotate(15deg);';
            }
            groupEl.appendChild(iconEl);
        }

        wrapper.appendChild(groupEl);
    });

    // Esperar a que el DOM se actualice para calcular anchos
    requestAnimationFrame(() => {
        const wrapperWidth = wrapper.scrollWidth;
        const horizontalScroll = gsap.to(wrapper, {
            x: () => -(wrapperWidth - window.innerWidth),
            ease: "none",
        });

        ScrollTrigger.create({
            trigger: section,
            pin: true,
            start: "top top",
            end: () => `+=${wrapperWidth}`,
            scrub: 1,
            animation: horizontalScroll,
            invalidateOnRefresh: true, // Recalcula en resize
        });

        // Animar cada grupo de texto
        gsap.utils.toArray('.story-group').forEach(groupEl => {
            const textEl = groupEl.querySelector('.story-text');
            const iconEl = groupEl.querySelector('.story-icon');

            const groupData = textGroups[Array.prototype.indexOf.call(groupEl.parentNode.children, groupEl)];

            // Animación de entrada para el grupo completo
            gsap.from(groupEl, {
                autoAlpha: 0,
                scrollTrigger: {
                    trigger: groupEl,
                    containerAnimation: horizontalScroll,
                    start: "left 80%",
                    toggleActions: 'play none none reverse',
                }
            });

            // Animación específica para el texto
            if (textEl && groupData.animation_in) {
                let fromProps = {};
                switch(groupData.animation_in) {
                    case 'slide-up': fromProps = { yPercent: 100, autoAlpha: 0 }; break;
                    case 'scale-in': fromProps = { scale: 1.5, autoAlpha: 0 }; break;
                    default: fromProps = { autoAlpha: 0 };
                }
                gsap.from(textEl, {
                    ...fromProps,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: groupEl,
                        containerAnimation: horizontalScroll,
                        start: "left 70%",
                        end: "left 40%",
                        scrub: 0.8,
                    }
                });
            }

            // Animación específica para el icono
            if (iconEl && groupData.icon_animation) {
                let iconFromProps = {};
                switch(groupData.icon_animation) {
                    case 'rotate': iconFromProps = { rotate: 180, scale: 0, autoAlpha: 0 }; break;
                    case 'pop': iconFromProps = { scale: 0, autoAlpha: 0 }; break;
                    default: iconFromProps = { autoAlpha: 0 };
                }
                gsap.from(iconEl, {
                    ...iconFromProps,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: groupEl,
                        containerAnimation: horizontalScroll,
                        start: "left 65%",
                        end: "left 35%",
                        scrub: 0.8,
                    }
                });
            }
        });
    });
}
