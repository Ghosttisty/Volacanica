
import { gsap } from "./libs/gsap/index.js";
import { ScrollTrigger } from "./libs/gsap/ScrollTrigger.js";

const getAttrs = (entity) => entity?.attributes ?? entity;

export function buildMenuBook(menuItems, mainContainer) {
    if (!menuItems || menuItems.length === 0) return;

    // --- 1. Configuración y Cálculos ---
    // Cada "hoja" física tiene 2 lados (Front y Back).
    // Estructura:
    // [Hoja 1 - Portada]: Front: Título, Back: Introducción/Decoración
    // [Hojas Intermedias]: Front: Plato N, Back: Plato N+1
    // [Hoja Final - Contraportada]: Front: Fin/Logo, Back: Contraportada exterior

    const itemsPerPage = 2; // 1 plato en Front, 1 plato en Back
    const totalDishes = menuItems.length;
    const innerPagesCount = Math.ceil(totalDishes / itemsPerPage);

    // Total páginas DOM = Portada + Intermedias + Contraportada
    // Pero el ejemplo del usuario usa una estructura donde las páginas centrales
    // son las que llevan el contenido.
    // Vamos a simplificar: 
    // Page 0 (Cover): Front=Title, Back=Quote/Intro
    // Page 1..N: Contenido
    // Page N+1 (BackCover): Front=Logo, Back=Leather

    const domPagesCount = 1 + innerPagesCount + 1;

    // --- 2. Crear Contenedor Section ---
    const section = document.createElement('div');
    section.id = 'menu-book-section';
    section.className = 'pin-container h-screen flex items-center justify-center'; // Fondo transparente para ver fluidosflujo si usáramos pin, pero este tiene su propio pin logic
    // Ajustamos altura para el scroll "largo"
    // El ejemplo usa body height = (pages + 2) * scroll.
    // Nosotros usaremos un ScrollTrigger.create con pin.
    section.style.width = "100%";
    section.style.position = "relative";
    section.style.overflow = "hidden";
    // Fondo transparente para que se vean los fluidos
    section.style.backgroundColor = "transparent";

    mainContainer.appendChild(section);

    // --- 3. Generar HTML del Libro ---
    let bookHTML = `
        <div class="book-camera-rig">
            <div class="book" style="--page-count: ${domPagesCount}">
                <div class="book__spine"></div>
    `;

    // --- A. Portada (Index 0) ---
    // Front: Título del Menú. Back: Frase introductoria.
    // Z-Index alto forzado inline para evitar que se vea la contraportada al inicio
    bookHTML += `
        <div class="page book__page book__cover book__cover--front" style="z-index: 100; --page-index: 1">
            <div class="page__half page__half--front">
                <h2 class="cover-title">NUESTRA<br>CARTA</h2>
                <div class="decoration-line"></div>
            </div>
            <div class="page__half page__half--back">
                <div class="page-content center-content">
                    <p class="book-quote">"La cocina es un lenguaje mediante el cual se puede expresar armonía, felicidad, belleza, poesía, complejidad, magia, humor, provocación, cultura"</p>
                </div>
            </div>
        </div>
    `;

    // --- B. Páginas Interiores (Platos) ---
    for (let i = 0; i < innerPagesCount; i++) {
        const dishIndex1 = i * 2;
        const dishIndex2 = i * 2 + 1;
        const dish1 = menuItems[dishIndex1];
        const dish2 = (dishIndex2 < totalDishes) ? menuItems[dishIndex2] : null;

        // Front Side (Plato 1 del par)
        let frontContent = '';
        if (dish1) {
            frontContent = createDishPageContent(dish1, dishIndex1);
        }

        // Back Side (Plato 2 del par, o vacío/liso si no hay)
        let backContent = '';
        if (dish2) {
            backContent = createDishPageContent(dish2, dishIndex2);
        } else {
            backContent = `<div class="page-content center-content"><span class="book-end-mark">❦</span></div>`;
        }

        // Z-index descendente para páginas intermedias
        const zIndex = 50 - i;
        bookHTML += `
            <div class="page book__page" style="z-index: ${zIndex}; --page-index: ${i + 2}">
                <div class="page__half page__half--front">
                    ${frontContent}
                    <div class="page__number">${dishIndex1 + 1}</div>
                </div>
                <div class="page__half page__half--back">
                    ${backContent}
                    <div class="page__number">${dishIndex2 + 1}</div>
                </div>
            </div>
        `;
    }

    // --- C. Contraportada (Última) ---
    bookHTML += `
        <div class="page book__page book__cover book__cover--back" style="z-index: 0; --page-index: ${domPagesCount}">
            <div class="page__half page__half--front">
                  <div class="page-content center-content">
                     <h3 class="font-heading text-4xl" style="color: #C5A059;">Buen Provecho</h3>
                  </div>
            </div>
            <div class="page__half page__half--back">
                <div class="book__insert">
                    <!-- Logo o final -->
                </div>
            </div>
        </div>
    `;

    // --- Correction: Pointer Events Logic & Performance ---
    // Ensure pages don't block clicks when stacked.
    // 'will-change: transform' helps browser optimize 3D rendering layers.
    bookHTML += `<style>
        .book__page { pointer-events: none; will-change: transform; } 
        .page__half { pointer-events: auto; will-change: transform; }
    </style>`;

    bookHTML += `</div></div>`; // Cierres book y rig
    section.innerHTML = bookHTML;

    // --- Configurar Listeners de Click (JS Scoped) ---
    // Usamos etiquetas <a href> reales para robustez, interceptadas para scroll suave.
    section.querySelectorAll('.book-dish-link').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar salto brusco
            const targetId = el.getAttribute('href'); // #dish-N
            if (targetId) {
                if (window.fluidSim) window.fluidSim.setPaused(true);
                gsap.to(window, {
                    scrollTo: { y: targetId, offsetY: 0 },
                    duration: 1.5,
                    ease: 'power2.inOut',
                    onComplete: () => { if (window.fluidSim) window.fluidSim.setPaused(false); }
                });
            }
        });
    });

    // --- 4. Lógica de Animación (GSAP) ---
    // Esperar un tick para que el DOM se asiente
    requestAnimationFrame(() => {
        initBookAnimation(section, domPagesCount);
    });
}

