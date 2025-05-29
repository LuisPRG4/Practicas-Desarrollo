// db.js

const DB_NAME = 'gestionVentasDB';
const DB_VERSION = 1; // Incrementa esto si cambias la estructura de la base de datos
const PRODUCT_STORE = 'product';
const SALES_STORE = 'sales';
const INVENTORY_ADJUSTMENTS_STORE = 'inventory_adjustments';

let db; // Variable para almacenar la instancia de la base de datos

// Función para abrir la base de datos
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Crear almacenes de objetos si no existen
            if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
                // El almacén de productos solo tendrá un registro, por lo que no necesita un keyPath autoincremental
                db.createObjectStore(PRODUCT_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(SALES_STORE)) {
                // Las ventas tendrán un ID autoincremental
                const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id', autoIncrement: true });
                salesStore.createIndex('saleDate', 'saleDate', { unique: false }); // Para ordenar por fecha
            }
            if (!db.objectStoreNames.contains(INVENTORY_ADJUSTMENTS_STORE)) {
                // Los ajustes de inventario también tendrán un ID autoincremental
                const invAdjStore = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id', autoIncrement: true });
                invAdjStore.createIndex('adjustmentDate', 'adjustmentDate', { unique: false }); // Para ordenar por fecha
            }
            console.log('IndexedDB upgrade complete: Object stores created/updated.');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB opened successfully.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject(new Error('Error al abrir la base de datos IndexeDB.'));
        };
    });
}

// Inicializar la base de datos al cargar el script
openDatabase().catch(error => {
    console.error('Error al inicializar la base de datos:', error);
});


// --- Funciones de Interacción con la Base de Datos ---

/**
 * Realiza una transacción de lectura/escritura en la base de datos.
 * @param {string} storeName - El nombre del almacén de objetos.
 * @param {string} mode - 'readonly' o 'readwrite'.
 * @returns {IDBObjectStore} El almacén de objetos.
 */
function getObjectStore(storeName, mode) {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
}

/**
 * Guarda o actualiza un producto en la base de datos.
 * Asume que solo hay un "main_product" con id="main_product".
 * @param {Object} productData - Los datos del producto a guardar.
 */
async function saveProduct(productData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readwrite');
        const request = store.put({ ...productData, id: 'main_product' }); // Asegura que el ID sea siempre 'main_product'

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            console.error('Error al guardar producto:', event.target.errorCode);
            reject(new Error('Error al guardar el producto.'));
        };
    });
}

/**
 * Obtiene el producto principal de la base de datos.
 * @returns {Object|null} El objeto del producto o null si no existe.
 */
async function getProduct() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readonly');
        const request = store.get('main_product');

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error('Error al obtener producto:', event.target.errorCode);
            reject(new Error('Error al cargar el producto.'));
        };
    });
}

/**
 * Añade una nueva venta a la base de datos.
 * @param {Object} saleData - Los datos de la venta.
 */
async function addSale(saleData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(SALES_STORE, 'readwrite');
        // Asegúrate de que saleDate sea un objeto Date para IndexedDB
        const saleToAdd = { ...saleData, saleDate: saleData.saleDate || new Date() };
        const request = store.add(saleToAdd);

        request.onsuccess = (event) => {
            resolve({ ...saleToAdd, id: event.target.result }); // Devuelve el objeto completo con el ID generado
        };
        request.onerror = (event) => {
            console.error('Error al añadir venta:', event.target.errorCode);
            reject(new Error('Error al añadir la venta.'));
        };
    });
}

/**
 * Obtiene todas las ventas de la base de datos, ordenadas por fecha.
 * @returns {Array} Un array de objetos de venta.
 */
async function getAllSales() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(SALES_STORE, 'readonly');
        const request = store.getAll(); // O store.index('saleDate').openCursor('prev') para ordenar

        request.onsuccess = () => {
            // Ordenar por fecha de venta (más reciente primero)
            const sortedSales = request.result.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());
            resolve(sortedSales);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ventas:', event.target.errorCode);
            reject(new Error('Error al cargar las ventas.'));
        };
    });
}

/**
 * Añade un nuevo ajuste de inventario a la base de datos.
 * @param {Object} adjustmentData - Los datos del ajuste.
 */
async function addInventoryAdjustment(adjustmentData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(INVENTORY_ADJUSTMENTS_STORE, 'readwrite');
        // Asegúrate de que adjustmentDate sea un objeto Date para IndexedDB
        const adjToAdd = { ...adjustmentData, adjustmentDate: adjustmentData.adjustmentDate || new Date() };
        const request = store.add(adjToAdd);

        request.onsuccess = (event) => {
            resolve({ ...adjToAdd, id: event.target.result }); // Devuelve el objeto completo con el ID generado
        };
        request.onerror = (event) => {
            console.error('Error al añadir ajuste de inventario:', event.target.errorCode);
            reject(new Error('Error al añadir el ajuste de inventario.'));
        };
    });
}

/**
 * Obtiene todos los ajustes de inventario de la base de datos, ordenados por fecha.
 * @returns {Array} Un array de objetos de ajuste de inventario.
 */
async function getAllInventoryAdjustments() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(INVENTORY_ADJUSTMENTS_STORE, 'readonly');
        const request = store.getAll(); // O store.index('adjustmentDate').openCursor('prev')

        request.onsuccess = () => {
            // Ordenar por fecha de ajuste (más reciente primero)
            const sortedAdjustments = request.result.sort((a, b) => b.adjustmentDate.getTime() - a.adjustmentDate.getTime());
            resolve(sortedAdjustments);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ajustes de inventario:', event.target.errorCode);
            reject(new Error('Error al cargar los ajustes de inventario.'));
        };
    });
}

// Exportar las funciones para que puedan ser usadas por script.js
window.dbManager = {
    openDatabase,
    saveProduct,
    getProduct,
    addSale,
    getAllSales,
    addInventoryAdjustment,
    getAllInventoryAdjustments
};