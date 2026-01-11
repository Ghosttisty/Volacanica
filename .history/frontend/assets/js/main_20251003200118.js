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
    let slides =; // <-- AQUÍ ESTABA EL ERROR, YA CORREGIDO

    // --- CARGA DE AJUSTES GLOBALES ---
    async function loadGlobalSettings() {
        try {
            const response = await fetch(`${API_URL}/site-setting`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.data ||!data.data.attributes) {
                 console.error('Error: No se encontraron los ajustes globales. ¿Publicaste el contenido en "Site Setting"?');
                 return;
            }
            const settings = data.data.attributes;

            // Actualizar nombre del restaurante y título de la página
            document.title = settings.RestaurantName;
            restaurantNameElements.forEach(el => el.textContent = settings.RestaurantName);

            // Inyectar colores personalizados
            const colorStyles = `
                :root {
                    --primary-color: ${settings.PrimaryColor};
                    --secondary-color: ${settings.SecondaryColor};
                }
            `;
            customColorsStyle.innerHTML = colorStyles;

        } catch (error) {
            console.error('Error al cargar los ajustes globales:', error);
        }
    }

    // --- LÓGICA DEL CARRUSEL ---
    async function loadHeroSlides() {
        try {
            const response = await fetch(`${API_URL}/homepage-slides?populate=*`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            slides = data.data;

            if (slides && slides.length > 0) {
                slides.forEach((slideData) => {
                    const slideElement = document.createElement('div');
                    slideElement.classList.add('gta-slider__slide');
                    
                    if (slideData.attributes.Image && slideData.attributes.Image.data) {
                        const imageUrl = slideData.attributes.Image.data.attributes.url;
                        slideElement.style.backgroundImage = `url(http://localhost:1337${imageUrl})`;
                        sliderContainer.appendChild(slideElement);
                    }
                });
                
                if (sliderContainer.children.length > 0) {
                    startSlider();
                }
            }
        } catch (error) {
            console.error('Error al cargar las diapositivas del héroe:', error);
        }
    }
    
    function startSlider() {
        const slideElements = document.querySelectorAll('.gta-slider__slide');
        
        function showNextSlide() {
            slideElements.classList.remove('active');
            currentSlideIndex = (currentSlideIndex + 1) % slideElements.length;
            slideElements.classList.add('active');
        }

        if (slideElements.length > 0) {
            slideElements.classList.add('active');
            setInterval(showNextSlide, 7000); // Cambiar de diapositiva cada 7 segundos
        }
    }

    // --- CARGA DEL MENÚ ---
    async function loadMenu() {
        try {
            const response = await fetch(`${API_URL}/categories?populate[menu_items][populate]=Image`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const categories = data.data;

            menuGrid.innerHTML = ''; // Limpiar el contenedor

            if (categories && categories.length > 0) {
                categories.forEach(categoryData => {
                    const category = categoryData.attributes;
                    const categoryTitle = document.createElement('h3');
                    categoryTitle.classList.add('menu__category-title');
                    categoryTitle.textContent = category.Name;
                    menuGrid.appendChild(categoryTitle);
                    
                    const itemsGrid = document.createElement('div');
                    itemsGrid.classList.add('menu__items-grid');
                    
                    if (category.menu_items && category.menu_items.data.length > 0) {
                        category.menu_items.data.forEach(itemData => {
                            const item = itemData.attributes;
                            const imageUrl = (item.Image && item.Image.data)? `http://localhost:1337${item.Image.data.attributes.url}` : '';
                            const menuItemHTML = `
                                <div class="menu__item">
                                    ${imageUrl? `<img src="${imageUrl}" alt="${item.Name}" class="menu__item-img">` : ''}
                                    <div class="menu__item-content">
                                        <h4 class="menu__item-name">${item.Name}</h4>
                                        <p class="menu__item-description">${item.Description}</p>
                                        <span class="menu__item-price">$${item.Price.toFixed(2)}</span>
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