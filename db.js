// db.js

const DB_NAME = 'gestionVentasDB';
// ¡IMPORTANTE! Incrementamos la versión de la base de datos a 3.
// Esto es CRUCIAL para que el navegador detecte un cambio en el esquema
// y ejecute el evento 'onupgradeneeded', permitiendo añadir nuevos campos.
const DB_VERSION = 3;
const PRODUCT_STORE = 'products';
const SALES_STORE = 'sales';
const INVENTORY_ADJUSTMENTS_STORE = 'inventory_adjustments';

let db; // Variable para almacenar la instancia de la base de datos

/**
 * Función para abrir la base de datos IndexedDB.
 * Maneja la creación y actualización de los almacenes de objetos (tablas).
 * @returns {Promise<IDBDatabase>} Una promesa que se resuelve con la instancia de la base de datos.
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Este evento se dispara si la versión de la base de datos en el navegador
        // es menor que la DB_VERSION especificada. Aquí es donde manejamos
        // la creación y actualización de los almacenes.
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log(`IndexedDB upgrade needed from version ${event.oldVersion} to ${event.newVersion}.`);

            // Manejo del almacén de productos
            if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
                db.createObjectStore(PRODUCT_STORE, { keyPath: 'id', autoIncrement: true });
                console.log(`Object store '${PRODUCT_STORE}' created.`);
            } else if (event.oldVersion < 3) { // Si actualizamos de una versión anterior a la 3
                // Para simplificar la migración en desarrollo, si el almacén ya existe,
                // lo eliminamos y lo recreamos. En un entorno de producción,
                // se necesitaría una lógica de migración más compleja para preservar datos.
                db.deleteObjectStore(PRODUCT_STORE);
                db.createObjectStore(PRODUCT_STORE, { keyPath: 'id', autoIncrement: true });
                console.log(`Object store '${PRODUCT_STORE}' recreated for upgrade.`);
            }

            // Manejo del almacén de ventas
            if (!db.objectStoreNames.contains(SALES_STORE)) {
                // Creamos el almacén de ventas con autoIncrement y un índice para la fecha de venta.
                // Los nuevos campos (paymentType, amountPaid, balanceDue) se añadirán
                // directamente a los objetos de venta cuando se guarden, ya que IndexedDB
                // no requiere un esquema estricto para los objetos.
                const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id', autoIncrement: true });
                salesStore.createIndex('saleDate', 'saleDate', { unique: false });
                console.log(`Object store '${SALES_STORE}' created.`);
            } else if (event.oldVersion < 3) { // Si actualizamos de una versión anterior a la 3
                // Similar al almacén de productos, eliminamos y recreamos el almacén de ventas.
                // Esto es necesario para asegurar que cualquier dato antiguo se adapte
                // a la nueva estructura esperada por el script (aunque los datos antiguos
                // no tendrán los nuevos campos a menos que se migren explícitamente).
                db.deleteObjectStore(SALES_STORE);
                const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id', autoIncrement: true });
                salesStore.createIndex('saleDate', 'saleDate', { unique: false });
                console.log(`Object store '${SALES_STORE}' recreated for upgrade.`);
            }

            // Manejo del almacén de ajustes de inventario
            if (!db.objectStoreNames.contains(INVENTORY_ADJUSTMENTS_STORE)) {
                const invAdjStore = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id', autoIncrement: true });
                invAdjStore.createIndex('adjustmentDate', 'adjustmentDate', { unique: false });
                console.log(`Object store '${INVENTORY_ADJUSTMENTS_STORE}' created.`);
            } else if (event.oldVersion < 3) {
                 // Si actualizamos de una versión anterior a la 3, recreamos también este almacén
                db.deleteObjectStore(INVENTORY_ADJUSTMENTS_STORE);
                const invAdjStore = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id', autoIncrement: true });
                invAdjStore.createIndex('adjustmentDate', 'adjustmentDate', { unique: false });
                console.log(`Object store '${INVENTORY_ADJUSTMENTS_STORE}' recreated for upgrade.`);
            }
            console.log('IndexedDB upgrade complete: Object stores created/updated.');
        };

        // Evento de éxito al abrir la base de datos
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB opened successfully.');
            resolve(db);
        };

        // Evento de error al abrir la base de datos
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject(new Error('Error al abrir la base de datos IndexedDB.'));
        };
    });
}

// Inicializar la base de datos al cargar el script
// Se usa .catch para manejar cualquier error durante la apertura inicial.
openDatabase().catch(error => {
    console.error('Error al inicializar la base de datos:', error);
});


// --- Funciones de Interacción con la Base de Datos (CRUD) ---

/**
 * Realiza una transacción de lectura/escritura en la base de datos y devuelve el almacén de objetos.
 * @param {string} storeName - El nombre del almacén de objetos (ej. 'products', 'sales').
 * @param {IDBTransactionMode} mode - El modo de la transacción ('readonly' o 'readwrite').
 * @returns {IDBObjectStore} El almacén de objetos para realizar operaciones.
 */
function getObjectStore(storeName, mode) {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
}

/**
 * Añade un nuevo producto a la base de datos.
 * @param {Object} productData - Los datos del producto a guardar (name, description, price, stock).
 * @returns {Promise<Object>} El objeto del producto con su ID generado.
 */