function createDishPageContent(dish, index) {
    const attrs = getAttrs(dish);

    // Lógica para imagen: Preferir la última del sequence si existe
    let imageUrl = '';
    const mediaSeq = getAttrs(attrs.mediaSequence);
    if (Array.isArray(mediaSeq) && mediaSeq.length > 0) {
        // Usar el último frame
        const lastFrame = mediaSeq[mediaSeq.length - 1];
        imageUrl = `${BACKEND_URL}${getAttrs(lastFrame).url}`;
    } else {
        const media = getAttrs(attrs.media);
        if (media) imageUrl = `${BACKEND_URL}${media.url}`;
    }

    const price = attrs.price;
    const name = attrs.name;
    const description = attrs.description || '';

    // Usamos <a> para máxima compatibilidad de UX/Pointer Events
    return `
        <a href="#dish-${index}" class="book-dish-link book-dish-container">
            <h3 class="book-dish-title font-heading">${name}</h3>
            <div class="book-dish-image-wrapper">
                ${imageUrl ? `<img src="${imageUrl}" class="book-dish-image" loading="lazy" />` : ''}
            </div>
            <div class="book-dish-info">
                <p class="book-dish-desc">${description}</p>
                <p class="book-dish-price">${price}</p>
            </div>
        </a>
    `;
}

function initBookAnimation(section, pageCount) {
    const book = section.querySelector('.book');
    const pages = gsap.utils.toArray(section.querySelectorAll('.book__page'));

    // Factor de scroll: Cuánto "espacio" de scroll ocupa el libro.
    // El usuario quería algo "lento", así que aumentamos el espacio vertical.
    const SCROLL_HEIGHT_PER_PAGE = window.innerHeight * 0.75;
    const TOTAL_SCROLL_HEIGHT = (pageCount + 1) * SCROLL_HEIGHT_PER_PAGE;

    // Pinnear la sección completa
    ScrollTrigger.create({
        id: 'menu-book-trigger', // ID para referencia externa
        trigger: section,
        pin: true,
        start: "top top",
        end: `+=${TOTAL_SCROLL_HEIGHT}`,
        scrub: 1, // Suave
        // --- Optimización de Rendimiento ---
        // Pausar simulación de fluidos mientras se interactúa con el libro (Scroll pesado 3D)
        onEnter: () => window.fluidSim?.setPaused(true),
        onLeave: () => window.fluidSim?.setPaused(false),
        onEnterBack: () => window.fluidSim?.setPaused(true),
        onLeaveBack: () => window.fluidSim?.setPaused(false),
        onUpdate: (self) => {
            // Animación general del libro (Escala o rotación global si se desea)
            // Por ahora, solo pasamos páginas basado en el progeso
        }
    });

    // Animar cada página
    // La lógica del usuario usaba un scroll global en body. Aquí usamos un Timeline linkeado al ScrollTrigger del contenedor.
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${TOTAL_SCROLL_HEIGHT}`,
            scrub: 1
        }
    });

    // 1. Zoom in inicial / Fade in
    tl.from(book, { scale: 0.5, opacity: 0, duration: 0.5 }); // Ocupa un poco del inicio

    // 2. Pasar páginas
    // Distribuimos el timeline.
    // Usamos un loop para crear los tweens de cada página.
    // Notas sobre z-index:
    // Page 0 (Cover) está arriba (z=high). Page N está abajo.
    // Al girar, z-index debe cambiar para que la página de atrás se vea correctamente (esto lo maneja preserve-3d, pero el usuario tenía lógica manual de Z).

    // Configuración inicial de Z
    pages.forEach((page, i) => {
        gsap.set(page, { z: (i === 0 ? 100 : -i) }); // Simple stack setup
    });

    pages.forEach((page, i) => {
        if (i === pages.length - 1) return; // La contraportada no se voltea sola (o sí, para cerrar el libro?) - En el ejemplo la última es la back cover, esa no voltea para revelar nada más, es el final.

        // Momento en el timeline
        // duracion relativa: 1
        // posición: i

        const turnDuration = 1;
        const position = i + 0.5; // Empezar un poco después de la entrada

        // Rotación
        tl.to(page, {
            rotationY: -180,
            duration: turnDuration,
            ease: "power1.inOut"
        }, position);

        // Z-Index Switch (Crucial para que las capas se corten bien en 3D CSS a veces)
        // El usuario tenía: z: index === 0 ? -13 : index
        // Simplificado: Al pasar -90 grados, cambiar z-index si es necesario.
        // Con preserve-3d puro a veces no hace falta si están bien desplazadas en Z (translateZ).
        // El usuario tenía `translate3d(0, 0, calc((0.5 * var(--coefficient)) * 1px))`.

        // Vamos a confiar en la rotación por ahora, pero añadimos un pequeño cambio de Z para evitar z-fighting en el plano 0.
        tl.to(page, {
            z: i, // Invertir orden z virtualmente
            duration: turnDuration,
            ease: "none"
        }, position);
    });
}
