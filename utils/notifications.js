/**
 * Muestra una notificación "toast" en la esquina inferior derecha.
 * @param {string} message - El mensaje a mostrar en la notificación.
 * @param {'success'|'error'|'info'} type - El tipo de notificación (determina el color).
 * @param {number} duration - Duración en milisegundos antes de que la notificación desaparezca.
 */
window.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-notifications-container');
    if (!container) {
        console.error('Contenedor de notificaciones toast no encontrado. Asegúrate de tener un div con id="toast-notifications-container" en tu HTML.');
        alert(message); // Fallback al alert si no se encuentra el contenedor
        return;
    }

    const notification = document.createElement('div');
    notification.classList.add('toast-notification', type); // Añade clases base y de tipo

    // Iconos básicos (puedes personalizarlos con FontAwesome o SVG si quieres)
    let icon = '';
    if (type === 'success') {
        icon = '✅'; // O un ícono de FontAwesome: <i class="fas fa-check-circle"></i>
    } else if (type === 'error') {
        icon = '❌'; // O un ícono de FontAwesome: <i class="fas fa-times-circle"></i>
    } else if (type === 'info') {
        icon = 'ℹ️'; // O un ícono de FontAwesome: <i class="fas fa-info-circle"></i>
    }

    notification.innerHTML = `
        ${icon ? `<span class="text-xl mr-2">${icon}</span>` : ''}
        <span>${message}</span>
    `;

    container.appendChild(notification);

    // Forzar reflow para que la animación CSS se active
    void notification.offsetWidth;

    // Mostrar la notificación con la animación
    notification.classList.add('show');

    // Ocultar y eliminar la notificación después de la duración
    setTimeout(() => {
        notification.classList.remove('show');
        // Esperar a que termine la transición de salida antes de eliminar del DOM
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, duration);

    // Opcional: Cerrar la notificación al hacer clic en ella
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    });
};