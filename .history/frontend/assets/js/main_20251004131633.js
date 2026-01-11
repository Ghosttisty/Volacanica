// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // URL base de la API de Strapi, ajustar si es necesario
    const API_URL = 'http://localhost:1337/api';

    // Elementos del DOM
    const sliderContainer = document.getElementById('gta-slider-container');
    const menuGrid = document.getElementById('menu-grid');
    const restaurantNameElements = document.querySelectorAll('#restaurant-name, #restaurant-name-hero, #restaurant-name-footer');
    const customColorsStyle = document.getElementById('custom-colors');

    let currentSlideIndex = 0;
    let slides = [];

    // Utilidad para resolver URLs de imagen de Strapi soportando formatos distintos
    function resolveImageUrl(media) {
        // media puede ser null, un objeto single, o un array
        if (!media) return null;
        // caso single media: media.data.attributes.url
        if (media.data && media.data.attributes && media.data.attributes.url) {
            return media.data.attributes.url;
        }
        // caso media ya en attributes (sin data) o estructura distinta
        if (media.attributes && media.attributes.url) {
            return media.attributes.url;
        }
        // caso array de medias
        if (Array.isArray(media.data) && media.data.length > 0 && media.data[0].attributes && media.data[0].attributes.url) {
            return media.data[0].attributes.url;
        }
        return null;
    }

    // --- CARGA DE AJUSTES GLOBALES ---
    async function loadGlobalSettings() {
        try {
            // intento con nombre singular, si tu collection en Strapi se llama distinto ajústalo
            const candidates = [
                `${API_URL}/site-setting`,
                `${API_URL}/site-settings`,
                `${API_URL}/site-setting?populate=*`,
                `${API_URL}/site-settings?populate=*`
            ];

            let data = null;
            let response = null;
            for (const url of candidates) {
                try {
                    response = await fetch(url);
                    // si la respuesta no es ok continuo al siguiente candidato
                    if (!response.ok) {
                        continue;
                    }
                    data = await response.json();
                    // si la estructura no viene como data.data.attributes, igual es usable
                    if (data) break;
                } catch (err) {
                    // ignoro y pruebo otro candidato
                    console.warn('Fetch falló para', url, err);
                }
            }

            if (!data) {
                console.error('Error: no se pudo obtener respuesta de los endpoints de Site Setting, revisa la URL y que Strapi esté corriendo');
                return;
            }

            // Muchas APIs de Strapi devuelven data.data.attributes, pero podemos soportar varias formas
            const settings = (data.data && data.data.attributes) ? data.data.attributes : data.attributes ? data.attributes : null;

            if (!settings) {
                console.error('Estructura de settings inesperada, mira la respuesta cruda en consola', data);
                return;
            }

            document.title = settings.RestaurantName || 'El Restaurante';
            restaurantNameElements.forEach(el => el.textContent = settings.RestaurantName || 'El Restaurante');

            if (settings.PrimaryColor && settings.SecondaryColor) {
                const colorStyles = `
                    :root {
                        --primary-color: ${settings.PrimaryColor};
                        --secondary-color: ${settings.SecondaryColor};
                    }
                `;
                customColorsStyle.innerHTML = colorStyles;
            }

        } catch (error) {
            console.error('Error al cargar los ajustes globales:', error);
        }
    }

    // --- LÓGICA DEL CARRUSEL ---
    async function loadHeroSlides() {
        try {
            // populate=Image para traer la relación de media, si tu content type se llama distinto adáptalo
            const response = await fetch(`${API_URL}/homepage-slides?populate=Image`);
            if (!response.ok) {
                console.error('Error HTTP al pedir homepage-slides', response.status, response.statusText);
                return;
            }
            const data = await response.json();

            if (!data) {
                console.error('Respuesta vacía al pedir homepage-slides');
                return;
            }

            const rawSlides = data.data ? data.data : (Array.isArray(data) ? data : null);
            if (!rawSlides || rawSlides.length === 0) {
                console.warn('No hay diapositivas en homepage-slides, revisa contenido en Strapi', data);
                return;
            }

            slides = rawSlides;

            slides.forEach((slideData) => {
                // compruebo attributes antes de acceder
                const attributes = slideData && slideData.attributes ? slideData.attributes : null;
                if (!attributes) {
                    console.warn('Slide sin attributes', slideData);
                    return;
                }

                const slideElement = document.createElement('div');
                slideElement.classList.add('gta-slider__slide');

                const imageUrlPath = resolveImageUrl(attributes.Image);
                if (imageUrlPath) {
                    // si la URL no es absoluta, la construimos con host del API
                    const fullUrl = imageUrlPath.startsWith('http') ? imageUrlPath : `${API_URL.replace('/api','')}${imageUrlPath}`;
                    slideElement.style.backgroundImage = `url(${fullUrl})`;
                    sliderContainer.appendChild(slideElement);
                } else {
                    console.warn('Slide sin imagen válida', attributes);
                }
            });

            if (sliderContainer.children.length > 0) {
                startSlider();
            }

        } catch (error) {
            console.error('Error al cargar las diapositivas del héroe:', error);
        }
    }

    function startSlider() {
        const slideElements = document.querySelectorAll('.gta-slider__slide');
        if (slideElements.length === 0) return;

        function showNextSlide() {
            slideElements[currentSlideIndex].classList.remove('active');
            currentSlideIndex = (currentSlideIndex + 1) % slideElements.length;
            slideElements[currentSlideIndex].classList.add('active');
        }

        slideElements[currentSlideIndex].classList.add('active');
        setInterval(showNextSlide, 7000);
    }

    // --- CARGA DEL MENÚ ---
    async function loadMenu() {
        try {
            // populate para traer menu_items y las imágenes asociadas
            const response = await fetch(`${API_URL}/categories?populate[menu_items][populate]=Image`);
            if (!response.ok) {
                console.error('Error HTTP al pedir categories', response.status, response.statusText);
                return;
            }
            const data = await response.json();

            if (!data || !data.data) {
                console.warn('Estructura inesperada al cargar categories', data);
                return;
            }

            const categories = data.data;
            menuGrid.innerHTML = '';

            categories.forEach(categoryData => {
                const catAttrs = categoryData && categoryData.attributes ? categoryData.attributes : null;
                if (!catAttrs) {
                    console.warn('Categoria sin attributes', categoryData);
                    return;
                }

                const categoryTitle = document.createElement('h3');
                categoryTitle.classList.add('menu__category-title');
                // uso fallback si Category es undefined
                categoryTitle.textContent = catAttrs.Category || 'Sin categoría';
                menuGrid.appendChild(categoryTitle);

                const itemsGrid = document.createElement('div');
                itemsGrid.classList.add('menu__items-grid');

                // soporte por si menu_items viene como relación con data o como array directo
                const menuItemsArray = (catAttrs.menu_items && catAttrs.menu_items.data) ? catAttrs.menu_items.data : (Array.isArray(catAttrs.menu_items) ? catAttrs.menu_items : []);

                if (Array.isArray(menuItemsArray) && menuItemsArray.length > 0) {
                    menuItemsArray.forEach(itemData => {
                        const itemAttrs = itemData && itemData.attributes ? itemData.attributes : (itemData ? itemData : null);
                        if (!itemAttrs) {
                            console.warn('Item sin attributes', itemData);
                            return;
                        }

                        const imagePath = resolveImageUrl(itemAttrs.Image);
                        const imageUrl = imagePath ? (imagePath.startsWith('http') ? imagePath : `${API_URL.replace('/api','')}${imagePath}`) : null;

                        const priceValue = (typeof itemAttrs.Price === 'number') ? itemAttrs.Price : parseFloat(itemAttrs.Price) || 0;

                        const menuItem = document.createElement('div');
                        menuItem.classList.add('menu__item');

                        if (imageUrl) {
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            img.alt = itemAttrs.Name || 'Plato';
                            img.classList.add('menu__item-img');
                            menuItem.appendChild(img);
                        }

                        const content = document.createElement('div');
                        content.classList.add('menu__item-content');

                        const nameEl = document.createElement('h4');
                        nameEl.classList.add('menu__item-name');
                        nameEl.textContent = itemAttrs.Name || 'Nombre no disponible';
                        content.appendChild(nameEl);

                        const descEl = document.createElement('p');
                        descEl.classList.add('menu__item-description');
                        descEl.textContent = itemAttrs.Description || '';
                        content.appendChild(descEl);

                        const priceEl = document.createElement('span');
                        priceEl.classList.add('menu__item-price');
                        priceEl.textContent = `$${priceValue.toFixed(2)}`;
                        content.appendChild(priceEl);

                        menuItem.appendChild(content);
                        itemsGrid.appendChild(menuItem);
                    });
                } else {
                    const emptyMsg = document.createElement('p');
                    emptyMsg.textContent = 'No hay items en esta categoría';
                    itemsGrid.appendChild(emptyMsg);
                }

                menuGrid.appendChild(itemsGrid);
            });

        } catch (error) {
            console.error('Error al cargar el menú:', error);
        }
    }

    // --- INICIALIZACIÓN ---
    loadGlobalSettings();
    loadHeroSlides();
    loadMenu();
});
