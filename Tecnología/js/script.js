document.addEventListener('DOMContentLoaded', function() {

    // --- MENÚ HAMBURGUESA ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNavWrapper = document.querySelector('.main-nav-wrapper');
    const navLinks = document.querySelectorAll('.main-nav-wrapper nav ul li a');

    function toggleMenu() {
        if (mainNavWrapper && menuToggle) {
            mainNavWrapper.classList.toggle('open');
            menuToggle.classList.toggle('open');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mainNavWrapper && mainNavWrapper.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Asegurarse de que el menú se cierre si el tamaño de la ventana cambia (de móvil a desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mainNavWrapper && mainNavWrapper.classList.contains('open')) {
            mainNavWrapper.classList.remove('open');
            menuToggle.classList.remove('open');
        }
    });

    // --- ANIMACIÓN DE REVELACIÓN AL HACER SCROLL ---

    const fadeInElements = document.querySelectorAll('.fade-in-section, .fade-in-item');

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(element => {
        observer.observe(element);
    });

    function checkInitialVisibility() {
        fadeInElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                element.classList.add('is-visible');
                observer.unobserve(element);
            }
        });
    }

    checkInitialVisibility();


    // --- MANEJO BÁSICO DEL FORMULARIO DE CONTACTO (SIMULACIÓN) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            formStatus.classList.remove('success', 'error');
            formStatus.style.display = 'block';
            formStatus.textContent = 'Enviando mensaje...';

            setTimeout(() => {
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    formStatus.textContent = '¡Mensaje enviado con éxito! Te responderé pronto.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    formStatus.textContent = 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
                    formStatus.classList.add('error');
                }
            }, 1500);
        });
    }

    // --- Lógica de Paginación para Categorías de Playlists (AÑADIR ESTO) ---

// Selecciona todas las tarjetas de categoría. Es importante que esta selección
// se haga DESPUÉS de que todas las tarjetas estén consolidadas en un solo .category-grid en el HTML.
const categoryCards = document.querySelectorAll('#playlist-categories .category-grid .playlist-category'); 
const prevCategoryPageBtn = document.getElementById('prevCategoryPage');
const nextCategoryPageBtn = document.getElementById('nextCategoryPage');
const paginationNumbersContainer = document.getElementById('paginationNumbers');

const itemsPerPage = 6; // Cuántas tarjetas mostrar por página. AJUSTA ESTE NÚMERO si quieres más o menos.
let currentPage = 1;
// Calcula el total de páginas basándose en la cantidad de tarjetas y las que se muestran por página
let totalPages = Math.ceil(categoryCards.length / itemsPerPage);

