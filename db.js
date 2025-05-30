// db.js

const DB_NAME = 'gestionVentasDB';
// ¡IMPORTANTE! Hemos incrementado la versión de la base de datos a 4.
// Esto es CRUCIAL para que el navegador detecte un cambio en el esquema
// y ejecute el evento 'onupgradeneeded', permitiendo añadir nuevos campos.
const DB_VERSION = 5; // <<--- ¡VERSIÓN FINAL Y CRÍTICA!
const PRODUCT_STORE = 'products';
const SALES_STORE = 'sales';
const INVENTORY_ADJUSTMENTS_STORE = 'inventory_adjustments';
const CLIENTS_STORE = 'clients'; // <<--- NUEVA CONSTANTE AÑADIDA

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
            } else if (event.oldVersion < DB_VERSION) { // Si actualizamos a la DB_VERSION actual
                 // Si ya existe, lo eliminamos y recreamos para asegurar la estructura
                 // (útil en desarrollo para cambios de esquema).
                if (db.objectStoreNames.contains(PRODUCT_STORE)) {
                    db.deleteObjectStore(PRODUCT_STORE);
                }
                db.createObjectStore(PRODUCT_STORE, { keyPath: 'id', autoIncrement: true });
                console.log(`Object store '${PRODUCT_STORE}' recreated for upgrade.`);
            }

            // Manejo del almacén de ventas
            if (!db.objectStoreNames.contains(SALES_STORE)) {
                const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id', autoIncrement: true });
                salesStore.createIndex('saleDate', 'saleDate', { unique: false });
                console.log(`Object store '${SALES_STORE}' created.`);
            } else if (event.oldVersion < DB_VERSION) {
                if (db.objectStoreNames.contains(SALES_STORE)) {
                    db.deleteObjectStore(SALES_STORE);
                }
                const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id', autoIncrement: true });
                salesStore.createIndex('saleDate', 'saleDate', { unique: false });
                console.log(`Object store '${SALES_STORE}' recreated for upgrade.`);
            }

            // Manejo del almacén de ajustes de inventario
            if (!db.objectStoreNames.contains(INVENTORY_ADJUSTMENTS_STORE)) {
                const invAdjStore = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id', autoIncrement: true });
                invAdjStore.createIndex('adjustmentDate', 'adjustmentDate', { unique: false });
                console.log(`Object store '${INVENTORY_ADJUSTMENTS_STORE}' created.`);
            } else if (event.oldVersion < DB_VERSION) {
                if (db.objectStoreNames.contains(INVENTORY_ADJUSTMENTS_STORE)) {
                    db.deleteObjectStore(INVENTORY_ADJUSTMENTS_STORE);
                }
                const invAdjStore = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id', autoIncrement: true });
                invAdjStore.createIndex('adjustmentDate', 'adjustmentDate', { unique: false });
                console.log(`Object store '${INVENTORY_ADJUSTMENTS_STORE}' recreated for upgrade.`);
            }

            // AÑADIDO: Manejo del almacén de clientes
            if (!db.objectStoreNames.contains(CLIENTS_STORE)) {
                db.createObjectStore(CLIENTS_STORE, { keyPath: 'id', autoIncrement: true });
                console.log(`Object store '${CLIENTS_STORE}' created.`);
            } else if (event.oldVersion < DB_VERSION) { // Si actualizamos a la DB_VERSION actual
                // Si el almacén ya existe y estamos actualizando a la versión 4,
                // lo eliminamos y lo recreamos para asegurar la estructura.
                if (db.objectStoreNames.contains(CLIENTS_STORE)) {
                    db.deleteObjectStore(CLIENTS_STORE);
                }
                db.createObjectStore(CLIENTS_STORE, { keyPath: 'id', autoIncrement: true });
                console.log(`Object store '${CLIENTS_STORE}' recreated for upgrade.`);
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
    console.error('Error al inicializar la base de datos (fuera de window.dbManager):', error);
});


// --- Funciones de Interacción con la Base de Datos (CRUD) ---

/**
 * Realiza una transacción de lectura/escritura en la base de datos y devuelve el almacén de objetos.
 * @param {string} storeName - El nombre del almacén de objetos (ej. 'products', 'sales').
 * @param {IDBTransactionMode} mode - El modo de la transacción ('readonly' o 'readwrite').
 * @returns {IDBObjectStore} El almacén de objetos para realizar operaciones.
 */
