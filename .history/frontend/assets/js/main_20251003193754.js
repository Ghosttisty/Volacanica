// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // URL base de la API de Strapi (ajustar si es necesario)
    const API_URL = 'http://localhost:1337/api';

    // Elementos del DOM
    const sliderContainer = document.getElementById('gta-slider-container');
    const menuGrid = document.getElementById('menu-grid');
    const restaurantNameElements = document.querySelectorAll('#restaurant-name, #restaurant-name-hero, #restaurant-name-footer');
    const customColorsStyle = document.getElementById('custom-colors');

    let currentSlideIndex = 0;
    let slides = [];

    // --- CARGA DE AJUSTES GLOBALES ---
    async function loadGlobalSettings() {
        try {
            const response = await fetch(`${API_URL}/site-setting`);
            const data = await response.json();
            
            if (data && data.data && data.data.attributes) {
                const settings = data.data.attributes;

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
            } else {
                 console.error('Error: No se encontraron los ajustes globales. ¿Publicaste el contenido en "Site Setting"?');
            }

        } catch (error) {
            console.error('Error al cargar los ajustes globales:', error);
        }
    }

    // --- LÓGICA DEL CARRUSEL ---
    async function loadHeroSlides() {
        try {
            const response = await fetch(`${API_URL}/homepage-slides?populate=Image`);
            const data = await response.json();
            
            if (data && data.data) {
                slides = data.data;

                if (slides.length > 0) {
                    slides.forEach((slideData) => {
                        const slideElement = document.createElement('div');
                        slideElement.classList.add('gta-slider__slide');
                        
                        const imageUrl = slideData.attributes.Image?.data?.attributes?.url;
                        if (imageUrl) {
                            slideElement.style.backgroundImage = `url(http://localhost:1337${imageUrl})`;
                            sliderContainer.appendChild(slideElement);
                        }
                    });
                    
                    if (sliderContainer.children.length > 0) {
                        startSlider();
                    }
                }
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
            // Sintaxis de populate corregida para el error 400
            const response = await fetch(`${API_URL}/categories?populate[menu_items][populate]=Image`);
            const data = await response.json();
            
            if (data && data.data) {
                const categories = data.data;

                menuGrid.innerHTML = '';

                categories.forEach(categoryData => {
                    const category = categoryData.attributes;
                    
                    const categoryTitle = document.createElement('h3');
                    categoryTitle.classList.add('menu__category-title');
                    categoryTitle.textContent = category.Name;
                    menuGrid.appendChild(categoryTitle);
                    
                    const itemsGrid = document.createElement('div');
                    itemsGrid.classList.add('menu__items-grid');
                    
                    if (category.menu_items && Array.isArray(category.menu_items.data)) {
                        category.menu_items.data.forEach(itemData => {
                            const item = itemData.attributes;
                            const imageUrl = item.Image?.data?.attributes?.url;
                            const menuItemHTML = `
                                <div class="menu__item">
                                    ${imageUrl ? `<img src="http://localhost:1337${imageUrl}" alt="${item.Name}" class="menu__item-img">` : ''}
                                    <div class="menu__item-content">
                                        <h4 class="menu__item-name">${item.Name || 'Nombre no disponible'}</h4>
                                        <p class="menu__item-description">${item.Description || ''}</p>
                                        <span class="menu__item-price">$${(item.Price || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            `;
                            itemsGrid.innerHTML += menuItemHTML;
                        });
                    }
                    menuGrid.appendChild(itemsGrid);
                });
            }
        } catch (error) {
            console.error('Error al cargar el menú:', error);
        }
    }

    // --- INICIALIZACIÓN ---
    loadGlobalSettings();
    loadHeroSlides();
    loadMenu();
});