async function addProduct(productData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readwrite');
        const request = store.add(productData);

        request.onsuccess = (event) => {
            console.log('Producto añadido con ID:', event.target.result);
            resolve({ ...productData, id: event.target.result });
        };
        request.onerror = (event) => {
            console.error('Error al añadir producto:', event.target.error); // Usar event.target.error para detalles
            reject(new Error('Error al añadir el producto.'));
        };
    });
}

/**
 * Actualiza un producto existente en la base de datos.
 * @param {Object} productData - Los datos del producto a actualizar (debe incluir el ID).
 * @returns {Promise<void>} Una promesa que se resuelve cuando el producto es actualizado.
 */
async function updateProduct(productData) {
    return new Promise((resolve, reject) => {
        if (!productData.id) {
            return reject(new Error('Para actualizar un producto, se requiere un ID.'));
        }
        const store = getObjectStore(PRODUCT_STORE, 'readwrite');
        const request = store.put(productData);

        request.onsuccess = () => {
            console.log('Producto actualizado:', productData.id);
            resolve();
        };
        request.onerror = (event) => {
            console.error('Error al actualizar producto:', event.target.error);
            reject(new Error('Error al actualizar el producto.'));
        };
    });
}

/**
 * Obtiene un producto por su ID.
 * @param {number} id - El ID del producto.
 * @returns {Promise<Object|null>} El objeto del producto o null si no existe.
 */
async function getProductById(id) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readonly');
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error('Error al obtener producto por ID:', event.target.error);
            reject(new Error('Error al cargar el producto.'));
        };
    });
}

/**
 * Obtiene todos los productos de la base de datos.
 * @returns {Promise<Array>} Un array de objetos de producto.
 */
async function getAllProducts() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
            console.log('Productos cargados:', request.result);
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error('Error al obtener todos los productos:', event.target.error);
            reject(new Error('Error al cargar todos los productos.'));
        };
    });
}

/**
 * Añade una nueva venta a la base de datos.
 * Incluye campos para el tipo de pago, monto pagado y saldo pendiente.
 * @param {Object} saleData - Los datos de la venta (productId, quantity, totalPrice, saleDate, paymentType, amountPaid, balanceDue).
 * @returns {Promise<Object>} El objeto de la venta con su ID generado.
 */
async function addSale(saleData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(SALES_STORE, 'readwrite');
        // Asegúrate de que saleDate sea un objeto Date para IndexedDB
        const saleToAdd = { ...saleData, saleDate: saleData.saleDate || new Date() };
        const request = store.add(saleToAdd);

        request.onsuccess = (event) => {
            resolve({ ...saleToAdd, id: event.target.result });
        };
        request.onerror = (event) => {
            console.error('Error al añadir venta:', event.target.error);
            reject(new Error('Error al añadir la venta.'));
        };
    });
}

/**
 * Obtiene todas las ventas de la base de datos, ordenadas por fecha.
 * @returns {Promise<Array>} Un array de objetos de venta.
 */
async function getAllSales() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(SALES_STORE, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
            // Ordenar por fecha de venta (más reciente primero)
            const sortedSales = request.result.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
            resolve(sortedSales);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ventas:', event.target.error);
            reject(new Error('Error al cargar las ventas.'));
        };
    });
}

/**
 * Añade un nuevo ajuste de inventario a la base de datos.
 * @param {Object} adjustmentData - Los datos del ajuste.
 * @returns {Promise<Object>} El objeto del ajuste con su ID generado.
 */
async function addInventoryAdjustment(adjustmentData) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(INVENTORY_ADJUSTMENTS_STORE, 'readwrite');
        // Asegúrate de que adjustmentDate sea un objeto Date para IndexedDB
        const adjToAdd = { ...adjustmentData, adjustmentDate: adjustmentData.adjustmentDate || new Date() };
        const request = store.add(adjToAdd);

        request.onsuccess = (event) => {
            resolve({ ...adjToAdd, id: event.target.result });
        };
        request.onerror = (event) => {
            console.error('Error al añadir ajuste de inventario:', event.target.error);
            reject(new Error('Error al añadir el ajuste de inventario.'));
        };
    });
}

/**
 * Obtiene todos los ajustes de inventario de la base de datos, ordenados por fecha.
 * @returns {Promise<Array>} Un array de objetos de ajuste de inventario.
 */
async function getAllInventoryAdjustments() {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(INVENTORY_ADJUSTMENTS_STORE, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
            // Ordenar por fecha de ajuste (más reciente primero)
            const sortedAdjustments = request.result.sort((a, b) => new Date(b.adjustmentDate).getTime() - new Date(a.adjustmentDate).getTime());
            resolve(sortedAdjustments);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ajustes de inventario:', event.target.error);
            reject(new Error('Error al cargar los ajustes de inventario.'));
        };
    });
}

/**
 * Elimina un producto de la base de datos por su ID.
 * @param {number} id - El ID del producto a eliminar.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el producto es eliminado.
 */
async function deleteProduct(id) {
    return new Promise((resolve, reject) => {
        const store = getObjectStore(PRODUCT_STORE, 'readwrite');
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log(`Producto con ID ${id} eliminado correctamente.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error(`Error al eliminar el producto con ID ${id}:`, event.target.error);
            reject(new Error('Error al eliminar el producto.'));
        };
    });
}

// Exportar las funciones para que puedan ser usadas por script.js
window.dbManager = {
    openDatabase,
    addProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    addSale,
    getAllSales,
    addInventoryAdjustment,
    getAllInventoryAdjustments,
    deleteProduct
};