function getObjectStore(storeName, mode) {
    if (!db) {
        console.error("Database not initialized. Call openDatabase() first.");
        throw new Error("Database not initialized.");
    }
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
}

// Métodos para Productos
async function addProduct(productData) {
    const dbInstance = await openDatabase(); // Asegura que la DB esté abierta y 'db' esté asignada
    const store = dbInstance.transaction(PRODUCT_STORE, 'readwrite').objectStore(PRODUCT_STORE);
    return new Promise((resolve, reject) => {
        const request = store.add(productData);
        request.onsuccess = (event) => {
            console.log('Producto añadido con ID:', event.target.result);
            resolve({ ...productData, id: event.target.result });
        };
        request.onerror = (event) => {
            console.error('Error al añadir producto:', event.target.error);
            reject(new Error('Error al añadir el producto.'));
        };
    });
}

async function updateProduct(productData) {
    const dbInstance = await openDatabase();
    if (!productData.id) {
        throw new Error('Para actualizar un producto, se requiere un ID.');
    }
    const store = dbInstance.transaction(PRODUCT_STORE, 'readwrite').objectStore(PRODUCT_STORE);
    return new Promise((resolve, reject) => {
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

async function getProductById(id) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(PRODUCT_STORE, 'readonly').objectStore(PRODUCT_STORE);
    return new Promise((resolve, reject) => {
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

async function getAllProducts() {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(PRODUCT_STORE, 'readonly').objectStore(PRODUCT_STORE);
    return new Promise((resolve, reject) => {
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

async function deleteProduct(id) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(PRODUCT_STORE, 'readwrite').objectStore(PRODUCT_STORE);
    return new Promise((resolve, reject) => {
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

// Métodos para Ventas
async function addSale(saleData) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(SALES_STORE, 'readwrite').objectStore(SALES_STORE);
    return new Promise((resolve, reject) => {
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

async function getAllSales() {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(SALES_STORE, 'readonly').objectStore(SALES_STORE);
    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            const sortedSales = request.result.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
            resolve(sortedSales);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ventas:', event.target.error);
            reject(new Error('Error al cargar las ventas.'));
        };
    });
}

// Métodos para Ajustes de Inventario
async function addInventoryAdjustment(adjustmentData) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(INVENTORY_ADJUSTMENTS_STORE, 'readwrite').objectStore(INVENTORY_ADJUSTMENTS_STORE);
    return new Promise((resolve, reject) => {
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

async function getAllInventoryAdjustments() {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(INVENTORY_ADJUSTMENTS_STORE, 'readonly').objectStore(INVENTORY_ADJUSTMENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            const sortedAdjustments = request.result.sort((a, b) => new Date(b.adjustmentDate).getTime() - new Date(a.adjustmentDate).getTime());
            resolve(sortedAdjustments);
        };
        request.onerror = (event) => {
            console.error('Error al obtener ajustes de inventario:', event.target.error);
            reject(new Error('Error al cargar los ajustes de inventario.'));
        };
    });
}

// AÑADIDO: Métodos para Clientes
async function addClient(client) {
    const dbInstance = await openDatabase(); // Asegura que la DB esté abierta y 'db' esté asignada
    const store = dbInstance.transaction(CLIENTS_STORE, 'readwrite').objectStore(CLIENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.add(client);
        request.onsuccess = () => resolve({ ...client, id: request.result });
        request.onerror = () => reject(request.error);
    });
}

async function getAllClients() {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(CLIENTS_STORE, 'readonly').objectStore(CLIENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getClientById(id) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(CLIENTS_STORE, 'readonly').objectStore(CLIENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateClient(client) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(CLIENTS_STORE, 'readwrite').objectStore(CLIENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.put(client);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteClient(id) {
    const dbInstance = await openDatabase();
    const store = dbInstance.transaction(CLIENTS_STORE, 'readwrite').objectStore(CLIENTS_STORE);
    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Exportar las funciones para que puedan ser usadas por script.js y clients.js
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
    deleteProduct,
    // AÑADE ESTAS LÍNEAS:
    addClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
};