function displayCategoryPage(page) {
    // Asegúrate de que la página no se salga de los límites
    currentPage = Math.max(1, Math.min(page, totalPages));

    // **AÑADIR ESTA LÍNEA:** Guardar el número de página actual en localStorage
    localStorage.setItem('lastCategoryPage', currentPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Oculta todas las tarjetas primero
    categoryCards.forEach(card => {
        card.style.display = 'none';
    });

    // Muestra solo las tarjetas de la página actual
    for (let i = startIndex; i < endIndex && i < categoryCards.length; i++) {
        const card = categoryCards[i];
        card.style.display = 'flex'; // Usamos 'flex' porque tus tarjetas son flexbox
        // Opcional: Si quieres que la animación de fade-in se dispare cada vez que cambias de página
        // Remueve la clase y luego la añade con un pequeño retraso para re-disparar la animación
        // card.classList.remove('fade-in-item', 'is-visible');
        // setTimeout(() => {
        //     card.classList.add('fade-in-item', 'is-visible');
        // }, 50); // Un pequeño retraso para que el navegador "vea" el cambio
    }

    updatePaginationControls();
    updatePageNumbers();
}

function updatePaginationControls() {
    // Deshabilita los botones si no hay páginas previas/siguientes
    if (prevCategoryPageBtn) {
        prevCategoryPageBtn.disabled = currentPage === 1;
    }
    if (nextCategoryPageBtn) {
        nextCategoryPageBtn.disabled = currentPage === totalPages;
    }
}

function updatePageNumbers() {
    if (!paginationNumbersContainer) return; // Salir si el contenedor no existe

    paginationNumbersContainer.innerHTML = ''; // Limpiar números anteriores
    for (let i = 1; i <= totalPages; i++) {
        const pageNumberSpan = document.createElement('span');
        pageNumberSpan.classList.add('page-number');
        pageNumberSpan.textContent = i;
        if (i === currentPage) {
            pageNumberSpan.classList.add('active'); // Marca el número de página actual
        }
        // Añade un evento click a cada número de página
        pageNumberSpan.addEventListener('click', () => displayCategoryPage(i));
        paginationNumbersContainer.appendChild(pageNumberSpan);
    }
}

// Event Listeners para los botones de paginación
if (prevCategoryPageBtn) {
    prevCategoryPageBtn.addEventListener('click', () => {
        displayCategoryPage(currentPage - 1);
    });
}

if (nextCategoryPageBtn) {
    nextCategoryPageBtn.addEventListener('click', () => {
        displayCategoryPage(currentPage + 1);
    });
}

// Inicializar la paginación al cargar la página
// Esto se ejecuta cuando el DOM está completamente cargado y las tarjetas ya existen.
// Asegúrate de que esta llamada a displayCategoryPage(1) no entre en conflicto
// con tu lógica existente de 'fade-in-section' si oculta inicialmente las tarjetas.
// Si tus tarjetas ya están ocultas por 'fade-in-item' y solo se muestran con scroll,
// esta paginación las manejará, pero quizás necesites ajustar la visibilidad inicial de 'fade-in-item'
// para que la primera página sea visible de inmediato.
document.addEventListener('DOMContentLoaded', () => {
    // Recalcular totalPages si las tarjetas se cargan dinámicamente o después del inicio
    totalPages = Math.ceil(categoryCards.length / itemsPerPage);
    if (categoryCards.length > 0) {
        displayCategoryPage(1); // Muestra la primera página al cargar
    }
});

    // --- REPRODUCTOR DE MÚSICA PERSONALIZADO ---

    const audioPlayerSection = document.getElementById('custom-audio-player');
    if (!audioPlayerSection) {
        console.log("No se encontró la sección del reproductor de audio personalizado. Saltando inicialización del reproductor.");
        return;
    }

    const audio = new Audio();
    let currentSongIndex = 0;
    let isPlaying = false;
    let volumeBeforeMute = 1;

    const playerArtwork = document.getElementById('player-artwork');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('player-progress-bar');
    const playerSeek = document.getElementById('player-seek');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute-btn');
    const playlistContainer = document.getElementById('playlist');

    // --- NUEVA ESTRUCTURA PARA MÚLTIPLES PLAYLISTS ---
    const allPlaylists = {

        'dj-yoval-gonzalez': [ // DJ YOVAL GONZÁLEZ
            {
                src: 'audio/Dj Yoval Gonzalez/Agua Ardiente  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Agua Ardiente',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Aguardiente.png'
            },
            {
                src: 'audio/Dj Yoval Gonzalez/La isla Bonita - DJ Yoval Gonzalez (Afro Lantin Remix).mp3',
                title: 'La Isla Bonita',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/La Isla Bonita.png'
            },
            {
                src: 'audio/Dj Yoval Gonzalez/Oliver Twist - DJ Yoval Gonzalez (Mashup) _afrolatin _remix.mp3',
                title: 'Oliver Twist',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Oliver Twist.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Afro Tropical Afro REMIX DJ Yoval Gonzalez afrohouse afrolatin 2022.mp3',
                title: 'Afro Tropical Afro Remix',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Afro Tropical Afro Remix.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Amañando  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Amañando',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Amañando.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Bad  DJ Yoval Gonzalez Private.mp3',
                title: 'Bad',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/BAD.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Bahari  DJ Yoval Gonzalez Original Mix afro latin house.mp3',
                title: 'Bahari',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Bahari.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Cafe Con Ron (DJ Yoval Gonzalez Remix) _afrohousemusic.mp3',
                title: 'Café Con Ron',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Café Con Ron.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Caipiriña Remix  DJ Yoval Gonzalez Tech Version.mp3',
                title: 'Caipiriña Remix',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Caipiriña Remix.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/caipiriña  DJ Yoval Gonzalez OriginalMix afro house latin.mp3',
                title: 'Caipiriña',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Caipiriña.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Daikiry  DJ Yoval Gonzalez Original mix.mp3',
                title: 'Daikiry',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Daikiry.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/DJ Yoval Gonzalez  Sunday Beach WAIKIKI   DJ SET 001  2 de Jul 2023 afrohouse2023.mp3',
                title: 'Sunday Beach WAIKIKI DJ SET 001',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Sunday Beach.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Flow Oriental DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Flow Oriental',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Flow Oriental.png'
            },
            
            {
                src: 'audio/Dj Yoval Gonzalez/DJ Yoval González - Danzar.mp3',
                title: 'Danzar',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Danzar.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/El Cartel - DJ Yoval Gonzalez (Original Mix) _afrohousemusic.mp3',
                title: 'El Cartel',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/El Cártel.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/En Pinta  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'En Pinta',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/En Pinta.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/En Margarita  DJ Yoval Gonzalez EXTENDER Miami305record.mp3',
                title: 'En Margarita',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Margarita.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Kora Spirit  DJ Yoval Gonzalez  DJ Frank Antony Bootleg afrohouse2023.mp3',
                title: 'Kora Spirit',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Kora Spirit.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Pal pueblo  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Pal Pueblo',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Pal Pueblo.png'
            }, 

            {
                src: 'audio/Dj Yoval Gonzalez/Paveo  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Paveo',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Paveo.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Perico  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Perico',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Perico.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Rockett - DJ Yoval Gonzalez (Original Mix) _afrohousemusic.mp3',
                title: 'Rockett',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/ROCKETT.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Saifex - DJ Yoval Gonzalez (Original Mix) _housemusichd.mp3',
                title: 'Saifex',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Saifex.png'
            }, 

            {
                src: 'audio/Dj Yoval Gonzalez/Sambo  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Sambo',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Sambo.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Sea Lion Woman  Bob Sinclar DJ Yoval Gonzalez Remix  afrolatinhouse.mp3',
                title: 'Sea Lion Woman',
                artist: 'Bob Sinclar & DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Sea Lion Woman.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/SHOFAR  Farruko K4G DJ Yoval Gonzalez Remix.mp3',
                title: 'SHOFAR',
                artist: 'Farruko & DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Shofar.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Stop Stop  DJ Yoval Gonzalez Private.mp3',
                title: 'Stop Stop',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Stop Stop.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/SUAVE - DJ Yoval Gonzalez (Afro Remix).mp3',
                title: 'SUAVE',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Suave.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/TIKITOM - DJ Yoval Gonzalez (Original Mix).mp3',
                title: 'TIKITOM',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/TIKITOM.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Tribu Waikiki  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Tribu Waikiki',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Tribu Waikiki.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Tumba  DJ Yoval Gonzalez Original Mix.mp3',
                title: 'Tumba',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Tumba.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Vacilar - DJ Yoval Gonzalez (Original Mix) _afrohousemusic.mp3',
                title: 'Vacilar',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Vacilar.png'
            },

            {
                src: 'audio/Dj Yoval Gonzalez/Virus - DJ Yoval Gonzalez (Original Mix) _latintechhouse.mp3',
                title: 'Virus',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Virus.png'
            }, 

            {
                src: 'audio/Dj Yoval Gonzalez/Your Party  Yoval Gonzalez Original Mix tendências afrolatino 2023.mp3',
                title: 'Your Party',
                artist: 'DJ Yoval Gonzalez',
                artwork: 'img/Caratulas/Your Party.png'
            },

            
            // Añade más canciones de DJ Yoval Gonzalez aquí si tienes
        ],
        'Salsa de Erick Franchesky': [ // ERICK FRANCHESKY
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/1. Aférrate A Mi.mp3',
                title: 'Aférrate A Mi',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/2. Aguanta Corazón.mp3',
                title: 'Aguanta Corazón',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/3. Aguardiente De Caña.mp3',
                title: 'Aguardiente De Caña',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/3. soñando-contigo.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/4. Alta Marea.mp3',
                title: 'Alta Marea',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/5. Ando Buscando Un Amor.mp3',
                title: 'Ando Buscando Un Amor',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/Amor.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/6. Dime Cómo Llego a Ti.mp3',
                title: 'Dime Cómo Llego a Ti',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/5. erick-franchesky_erick.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/7. Dulces Besos.mp3',
                title: 'Dulces Besos',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/6. Erick.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/8. Hazme Sentir.mp3',
                title: 'Hazme Sentir',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/3. soñando-contigo.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/9. La Cantaleta.mp3',
                title: 'La Cantaleta',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/10. La Carretera.mp3',
                title: 'La Carretera',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/7. La Carretera.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/11. Las Mujeres.mp3',
                title: 'Las Mujeres',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/8. Las Mujeres.jpg' 
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/12. No La Molestes.mp3',
                title: 'No La Molestes',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/8. Las Mujeres.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/13. Por Ella.mp3',
                title: 'Por Ella',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/3. soñando-contigo.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/14. Psicosis.mp3',
                title: 'Psicosis',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/2. Erick Franchesky.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/15. Qué Sabes Tu.mp3',
                title: 'Qué Sabes Tu',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/7. La Carretera.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/16. Que Tentación.mp3',
                title: 'Que Tentación',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/9. erick-franchesky_40-anos-40-exitos.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/17. Si Ella Supiera.mp3',
                title: 'Si Ella Supiera',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/18. Si Ella Supiera 2.mp3',
                title: 'Si Ella Supiera 2',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/10. Si ella supiera.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/19. Soñando.mp3',
                title: 'Sonando',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/3. soñando-contigo.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/20. Supongo.mp3',
                title: 'Supongo',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/7. La Carretera.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/21. Te Olvidaré.mp3',
                title: 'Te Olvidaré',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg' 
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/22. Tú.mp3',
                title: 'Tu',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/8. Las Mujeres.jpg'
            },

            {
                src: 'audio/2. Salsa/1. Erick Franchesky/23. Tu Carino Se Me Va.mp3',
                title: 'Tu Carino Se Me Va',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/8. Las Mujeres.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/24. Y Fuiste Mia.mp3',
                title: 'Y Fuiste Mia',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/1. El Ángel de la Salsa.jpg'
            },
            {
                src: 'audio/2. Salsa/1. Erick Franchesky/25. Fantasía Herida.mp3',
                title: 'Fantasía Herida',
                artist: 'Erick Franchesky',
                artwork: 'img/Caratulas/Salsa/Erick Franchesky/6. Erick.jpg'
            },
            // Añade más canciones de Salsa de Erick Franchesky
        ],
        'Salsa - David Zahan': [ // DAVID ZAHAN
            {
                src: 'audio/2. Salsa/2. David Zahan/1. Ahora Me Toca A Mí (Reviviendo a Frankie Ruiz).mp3',
                title: 'Ahora Me Toca A Mi',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/2. Amantes De Otro Tiempo (Reviviendo a Frankie Ruiz).mp3',
                title: 'Amantes De Otro Tiempo',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/3. Bailando (Reviviendo a Frankie Ruiz).mp3',
                title: 'Bailando',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/4. Como Lloro (Reviviendo a Frankie Ruiz).mp3',
                title: 'Como Lloro',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/5. Cómo Lo Hacen (Reviviendo a Frankie Ruiz).mp3',
                title: 'Cómo Lo Hacen',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/6. Contigo No.mp3',
                title: 'Contigo No',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Dímelo.mp3',
                title: 'Dímelo',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/8. Esa Muchachita (Yo Me LLamo Frankie Ruíz).mp3',
                title: 'Esa Muchachita',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/9. Falso Juramento.mp3',
                title: 'Falso Juramento',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/10. Media Mujer.mp3',
                title: 'Media Mujer',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/11. Vacío Vivo.mp3',
                title: 'Vacío Vivo',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/12. Ya No hay Amor Ft Yelsid.mp3',
                title: 'Ya No hay Amor',
                artist: 'David Zahan Ft Yelsid',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/13. Deseándote (Reviviendo a Frankie Ruiz).mp3',
                title: 'Deseándote',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/14. Desnúdate Mujer (Reviviendo a Frankie Ruiz).mp3',
                title: 'Desnúdate Mujer',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/15. Esta Cobardía (Reviviendo a Frankie Ruiz).mp3',
                title: 'Esta Cobardía',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/16. Imposible Amor (Reviviendo a Frankie Ruiz).mp3',
                title: 'Imposible Amor',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/19. Lo Dudo (Reviviendo a Frankie Ruiz).mp3',
                title: 'Lo Dudo',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/20. Me Acostumbré (Reviviendo a Frankie Ruiz).mp3',
                title: 'Me Acostumbré',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/21. Mi Libertad (Reviviendo a Frankie Ruiz).mp3',
                title: 'Mi Libertad',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/22. Mirándote (Reviviendo A Frankie Ruiz).mp3',
                title: 'Mirándote',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/23. Mujer (Reviviendo a Frankie Ruiz).mp3',
                title: 'Mujer',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/24. No Supiste Esperar (Reviviendo a Frankie Ruiz).mp3',
                title: 'No Supiste Esperar',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/25. Nunca te quedas (Reviviendo a Frankie Ruiz).mp3',
                title: 'Nunca te quedas',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/26. Para Darte Fuego (Reviviendo A Frankie Ruiz).mp3',
                title: 'Para Darte Fuego',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/27. Que Se Mueran De Envidia (Reviviendo a Frankie Ruiz).mp3',
                title: 'Que Se Mueran De Envidia',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/28. Quiero Llenarte (Reviviendo a Frankie Ruiz).mp3',
                title: 'Quiero Llenarte',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/29. Quiero Verte (Reviviendo a Frankie Ruiz).mp3',
                title: 'Quiero Verte',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/30. Si Te Entregas A Mi (Reviviendo a Frankie Ruiz).mp3',
                title: 'Si Te Entregas A Mi',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/31. Tú Con El (Reviviendo a Frankie Ruiz).mp3',
                title: 'Tú Con El',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },

            {
                src: 'audio/2. Salsa/2. David Zahan/32. Tu Me Vuelves Loco (Reviviendo a Frankie Ruiz).mp3',
                title: 'Tu Me Vuelves Loco',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            {
                src: 'audio/2. Salsa/2. David Zahan/33. Y No Puedo (Reviviendo A Frankie Ruiz).mp3',
                title: 'Y No Puedo',
                artist: 'David Zahan',
                artwork: 'img/Caratulas/Salsa/David Zahan.jpg'
            },
            // Añade más canciones...
        ],
        'Salsa - Eddie Santiago': [ // EDDIE SANTIAGO
            {
                src: 'audio/2. Salsa/3. Eddie Santiago/1. Amada Amante.mp3',
                title: 'Amada Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/2. Amar A Muerte.mp3',
                title: 'Amar A Muerte',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/3. Amor de cada día.mp3',
                title: 'Amor de cada día',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/4. De Profesión Tu Amante.mp3',
                title: 'De Profesión Tu Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/5. De Vuelta A Casa.mp3',
                title: 'De Vuelta A Casa',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/6. Tu Me Quemas.mp3',
                title: 'Tu Me Quemas',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/7. Antidoto y Veneno.mp3',
                title: 'Antidoto y Veneno',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/8. El Triste.mp3',
                title: 'El Triste',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/9. Flor Dormida.mp3',
                title: 'Flor Dormida',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/10. Lluvia.mp3',
                title: 'Lluvia',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/11. Me Fallaste.mp3',
                title: 'Me Fallaste',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/12. Nadie Mejor Que Tu.mp3',
                title: 'Nadie Mejor Que Tu',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/1. Amada Amante.mp3',
                title: 'Amada Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/13. Somos.mp3',
                title: 'Amada Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/14. Fantasia Herida.mp3',
                title: 'Fantasia Herida',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/15. Hagámoslo.mp3',
                title: 'Hagámoslo',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/1. Amada Amante.mp3',
                title: 'Amada Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/16. Insaciable.mp3',
                title: 'Insaciable',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/17. Jamás.mp3',
                title: 'Jamás',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/18. Nena.mp3',
                title: 'Nena',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/19. Parece Que Fue Ayer.mp3',
                title: 'Parece Que Fue Ayer',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/20. Quiero Amarte En La Yerba.mp3',
                title: 'Quiero Amarte En La Yerba',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/21. Te Amo.mp3',
                title: 'Te Amo',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/22. Tu Amigo o Tu Amante.mp3',
                title: 'Tu Amigo o Tu Amante',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/23. Volcán De Amor.mp3',
                title: 'Volcán De Amor',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/24. Que Locura Enamorarme De Ti.mp3',
                title: 'Que Locura Enamorarme De Ti',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/25. Cada Vez Otra Vez.mp3',
                title: 'Cada Vez Otra Vez',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/26. Cabalgata.mp3',
                title: 'Cabalgata',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/27. Cada Vez.mp3',
                title: 'Cada Vez',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/28. Mañana.mp3',
                title: 'Mañana',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/29. Todo Empezó.mp3',
                title: 'Todo Empezó',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },

            {
                src: 'audio/2. Salsa/3. Eddie Santiago/30. Tu Me Haces Falta.mp3',
                title: 'Tu Me Haces Falta',
                artist: 'Eddie Santiago',
                artwork: 'img/Caratulas/Salsa/Eddie Santiago.png'
            },
            // Añade más descubrimientos  
        ],

        'Salsa - Willie González': [ // WILLIE GONZÁLEZ
            {
                src: 'audio/2. Salsa/4. Willie González/1. Abrázame.mp3',
                title: 'Abrázame',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/2. Amame Toda La Noche.mp3',
                title: 'Amame Toda La Noche',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/3. Amor Pirata.mp3',
                title: 'Amor Pirata',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/4. Cómo Te Atreves.mp3',
                title: 'Cómo Te Atreves',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/5. Cuando Pienses En Mi.mp3',
                title: 'Cuando Pienses En Mi',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/6. Cuando Se Quiere Perdonar.mp3',
                title: 'Cuando Se Quiere Perdonar',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/7. Dame Una Oportunidad.mp3',
                title: 'Dame Una Oportunidad',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/8. Déjame Saciarme de Ti.mp3',
                title: 'Déjame Saciarme de Ti',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/9. Devuélveme.mp3',
                title: 'Devuélveme',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/10. Doble Vida.mp3',
                title: 'Doble Vida',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/11. En la Intimidad.mp3',
                title: 'En la Intimidad',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/12. Enamorado de Ti.mp3',
                title: 'Enamorado de Ti',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/13. Enamorado De Ti 2.mp3',
                title: 'Enamorado De Ti 2',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/14. Entre La Tierra Y El Cielo.mp3',
                title: 'Entre La Tierra Y El Cielo',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/15. Entrégame Tus Besos.mp3',
                title: 'Entrégame Tus Besos',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/16. Eres Todo Y Mucho Más.mp3',
                title: 'Eres Todo Y Mucho Más',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/17. Esa.mp3',
                title: 'Esa',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/18. Hazme Olvidarla.mp3',
                title: 'Hazme Olvidarla',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/19. He Vuelto.mp3',
                title: 'He Vuelto',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/20. Irremediablemente.mp3',
                title: 'Irremediablemente',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/21. Me Muero.mp3',
                title: 'Me Muero',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/22. Mi Mundo Tu.mp3',
                title: 'Mi Mundo Tu',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/23. No Es Casualidad.mp3',
                title: 'No Es Casualidad',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/24. Nuestro Amor Perfecto.mp3',
                title: 'Nuestro Amor Perfecto',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/25. Pequeñas Cosas.mp3',
                title: 'Pequeñas Cosas',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/26. Perdóname Amor.mp3',
                title: 'Perdóname Amor',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/27. Por Qué No Estas Conmigo.mp3',
                title: 'Por Qué No Estas Conmigo',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/28. Qué Estás Buscando.mp3',
                title: 'Qué Estás Buscando',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/29. Quiero Comenzar.mp3',
                title: 'Quiero Comenzar',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/30. Quiero Morir En Tu Piel.mp3',
                title: 'Quiero Morir En Tu Piel',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/31. Quiero Recuperarte.mp3',
                title: 'Quiero Recuperarte',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/32. Quiero.mp3',
                title: 'Quiero',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/33. Recuerda Que Siempre Te Quiero.mp3',
                title: 'Recuerda Que Siempre Te Quiero',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/14. Entre La Tierra Y El Cielo.mp3',
                title: 'Entre La Tierra Y El Cielo',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/34. Seda.mp3',
                title: 'Seda',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/35. Si Supieras.mp3',
                title: 'Si Supieras',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/36. Si Tu Fueras Mía.mp3',
                title: 'Si Tu Fueras Mía',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/37. Siempre Provocando.mp3',
                title: 'Siempre Provocando',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/38. Solamente Ella.mp3',
                title: 'Solamente Ella',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/39. Solos Tu Y Yo.mp3',
                title: 'Solos Tu Y Yo',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/40. Soy Tu Amante.mp3',
                title: 'Soy Tu Amante',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/37. Siempre Provocando.mp3',
                title: 'Siempre Provocando',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/41. Tan Solo.mp3',
                title: 'Tan Solo',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/42. Tanto Amor.mp3',
                title: 'Tanto Amor',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/43. Te Quiero Estrenar.mp3',
                title: 'Te Quiero Estrenar',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/44. Tómame Como Soy.mp3',
                title: 'Tómame Como Soy',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/45. Tú.mp3',
                title: 'Tú',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/46. Un Amor Como El Nuestro.mp3',
                title: 'Un Amor Como El Nuestro',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/47. Una Vez Más.mp3',
                title: 'Una Vez Más',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/48. Vuelve.mp3',
                title: 'Vuelve',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/49. Cómo Se Queda.mp3',
                title: 'Cómo Se Queda',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },

            {
                src: 'audio/2. Salsa/4. Willie González/50. No Podrás Escapar de Mi.mp3',
                title: 'No Podrás Escapar de Mi',
                artist: 'Willie González',
                artwork: 'img/Caratulas/Salsa/Willie González.jpg'
            },
        ],

        'Salsa - Paquito Guzmán': [ // PAQUITO GUZMÁN
            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/1. Anoche Llegaste Tarde.mp3',
                title: 'Anoche Llegaste Tarde',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/2. Cinco Noches.mp3',
                title: 'Cinco Noches',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/3. Deja La Luz Encendida.mp3',
                title: 'Deja La Luz Encendida',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/4. Directo Al Corazón.mp3',
                title: 'Directo Al Corazón',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/3. Deja La Luz Encendida.mp3',
                title: 'Deja La Luz Encendida',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/5. Necesito.mp3',
                title: 'Necesito',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/6. A Millon.mp3',
                title: 'A Millon',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/7. Bésame Morenita.mp3',
                title: 'Bésame Morenita',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/8. De Piel a Piel.mp3',
                title: 'De Piel a Piel',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/9. De Punta A Punta.mp3',
                title: 'De Punta A Punta',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/10. Dónde Estás Amor.mp3',
                title: 'Dónde Estás Amor',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/11. Ella Es Tú Fuiste.mp3',
                title: 'Ella Es Tú Fuiste',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/12. Hueso Na Má.mp3',
                title: 'Hueso Na Má',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/13. Para No Perderte.mp3',
                title: 'Para No Perderte',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/14. Ven O Voy.mp3',
                title: 'Ven O Voy',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/2. Cinco Noches.mp3',
                title: 'Cinco Noches',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/15. Ya Salgo.mp3',
                title: 'Ya Salgo',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/16. Yolanda.mp3',
                title: 'Yolanda',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/17. Por Haberte Amado Tanto.mp3',
                title: 'Por Haberte Amado Tanto',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/18. Qué Voy Hacer Sin Ti.mp3',
                title: 'Qué Voy Hacer Sin Ti',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/19. Quieta.mp3',
                title: 'Quieta',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/20. Se Nos Rompió El Amor.mp3',
                title: 'Se Nos Rompió El Amor',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/21. 25 Rosas.mp3',
                title: '25 Rosas',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/22. Ser Amantes.mp3',
                title: 'Ser Amantes',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/23. Todo.mp3',
                title: 'Todo',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/24. Tu Amante.mp3',
                title: 'Tu Amante',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/25. Tú Decides.mp3',
                title: 'Tú Decides',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/26. Vivir a Solas.mp3',
                title: 'Vivir a Solas',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },

            {
                src: 'audio/2. Salsa/5. Paquito Guzmán/27. Y Es Que Llegaste Tu.mp3',
                title: 'Y Es Que Llegaste Tu',
                artist: 'Paquito Guzmán',
                artwork: 'img/Caratulas/Salsa/Paquito Guzmán.jpg'
            },
        ],

        'Salsa - Tito Rojas': [ // TITO ROJAS
            {
                src: 'audio/2. Salsa/6. Tito Rojas/1. A Ti Volveré.mp3',
                title: 'A Ti Volveré',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/2. América.mp3',
                title: 'América',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/3. Amor Del Bueno.mp3',
                title: 'Amor Del Bueno',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/4. Claro.mp3',
                title: 'Claro',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/5. Condéname A Tu Amor.mp3',
                title: 'Condéname A Tu Amor',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/6. Conjunto Sabroso.mp3',
                title: 'Conjunto Sabroso',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/7. Cuando Estoy Contigo.mp3',
                title: 'Cuando Estoy Contigo',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/8. Cuando Regrese.mp3',
                title: 'Cuando Regrese',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' 
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/9. Después De Dios Las Mujeres.mp3',
                title: 'Después De Dios Las Mujeres',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/10. Dime Si Eres Feliz.mp3',
                title: 'Dime Si Eres Feliz',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/11. El Gallo No Olvida.mp3',
                title: 'El Gallo No Olvida',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/12. Ella Se Hizo Deseo.mp3',
                title: 'Ella Se Hizo Deseo',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/13. Enamórame.mp3',
                title: 'Enamórame',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/14. Es Mi Mujer.mp3',
                title: 'Es Mi Mujer',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/15. Hoy Se Lo Digo A Esa Mujer.mp3',
                title: 'Hoy Se Lo Digo A Esa Mujer',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/16. La Gente Dice.mp3',
                title: 'La Gente Dice',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/17. Llegó.mp3',
                title: 'Llegó',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/18. Lo que te queda (Remasterizada).mp3',
                title: 'Lo que te queda (Remasterizada)',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/19. Lo Que Te Queda.mp3',
                title: 'Lo Que Te Queda',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/20. Me Mata La Soledad.mp3',
                title: 'Me Mata La Soledad',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/21. Nada Es Posible Sin Ti.mp3',
                title: 'Nada Es Posible Sin Ti',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/22. Nadie Es Eterno.mp3',
                title: 'Nadie Es Eterno',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/23. Ni Fio Ni Doy Ni Presto.mp3',
                title: 'Ni Fio Ni Doy Ni Presto',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/24. No Hay Güiro.mp3',
                title: 'No Hay Güiro',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/25. Por Esa Mujer.mp3',
                title: 'Por Esa Mujer',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/26. Por Mujeres Como Tu.mp3',
                title: 'Por Mujeres Como Tu',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/27. Por Que Te Quiero Tanto.mp3',
                title: 'Por Que Te Quiero Tanto',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/28. Porque Este Amor.mp3',
                title: 'Porque Este Amor',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/29. Quiero Hacerte el Amor.mp3',
                title: 'Quiero Hacerte el Amor',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/30. Quiero Llenar Tu Vida.mp3',
                title: 'Quiero Llenar Tu Vida',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/31. Quiero Ser Tuyo.mp3',
                title: 'Quiero Ser Tuyo',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/32. Señora De Madrugada.mp3',
                title: 'Señora De Madrugada',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/33. Seré Seré.mp3',
                title: 'Seré Seré',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/34. Siempre Seré.mp3',
                title: 'Siempre Seré',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/35. Te Amo Tanto.mp3',
                title: 'Te Amo Tanto',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/36. Te Quiero Para Mi.mp3',
                title: 'Te Quiero Para Mi',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/37. Ahora Contigo.mp3',
                title: 'Ahora Contigo',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/38. He Chocado Con La Vida.mp3',
                title: 'He Chocado Con La Vida',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/39. Señora.mp3',
                title: 'Señora',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/40. Tormenta De Amor.mp3',
                title: 'Tormenta De Amor',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg' // Asegúrate de tener estas carátulas
            },

            {
                src: 'audio/2. Salsa/6. Tito Rojas/41. Usted.mp3',
                title: 'Usted',
                artist: 'Tito Rojas',
                artwork: 'img/Caratulas/Salsa/Tito Rojas.jpg'
            },
        ],

        'Grupo Galé': [ // GRUPO GALÉ
            {
                src: 'audio/2. Salsa/7. Grupo Galé/1. Perdóname.mp3',
                title: 'Perdóname',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/3. grupo-gale_20-de-julio.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/2. Ya No Te Puedo Amar.mp3',
                title: 'Ya No Te Puedo Amar',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/2. grupo-gale_sinapariencias.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/3. A Cali.mp3',
                title: 'A Cali',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/4. grupo-gale_frivolo.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/4. Aquella.mp3',
                title: 'Aquella',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/4. grupo-gale_frivolo.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/5. Ave María Pues.mp3',
                title: 'Ave María Pues',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/6. grupo-gale_grandes-hits.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/6. Beso A Beso.mp3',
                title: 'Beso A Beso',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/7. grupo-gale_10-anos.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/7. Chela.mp3',
                title: 'Chela',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/1. grupo-gale_autentico.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/8. Cómo Duele Llorar.mp3',
                title: 'Cómo Duele Llorar',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/8. grupo-gale_galeria.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/9. Con Lo Mucho Que Ha Llovido.mp3',
                title: 'Con Lo Mucho Que Ha Llovido',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/9. llovido.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/10. De Qué Vale.mp3',
                title: 'De Qué Vale',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/10.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/11. Descarga Galé.mp3',
                title: 'Descarga Galé',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/11.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/12. Dime',
                title: 'Dime',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/12.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/13. Dime Qué Nos Pasó.mp3',
                title: 'Dime Qué Nos Pasó',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/14. El Amor De Mi Vida Se Fué.mp3',
                title: 'El Amor De Mi Vida Se Fué',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/15. El Galán.mp3',
                title: 'El Galán',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/16. Fantasía.mp3',
                title: 'Fantasía',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/17. Frívolo.mp3',
                title: 'Frívolo',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/18. Fantasía 2.mp3',
                title: 'Fantasía 2',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/19. Mi Vecina.mp3',
                title: 'Mi Vecina',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/5. grupo-gale_15-aniversario.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/20. Nadie Te Ama Como Yo.mp3',
                title: 'Nadie Te Ama Como Yo',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/21. Nadie Te Ama Como Yo 2.mp3',
                title: 'Nadie Te Ama Como Yo 2',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/20. Nadie Te Ama Como Yo.mp3',
                title: 'Nadie Te Ama Como Yo',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/22. Para Siempre.mp3',
                title: 'Para Siempre',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/23. Soy Como Soy.mp3',
                title: 'Soy Como Soy',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/24. Ya No Te Puedo Amar.mp3',
                title: 'Ya No Te Puedo Amar',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/25. La Gente Pide.mp3',
                title: 'La Gente Pide',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/26. Más Que Amor.mp3',
                title: 'Más Que Amor',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/27. Me Basta.mp3',
                title: 'Me Basta',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/28. Mi Raza.mp3',
                title: 'Mi Raza',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/29. Mi Vecina.mp3',
                title: 'Mi Vecina',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            }, 

            {
                src: 'audio/2. Salsa/7. Grupo Galé/30. Mientras Tiemblas.mp3',
                title: 'Mientras Tiemblas',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/31. No La Descuides.mp3',
                title: 'No La Descuides',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/32. No Puedo No Debo.mp3',
                title: 'No Puedo No Debo',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/33. Para Siempre.mp3',
                title: 'Para Siempre',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/34. Qué Nos pasó 2.mp3',
                title: 'Qué Nos pasó 2',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/35. Qué Tumbao.mp3',
                title: 'Qué Tumbao',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/36. Quiero Besarte.mp3',
                title: 'Quiero Besarte',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/37. Quisiera.mp3',
                title: 'Quisiera',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/38. Quizás Manana.mp3',
                title: 'Quizás Manana',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/39. Regresa Pronto.mp3',
                title: 'Regresa Pronto',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/41. Soy Como Soy.mp3',
                title: 'Soy Como Soy',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/42. Soy Latino.mp3',
                title: 'Soy Latino',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/43. Te Amo.mp3',
                title: 'Te Amo',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/44. Urgente.mp3',
                title: 'Urgente',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },

            {
                src: 'audio/2. Salsa/7. Grupo Galé/45. Ven A Medellin.mp3',
                title: 'Ven A Medellin',
                artist: 'Grupo Galé',
                artwork: 'img/Caratulas/Salsa/Galé/13.jpg'
            },
        ],

        'Frankie Ruiz': [ // FRANKIE RUIZ
            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/1. Ahora Me Toca a Mi.mp3',
                title: 'Ahora Me Toca a Mi',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/2. Amantes De Otro Tiempo.mp3',
                title: 'Amantes De Otro TiempoA Gozar',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/3. Bailando.mp3',
                title: 'Bailando',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/4. Cómo Lo Hacen.mp3',
                title: 'Cómo Lo Hacen.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/5. Deseandote.mp3',
                title: 'Deseandote.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/6. Desnúdate Mujer.mp3',
                title: 'Desnúdate Mujer.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/7. Dile A El.mp3',
                title: 'Dile A El.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/8. El Camionero.mp3',
                title: 'El Camionero.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/9. En Época De Celo.mp3',
                title: 'En Época De Celo.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/10. Esta Cobardía.mp3',
                title: 'Esta Cobardía.mp3',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/11. La Rueda.mp3',
                title: 'La Rueda',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/12. Mirándote.mp3',
                title: 'Mirándote',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/13. Viajera.mp3',
                title: 'Viajera',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/14. Vuelvo a Nacer.mp3',
                title: 'Vuelvo a Nacer',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/15. Háblame.mp3',
                title: 'Háblame',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/16. Imposible Amor.mp3',
                title: 'Imposible Amor',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/17. La Cura.mp3',
                title: 'La Cura',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/18. La Rueda Vuelve A Rodar.mp3',
                title: 'La Rueda Vuelve A Rodar',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/19. La Vecina.mp3',
                title: 'La Vecina',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/20. Lo Dudo.mp3',
                title: 'Lo Dudo',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/21. Me Acostumbré.mp3',
                title: 'Me Acostumbré',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/22. Mi Fórmula De Amor.mp3',
                title: 'Mi Fórmula De Amor',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/23. Mi Libertad.mp3',
                title: 'Mi Libertad',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/24. Mirándote.mp3',
                title: 'Mirándote',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/25. Mujer.mp3',
                title: 'Mujer',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/26. No Dudes De Mi.mp3',
                title: 'No Dudes De Mi',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/27. No Me Hables Mal De Ella.mp3',
                title: 'No Me Hables Mal De Ella',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/28. Complícame.mp3',
                title: 'Complícame',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/29. Entre El Fuego Y La Pared.mp3',
                title: 'Entre El Fuego Y La Pared',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/30. Esta Vez Si Voy Pa Encima.mp3',
                title: 'Esta Vez Si Voy Pa Encima',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/31. Ella Tiene Que Saber.mp3',
                title: 'Ella Tiene Que Saber',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/32. Me Faltas.mp3',
                title: 'Me Faltas',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/33. No Que No.mp3',
                title: 'No Que No',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/34. Nunca Te Quedas.mp3',
                title: 'Nunca Te Quedas',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/35. Para Darte Fuego.mp3',
                title: 'Para Darte Fuego',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/36. Perdón Señora.mp3',
                title: 'Perdón Señora',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/37. Por Eso.mp3',
                title: 'Por Eso',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/38. Por Haberte Amado Tanto.mp3',
                title: 'Por Haberte Amado Tanto',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/39. Primero Fui Yo.mp3',
                title: 'Primero Fui Yo',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/40. Puerto Rico.mp3',
                title: 'Puerto Rico',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/41. Que Se Mueran de Envidia.mp3',
                title: 'Que Se Mueran de Envidia',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/42. Quíen Es Tú Amigo.mp3',
                title: 'Quíen Es Tú Amigo',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/43. Quiero Hacerte El Amor.mp3',
                title: 'Quiero Hacerte El Amor',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/44. Quiero Llenarte.mp3',
                title: 'Quiero Llenarte',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/45. Quiero Verte.mp3',
                title: 'Quiero Verte',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/46. Si Esa Mujer Me Dice Que Sí.mp3',
                title: 'Si Esa Mujer Me Dice Que Sí',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/47. Si Te Entregas A Mi.mp3',
                title: 'Si Te Entregas A Mi',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/48. Solo Por Ti.mp3',
                title: 'Solo Por Ti',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/49. Tenerte.mp3',
                title: 'Tenerte',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/50. Tú Eres.mp3',
                title: 'Tú Eres',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/51. Tu Me Vuelves Loco.mp3',
                title: 'Tu Me Vuelves Loco',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },

            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/52. Voy Pa Encima.mp3',
                title: 'Voy Pa Encima',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },
            
            {
                src: 'audio/2. Salsa/8. Frankie Ruiz/53. Y No Puedo.mp3',
                title: 'Y No Puedo',
                artist: 'Frankie Ruiz',
                artwork: 'img/Caratulas/Salsa/Frankie Ruiz/Frankie.png'
            },
        ],

        'Raulin Rosendo': [ // RAULIN ROSENDO
            {
                src: 'audio/2. Salsa/Raulin Rosendo/1. A Gozar.mp3',
                title: 'A Gozar',
                artist: 'Raulin Rosendo',
                artwork: 'img/Caratulas/Aguardiente.png'
            },
        ],

        
    };

    // La playlist activa que está sonando en el reproductor
    let currentActivePlaylist = [];
    let currentPlaylistName = ''; // Para saber qué playlist está activa

    // --- Funciones del Reproductor (Adaptadas para usar currentActivePlaylist) ---

    function loadSong(songIndex) {
        if (songIndex >= 0 && songIndex < currentActivePlaylist.length) {
            currentSongIndex = songIndex;
            const song = currentActivePlaylist[currentSongIndex]; // Usa currentActivePlaylist
            audio.src = song.src;
            if (playerTitle) playerTitle.textContent = song.title;
            if (playerArtist) playerArtist.textContent = song.artist;
            if (playerArtwork) playerArtwork.src = song.artwork;

            updatePlaylistActiveState();

            // **AÑADIR ESTAS LÍNEAS:** Guardar el índice de la canción actual
            if (currentPlaylistName) { // Asegúrate de que currentPlaylistName esté definido
                localStorage.setItem(`lastPlayedTrackIndex_${currentPlaylistName}`, currentSongIndex);
            }

            if (isPlaying) {
                audio.play();
            } else {
                audio.load();
            }
        }
    }

    function playSong() {
        if (currentActivePlaylist.length === 0) { // Si no hay canciones cargadas, no reproducir
            console.warn("No hay canciones en la playlist activa para reproducir.");
            return;
        }
        isPlaying = true;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        audio.play();
        playPauseBtn.classList.add('active'); // <--- AÑADE ESTA LÍNEA AQUÍ
    }

    function pauseSong() {
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        audio.pause();
        playPauseBtn.classList.remove('active'); // <--- AÑADE ESTA LÍNEA AQUÍ
    }

    function togglePlayPause() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function nextSong() {
        if (currentActivePlaylist.length === 0) return; // No hacer nada si no hay canciones
        currentSongIndex = (currentSongIndex + 1) % currentActivePlaylist.length; // Usa currentActivePlaylist
        loadSong(currentSongIndex);
        playSong();
    }

    function prevSong() {
        if (currentActivePlaylist.length === 0) return; // No hacer nada si no hay canciones
        currentSongIndex = (currentSongIndex - 1 + currentActivePlaylist.length) % currentActivePlaylist.length; // Usa currentActivePlaylist
        loadSong(currentSongIndex);
        playSong();
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgressBar() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
        if (playerSeek) playerSeek.value = progressPercent;
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(currentTime);
        if (durationSpan && !isNaN(duration)) durationSpan.textContent = formatTime(duration);
    }

    function setProgressBar(e) {
        const target = e.target.closest('.progress-bar-container');
        if (!target) return;

        const width = target.offsetWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (!isNaN(duration)) {
            audio.currentTime = (clickX / width) * duration;
        }
    }

    function setVolume() {
        if (volumeSlider) {
            audio.volume = volumeSlider.value;
            if (muteBtn) {
                if (audio.volume === 0) {
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else if (audio.volume < 0.5) {
                    muteBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
                } else {
                    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            }
        }
    }

    function toggleMute() {
        if (audio.volume > 0) {
            volumeBeforeMute = audio.volume;
            audio.volume = 0;
            if (volumeSlider) volumeSlider.value = 0;
            if (muteBtn) muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            audio.volume = volumeBeforeMute;
            if (volumeSlider) volumeSlider.value = volumeBeforeMute;
            setVolume();
        }
    }

    // --- Manejo de la Lista de Reproducción (Visualización) - Adaptada ---
    function displayPlaylist() {
        if (!playlistContainer) return;

        playlistContainer.innerHTML = '';
        currentActivePlaylist.forEach((song, index) => { // Usa currentActivePlaylist
            const li = document.createElement('li');
            li.classList.add('playlist-item');
            if (index === currentSongIndex) {
                li.classList.add('active');
            }
            li.innerHTML = `
                <img src="${song.artwork}" alt="${song.title}">
                <div class="song-info">
                    <span class="playlist-title">${song.title}</span><br>
                    <span class="playlist-artist">${song.artist}</span>
                </div>
                <span class="playlist-duration"></span>`;
            li.addEventListener('click', () => {
                loadSong(index);
                playSong();
            });
            playlistContainer.appendChild(li);
        });
    }

    function updatePlaylistActiveState() {
        if (!playlistContainer) return;
        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // --- NUEVA FUNCIÓN: Cargar una playlist específica y actualizar el reproductor ---
    function loadAndDisplayPlaylist(playlistName) {
        if (allPlaylists[playlistName]) {
            currentActivePlaylist = allPlaylists[playlistName]; // Establece la playlist activa
            currentPlaylistName = playlistName; // Guarda el nombre de la playlist activa
            currentSongIndex = 0; // Reinicia el índice al cargar una nueva playlist

            displayPlaylist(); // Renderiza la nueva playlist en el contenedor
            loadSong(currentSongIndex); // Carga la primera canción de la nueva playlist
            
            // Habilita los controles si se cargó una playlist
            if (playPauseBtn) playPauseBtn.disabled = false;
            if (prevBtn) prevBtn.disabled = false;
            if (nextBtn) nextBtn.disabled = false;
            if (muteBtn) muteBtn.disabled = false;
            if (volumeSlider) volumeSlider.disabled = false;

        } else {
            console.error(`Playlist '${playlistName}' no encontrada.`);
            // Si la playlist no se encuentra, deshabilita controles y muestra un mensaje
            if (playerTitle) playerTitle.textContent = 'Playlist no encontrada';
            if (playerArtist) playerArtist.textContent = '';
            if (playerArtwork) playerArtwork.src = 'img/default_artwork.jpg';
            if (playPauseBtn) playPauseBtn.disabled = true;
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            if (muteBtn) muteBtn.disabled = true;
            if (volumeSlider) volumeSlider.disabled = true;
            if (playlistContainer) playlistContainer.innerHTML = '<li class="no-songs">No hay canciones en esta playlist.</li>';
        }
    }

    // --- Event Listeners del Reproductor ---

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
    if (prevBtn) prevBtn.addEventListener('click', prevSong);
    if (nextBtn) nextBtn.addEventListener('click', nextSong);

    audio.addEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('ended', nextSong);

    // Si nextSong() no existe o no se reproduce una nueva canción, asegúrate de quitar la clase active:
    if (playPauseBtn && !isPlaying) { // Si el reproductor no va a seguir sonando automáticamente
        playPauseBtn.classList.remove('active');
    }

    const progressBarContainer = document.querySelector('.progress-bar-container');
    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', setProgressBar);
    }
    if (playerSeek) {
        playerSeek.addEventListener('input', function() {
            const seekTime = (this.value / 100) * audio.duration;
            if (!isNaN(seekTime)) {
                audio.currentTime = seekTime;
            }
        });
    }

    if (volumeSlider) volumeSlider.addEventListener('input', setVolume);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    audio.addEventListener('loadedmetadata', () => {
        if (durationSpan) durationSpan.textContent = formatTime(audio.duration);
        const activePlaylistItem = playlistContainer ? playlistContainer.querySelector('.playlist-item.active .playlist-duration') : null;
        if (activePlaylistItem && !isNaN(audio.duration)) {
            activePlaylistItem.textContent = formatTime(audio.duration);
        }
    });

    // --- NUEVOS EVENT LISTENERS PARA LOS BOTONES DE CATEGORÍA DE PLAYLISTS ---
    const categoryButtons = document.querySelectorAll('.playlist-category .view-playlist-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryDiv = this.closest('.playlist-category');
            if (categoryDiv) {
                const playlistName = categoryDiv.dataset.playlistName;
                if (playlistName) {
                    loadAndDisplayPlaylist(playlistName);
                    // Opcional: desplazar la vista al reproductor una vez cargada la playlist
                    audioPlayerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                     // **AÑADIR ESTA LÍNEA:** Guardar la playlist seleccionada
                    localStorage.setItem('lastPlayedPlaylist', playlistName);
                    // También reinicia el índice de la canción guardada para esa playlist al cargarla nueva
                    localStorage.removeItem(`lastPlayedTrackIndex_${playlistName}`);
                }
            }
        });
    });

    // --- Manejar clics en los títulos de las canciones fuera del reproductor (en la sección de "Explora Mi Colección") ---
    // Este manejador ahora también debe considerar la playlist activa
    document.querySelectorAll('.playable-song').forEach(songTitleSpan => {
        songTitleSpan.addEventListener('click', function(event) {
            event.preventDefault();
            const parentElement = this.closest('[data-src]');
            if (parentElement) {
                const src = parentElement.dataset.src;
                const title = parentElement.dataset.title;
                const artist = parentElement.dataset.artist;
                const artwork = parentElement.dataset.artwork;

                // Encuentra la canción dentro de la playlist actualmente activa
                let songIndex = currentActivePlaylist.findIndex(s => s.src === src);

                if (songIndex === -1) {
                    // Si la canción no está en la playlist activa, la añadimos TEMPORALMENTE a la playlist activa
                    // Esto no modifica la definición original en allPlaylists
                    currentActivePlaylist.push({ src, title, artist, artwork });
                    songIndex = currentActivePlaylist.length - 1;
                    displayPlaylist(); // Vuelve a renderizar la lista para mostrar la canción añadida
                }
                
                loadSong(songIndex);
                playSong();
            }
        });
    });

    // --- Inicialización: Cargar la última playlist guardada o la por defecto ---
    const defaultPlaylistName = Object.keys(allPlaylists)[0]; // Obtén la primera playlist como fallback
    let playlistToLoad = defaultPlaylistName; // Por defecto, carga la primera playlist

    const lastSavedPlaylistName = localStorage.getItem('lastPlayedPlaylist'); // Intenta obtener la última playlist del localStorage

    if (lastSavedPlaylistName && allPlaylists[lastSavedPlaylistName]) {
        // Si hay una playlist guardada y existe en tu colección de playlists
        playlistToLoad = lastSavedPlaylistName;
    } else if (!defaultPlaylistName) {
        // Si no hay ninguna playlist definida en allPlaylists
        console.warn("No hay playlists definidas en allPlaylists. Por favor, define al menos una.");
        // Deshabilitar controles y mostrar mensaje de error si no hay playlists
        if (playerTitle) playerTitle.textContent = 'No hay playlists para cargar';
        if (playerArtist) playerArtist.textContent = '';
        if (playerArtwork) playerArtwork.src = 'img/default_artwork.jpg';
        if (playPauseBtn) playPauseBtn.disabled = true;
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (muteBtn) muteBtn.disabled = true;
        if (volumeSlider) volumeSlider.disabled = true;
        if (playlistContainer) playlistContainer.innerHTML = '<li class="no-songs">No hay playlists definidas.</li>';
        return; // Detiene la ejecución si no hay playlists
    }
    
    // Carga la playlist (ya sea la guardada o la por defecto)
    loadAndDisplayPlaylist(playlistToLoad);

    // Opcional: Cargar la última canción dentro de esa playlist
    const lastSavedSongIndex = localStorage.getItem(`lastPlayedTrackIndex_${playlistToLoad}`);
    if (lastSavedSongIndex !== null && !isNaN(lastSavedSongIndex)) {
        currentSongIndex = parseInt(lastSavedSongIndex);
        loadSong(currentSongIndex); // Carga la canción específica
        // NOTA: No uses playSong() aquí si no quieres que empiece a sonar automáticamente.
        // Si quieres que empiece a sonar si estaba sonando antes, necesitarías guardar
        // también el estado de `isPlaying`. Por ahora, solo carga la canción.
    } else {
        currentSongIndex = 0; // Si no hay índice guardado, o es inválido, empieza por la primera canción
        loadSong(currentSongIndex); // Carga la primera canción de la playlist
    }

    // Inicializar la paginación de categorías al cargar la página
    // Asegúrate de que esto se ejecute después de que categoryCards haya sido definido
    // Inicializar la paginación de categorías al cargar la página
totalPages = Math.ceil(categoryCards.length / itemsPerPage); // Calcula el total de páginas

let pageToLoad = 1; // Por defecto, la página 1
if (categoryCards.length > 0) { // Solo intenta cargar si hay categorías
    const lastSavedCategoryPage = localStorage.getItem('lastCategoryPage');
    if (lastSavedCategoryPage !== null) {
        const parsedPage = parseInt(lastSavedCategoryPage);
        // Asegúrate de que es un número y está dentro del rango de páginas válidas
        if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
            pageToLoad = parsedPage;
        }
    }
}
// Llama a displayCategoryPage con la página determinada (guardada o por defecto)
// Esto mostrará las tarjetas correctas y actualizará los controles de paginación.
displayCategoryPage(pageToLoad);

});