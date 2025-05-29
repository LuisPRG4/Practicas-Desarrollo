// script.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener referencias a los elementos clave del DOM
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Dashboard Elements
    const currentStockDisplay = document.getElementById('current-stock');
    const totalUnitsSoldDisplay = document.getElementById('total-units-sold');
    const totalRevenueDisplay = document.getElementById('total-revenue');

    // Product Elements
    const productDisplay = document.getElementById('product-display');
    const productEditForm = document.getElementById('product-edit-form');
    const editProductButton = document.getElementById('edit-product-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const saveProductForm = document.getElementById('product-edit-form'); // El formulario para guardar cambios

    const productNameDisplay = document.getElementById('product-name-display');
    const productDescriptionDisplay = document.getElementById('product-description-display');
    const productPriceDisplay = document.getElementById('product-price-display');
    const productStockDisplay = document.getElementById('product-stock-display');

    const editProductNameInput = document.getElementById('edit-product-name');
    const editProductDescriptionInput = document.getElementById('edit-product-description');
    const editProductPriceInput = document.getElementById('edit-product-price');
    const editProductStockInput = document.getElementById('edit-product-stock');

    // Sales Elements
    const recordSaleForm = document.getElementById('record-sale-form');
    const saleQuantityInput = document.getElementById('sale-quantity');
    const customerNameInput = document.getElementById('customer-name');
    const salesHistoryTbody = document.getElementById('sales-history-tbody');

    // Inventory Elements
    const stockAdjustmentForm = document.getElementById('stock-adjustment-form');
    const adjustmentQuantityInput = document.getElementById('adjustment-quantity');
    const adjustmentReasonInput = document.getElementById('adjustment-reason');
    const addStockButton = document.getElementById('add-stock-button');
    const removeStockButton = document.getElementById('remove-stock-button');
    const inventoryHistoryTbody = document.getElementById('inventory-history-tbody');

    // Variable global para almacenar el producto actual en memoria
    let currentProduct = null;

    // --- 2. Funciones de Carga y Actualización de Datos ---

    /**
     * Carga el producto desde la base de datos y actualiza la UI.
     */
    async function loadProduct() {
        try {
            currentProduct = await window.dbManager.getProduct();
            if (currentProduct) {
                // Mostrar los datos del producto
                productNameDisplay.textContent = currentProduct.name || 'N/A';
                productDescriptionDisplay.textContent = currentProduct.description || 'N/A';
                productPriceDisplay.textContent = `$${(currentProduct.price || 0).toFixed(2)}`;
                productStockDisplay.textContent = currentProduct.stock !== undefined ? currentProduct.stock : 'N/A';

                // Llenar el formulario de edición con los datos actuales
                editProductNameInput.value = currentProduct.name || '';
                editProductDescriptionInput.value = currentProduct.description || '';
                editProductPriceInput.value = currentProduct.price || '';
                editProductStockInput.value = currentProduct.stock !== undefined ? currentProduct.stock : '';
            } else {
                // Si no hay producto, establecer valores predeterminados para que se pueda configurar
                productNameDisplay.textContent = 'No configurado';
                productDescriptionDisplay.textContent = 'No configurado';
                productPriceDisplay.textContent = '$0.00';
                productStockDisplay.textContent = '0';

                editProductNameInput.value = '';
                editProductDescriptionInput.value = '';
                editProductPriceInput.value = '0';
                editProductStockInput.value = '0';
                console.log("No product found in DB. Please configure it.");
            }
        } catch (error) {
            console.error('Error al cargar el producto:', error);
            alert('Error al cargar la información del producto. Consulta la consola.');
        }
    }

    /**
     * Carga las ventas desde la base de datos y actualiza la tabla.
     */
    async function loadSales() {
        try {
            const sales = await window.dbManager.getAllSales();
            salesHistoryTbody.innerHTML = ''; // Limpiar tabla

            if (sales.length === 0) {
                salesHistoryTbody.innerHTML = '<tr><td colspan="4" class="text-center text-slate-400">No hay ventas registradas.</td></tr>';
                return;
            }

            sales.forEach(sale => {
                const row = salesHistoryTbody.insertRow();
                const date = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate); // Asegura que sea un objeto Date
                row.innerHTML = `
                    <td>${date.toLocaleString('es-ES')}</td>
                    <td>${sale.quantity}</td>
                    <td>$${sale.totalPrice.toFixed(2)}</td>
                    <td>${sale.customerName || 'Anónimo'}</td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar las ventas:', error);
            alert('Error al cargar el historial de ventas. Consulta la consola.');
        }
    }

    /**
     * Carga los ajustes de inventario y actualiza la tabla.
     */
    async function loadInventoryAdjustments() {
        try {
            const adjustments = await window.dbManager.getAllInventoryAdjustments();
            inventoryHistoryTbody.innerHTML = ''; // Limpiar tabla

            if (adjustments.length === 0) {
                inventoryHistoryTbody.innerHTML = '<tr><td colspan="4" class="text-center text-slate-400">No hay ajustes de inventario registrados.</td></tr>';
                return;
            }

            adjustments.forEach(adj => {
                const row = inventoryHistoryTbody.insertRow();
                const date = adj.adjustmentDate instanceof Date ? adj.adjustmentDate : new Date(adj.adjustmentDate); // Asegura que sea un objeto Date
                const quantityClass = adj.quantityChange > 0 ? 'text-green-400' : 'text-red-400';
                const quantityText = adj.quantityChange > 0 ? `+${adj.quantityChange}` : adj.quantityChange;

                row.innerHTML = `
                    <td>${date.toLocaleString('es-ES')}</td>
                    <td>${adj.reason}</td>
                    <td class="${quantityClass} font-semibold">${quantityText}</td>
                    <td>${adj.newStockLevel}</td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar ajustes de inventario:', error);
            alert('Error al cargar el historial de ajustes de inventario. Consulta la consola.');
        }
    }

    /**
     * Actualiza las estadísticas del dashboard y los gráficos.
     */
    async function updateDashboard() {
        try {
            const product = await window.dbManager.getProduct();
            const sales = await window.dbManager.getAllSales();
            const inventoryAdjustments = await window.dbManager.getAllInventoryAdjustments();

            // Calcular stock actual (inicializar con el stock del producto si existe, o 0)
            let currentStock = product ? product.stock : 0;
            if (currentStock === undefined) currentStock = 0; // Asegurarse que sea un número

            // Calcular unidades vendidas y ingresos
            let totalUnitsSold = 0;
            let totalRevenue = 0;
            const dailySales = {}; // { 'YYYY-MM-DD': quantity }

            sales.forEach(sale => {
                totalUnitsSold += sale.quantity;
                totalRevenue += sale.totalPrice;

                // Para el gráfico de ventas por día
                const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
                const dateKey = saleDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                dailySales[dateKey] = (dailySales[dateKey] || 0) + sale.quantity;
            });

            // Convertir dailySales a un array para el gráfico
            const salesChartData = Object.keys(dailySales).map(date => ({
                date: new Date(date),
                quantity: dailySales[date]
            })).sort((a, b) => a.date.getTime() - b.date.getTime()); // Ordenar cronológicamente


            // Actualizar la UI del dashboard
            currentStockDisplay.textContent = currentStock;
            totalUnitsSoldDisplay.textContent = totalUnitsSold;
            totalRevenueDisplay.textContent = `$${totalRevenue.toFixed(2)}`;

            // Actualizar gráficos
            window.chartManager.drawSalesChart(salesChartData);
            window.chartManager.drawInventoryChart(currentStock, totalUnitsSold);

        } catch (error) {
            console.error('Error al actualizar el dashboard:', error);
            alert('Error al cargar los datos del dashboard. Consulta la consola.');
        }
    }


    // --- 3. Lógica de Pestañas (ya existente, pero ahora se integra con la carga de datos) ---

    function showTab(tabId) {
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        navButtons.forEach(button => {
            button.classList.remove('active');
        });

        const activeTabContent = document.getElementById(tabId);
        if (activeTabContent) {
            activeTabContent.classList.remove('hidden');
        }
        const activeNavButton = document.querySelector(`.nav-button[data-tab="${tabId}"]`);
        if (activeNavButton) {
            activeNavButton.classList.add('active');
        }

        // Cargar datos relevantes cada vez que se cambia de pestaña
        switch (tabId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'product':
                loadProduct();
                break;
            case 'sales':
                loadSales();
                break;
            case 'inventory':
                loadInventoryAdjustments();
                break;
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const tabToActivate = event.target.dataset.tab;
            showTab(tabToActivate);
        });
    });

    // --- 4. Manejo de Formularios y Eventos ---

    // PRODUCTO: Alternar entre vista de producto y formulario de edición
    editProductButton.addEventListener('click', () => {
        productDisplay.classList.add('hidden');
        productEditForm.classList.remove('hidden');
        // Asegurarse de que el input de stock no se pueda editar directamente
        editProductStockInput.readOnly = true;
        editProductStockInput.title = "El stock solo se ajusta en la sección de Inventario";
    });

    cancelEditButton.addEventListener('click', () => {
        productEditForm.classList.add('hidden');
        productDisplay.classList.remove('hidden');
        loadProduct(); // Recargar los datos del producto para mostrar los originales si no se guardaron
    });

    // PRODUCTO: Guardar cambios del producto
    saveProductForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar el envío por defecto del formulario

        const newName = editProductNameInput.value.trim();
        const newDescription = editProductDescriptionInput.value.trim();
        const newPrice = parseFloat(editProductPriceInput.value);
        // El stock no se edita aquí, se toma el actual
        const newStock = currentProduct ? currentProduct.stock : 0; // Se mantiene el stock actual

        if (!newName || isNaN(newPrice) || newPrice < 0) {
            alert('Por favor, ingresa un nombre y un precio válido para el producto.');
            return;
        }

        // Crear/actualizar el objeto producto
        const productToSave = {
            id: 'main_product', // ID fijo para el producto principal
            name: newName,
            description: newDescription,
            price: newPrice,
            stock: newStock // El stock se mantiene o se inicializa
        };

        try {
            await window.dbManager.saveProduct(productToSave);
            alert('Producto guardado exitosamente.');
            // Actualizar la interfaz y volver a la vista de display
            await loadProduct();
            productEditForm.classList.add('hidden');
            productDisplay.classList.remove('hidden');
            updateDashboard(); // Actualizar dashboard con posibles cambios de precio
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            alert('Error al guardar el producto. Consulta la consola.');
        }
    });

    // VENTAS: Registrar una nueva venta
    recordSaleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!currentProduct) {
            alert('Por favor, configure primero el producto en la pestaña "Producto".');
            return;
        }

        const quantity = parseInt(saleQuantityInput.value);
        const customerName = customerNameInput.value.trim();

        if (isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa una cantidad válida (mayor que 0).');
            return;
        }

        if (currentProduct.stock === undefined || currentProduct.stock < quantity) {
            alert(`No hay suficiente stock. Stock actual: ${currentProduct.stock !== undefined ? currentProduct.stock : 0}.`);
            return;
        }

        // Calcular precio total de la venta
        const totalPrice = quantity * currentProduct.price;

        // Crear objeto de venta
        const saleData = {
            quantity: quantity,
            totalPrice: totalPrice,
            customerName: customerName,
            saleDate: new Date()
        };

        // Actualizar stock del producto
        const newStock = currentProduct.stock - quantity;
        const productToUpdate = { ...currentProduct, stock: newStock };

        try {
            await window.dbManager.addSale(saleData); // Añadir la venta
            await window.dbManager.saveProduct(productToUpdate); // Actualizar el stock del producto

            alert('Venta registrada exitosamente y stock actualizado.');
            recordSaleForm.reset(); // Limpiar formulario
            await loadProduct(); // Actualizar display del producto
            await loadSales(); // Recargar historial de ventas
            updateDashboard(); // Actualizar dashboard
        } catch (error) {
            console.error('Error al registrar la venta:', error);
            alert('Error al registrar la venta. Consulta la consola.');
        }
    });


    // INVENTARIO: Añadir stock
    addStockButton.addEventListener('click', async () => {
        const quantity = parseInt(adjustmentQuantityInput.value);
        const reason = adjustmentReasonInput.value.trim();

        if (isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa una cantidad válida y mayor que 0 para el ajuste.');
            return;
        }
        if (!reason) {
            alert('Por favor, ingresa una razón para el ajuste de inventario.');
            return;
        }

        if (!currentProduct) {
            alert('Por favor, configure primero el producto en la pestaña "Producto" para ajustar el inventario.');
            return;
        }

        const oldStock = currentProduct.stock !== undefined ? currentProduct.stock : 0;
        const newStock = oldStock + quantity;

        // Crear objeto de ajuste de inventario
        const adjustmentData = {
            quantityChange: quantity,
            reason: reason,
            adjustmentDate: new Date(),
            oldStockLevel: oldStock,
            newStockLevel: newStock
        };

        // Actualizar stock del producto
        const productToUpdate = { ...currentProduct, stock: newStock };

        try {
            await window.dbManager.addInventoryAdjustment(adjustmentData); // Añadir ajuste
            await window.dbManager.saveProduct(productToUpdate); // Actualizar stock del producto

            alert('Stock añadido exitosamente.');
            stockAdjustmentForm.reset(); // Limpiar formulario
            await loadProduct(); // Actualizar display del producto
            await loadInventoryAdjustments(); // Recargar historial de ajustes
            updateDashboard(); // Actualizar dashboard
        } catch (error) {
            console.error('Error al añadir stock:', error);
            alert('Error al añadir stock. Consulta la consola.');
        }
    });

    // INVENTARIO: Quitar stock
    removeStockButton.addEventListener('click', async () => {
        const quantity = parseInt(adjustmentQuantityInput.value);
        const reason = adjustmentReasonInput.value.trim();

        if (isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa una cantidad válida y mayor que 0 para el ajuste.');
            return;
        }
        if (!reason) {
            alert('Por favor, ingresa una razón para el ajuste de inventario.');
            return;
        }

        if (!currentProduct) {
            alert('Por favor, configure primero el producto en la pestaña "Producto" para ajustar el inventario.');
            return;
        }

        const oldStock = currentProduct.stock !== undefined ? currentProduct.stock : 0;
        if (oldStock < quantity) {
            alert(`No puedes quitar más stock del que tienes. Stock actual: ${oldStock}.`);
            return;
        }

        const newStock = oldStock - quantity;

        // Crear objeto de ajuste de inventario
        const adjustmentData = {
            quantityChange: -quantity, // Cantidad negativa para indicar retiro
            reason: reason,
            adjustmentDate: new Date(),
            oldStockLevel: oldStock,
            newStockLevel: newStock
        };

        // Actualizar stock del producto
        const productToUpdate = { ...currentProduct, stock: newStock };

        try {
            await window.dbManager.addInventoryAdjustment(adjustmentData); // Añadir ajuste
            await window.dbManager.saveProduct(productToUpdate); // Actualizar stock del producto

            alert('Stock quitado exitosamente.');
            stockAdjustmentForm.reset(); // Limpiar formulario
            await loadProduct(); // Actualizar display del producto
            await loadInventoryAdjustments(); // Recargar historial de ajustes
            updateDashboard(); // Actualizar dashboard
        } catch (error) {
            console.error('Error al quitar stock:', error);
            alert('Error al quitar stock. Consulta la consola.');
        }
    });

    // --- 5. Inicialización al Cargar la Aplicación ---
    // Asegurarse de que la base de datos esté abierta antes de intentar cargar datos
    try {
        await window.dbManager.openDatabase(); // Aunque ya se llama en db.js, asegura que esté lista.
        // Cargar los datos iniciales y mostrar el dashboard
        showTab('dashboard');
        updateDashboard(); // Cargar datos del dashboard al inicio
        loadProduct(); // Cargar datos del producto al inicio (para la pestaña producto)
        loadSales(); // Cargar historial de ventas al inicio (para la pestaña ventas)
        loadInventoryAdjustments(); // Cargar historial de ajustes al inicio (para la pestaña inventario)
        console.log("Aplicación inicializada con éxito.");
    } catch (error) {
        console.error("Error al iniciar la aplicación:", error);
        alert("Error crítico al iniciar la aplicación. La base de datos no pudo abrirse.");
    }

});