// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. Obtener referencias a los elementos clave del DOM ---

    // Navegación y Pestañas
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Dashboard Elements
    const currentStockDisplay = document.getElementById('current-stock');
    const totalUnitsSoldDisplay = document.getElementById('total-units-sold');
    const totalRevenueDisplay = document.getElementById('total-revenue');
    const salesChartCanvas = document.getElementById('salesChart');
    const inventoryChartCanvas = document.getElementById('inventoryChart');
    let salesChartInstance; // Para almacenar la instancia del gráfico de ventas
    let inventoryChartInstance; // Para almacenar la instancia del gráfico de inventario

    // Product Section Elements
    const addProductForm = document.getElementById('product-form');
    const productsListTbody = document.getElementById('products-list-tbody');
    const editProductSection = document.getElementById('edit-product-section');
    const editProductForm = document.getElementById('edit-product-form');
    const editProductIdInput = document.getElementById('edit-product-id');
    const editProductNameInput = document.getElementById('edit-product-name');
    const editProductDescriptionInput = document.getElementById('edit-product-description');
    const editProductPriceInput = document.getElementById('edit-product-price');
    const cancelEditProductBtn = document.getElementById('cancel-edit-product-btn');

    // Sales Section Elements
    const recordSaleForm = document.getElementById('record-sale-form');
    const saleProductSelect = document.getElementById('sale-product-select');
    const saleQuantityInput = document.getElementById('sale-quantity-input');
    const saleDateInput = document.getElementById('sale-date-input');
    const salesHistoryTbody = document.getElementById('sales-history-tbody');
    // NUEVO: Referencias a los elementos para ventas a crédito
    const salePaymentTypeSelect = document.getElementById('sale-payment-type');
    const creditDetailsGroup = document.getElementById('credit-details-group');
    const saleAmountPaidInput = document.getElementById('sale-amount-paid');
    // const saleCustomerNameInput = document.getElementById('sale-customer-name'); // Si lo incluiste en index.html

    // Inventory Section Elements
    const stockAdjustmentForm = document.getElementById('stock-adjustment-form');
    const inventoryProductSelect = document.getElementById('inventory-product-select');
    const adjustmentTypeSelect = document.getElementById('adjustment-type');
    const adjustmentQuantityInput = document.getElementById('adjustment-quantity');
    const adjustmentReasonInput = document.getElementById('adjustment-reason');
    const inventoryHistoryTbody = document.getElementById('inventory-history-tbody');


    // --- 2. Funciones de UI y Lógica de Navegación ---

    // Función para mostrar la pestaña activa y ocultar las demás
    function showTab(tabId) {
        tabContents.forEach(tabContent => {
            tabContent.classList.add('hidden');
            tabContent.classList.remove('active'); // Remover clase 'active' también
        });
        document.getElementById(tabId).classList.remove('hidden');
        document.getElementById(tabId).classList.add('active'); // Añadir clase 'active'

        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.nav-button[data-tab="${tabId}"]`).classList.add('active');

        // Lógica específica para cada pestaña al mostrarla
        if (tabId === 'dashboard') {
            updateDashboard();
        } else if (tabId === 'product') {
            loadProductsList();
            editProductSection.classList.add('hidden'); // Asegurarse de que el formulario de edición esté oculto
        } else if (tabId === 'sales') {
            populateProductSelect(saleProductSelect);
            loadSales();
            // Asegurarse de que los campos de crédito estén ocultos al cargar la pestaña de ventas
            salePaymentTypeSelect.value = 'cash';
            creditDetailsGroup.classList.add('hidden');
            saleAmountPaidInput.required = false;
            saleAmountPaidInput.value = '';
            // if (saleCustomerNameInput) saleCustomerNameInput.required = false;
        } else if (tabId === 'inventory') {
            populateProductSelect(inventoryProductSelect);
            loadInventoryAdjustments();
        }
    }

    // Event Listeners para los botones de navegación
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            showTab(tab);
        });
    });

    // --- 3. Lógica para la Sección de Productos ---

    // Función para cargar y mostrar la lista de productos
    async function loadProductsList() {
        try {
            const products = await window.dbManager.getAllProducts();
            productsListTbody.innerHTML = ''; // Limpiar la tabla

            if (products.length === 0) {
                productsListTbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-4">No hay productos registrados.</td></tr>';
                return;
            }

            products.forEach(product => {
                const row = productsListTbody.insertRow();
                row.innerHTML = `
                    <td class="py-2 px-4 border-b border-gray-700">${product.name}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${product.description || ''}</td>
                    <td class="py-2 px-4 border-b border-gray-700">$${product.price.toFixed(2)}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${product.stock}</td>
                    <td class="py-2 px-4 border-b border-gray-700">
                        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm edit-product-btn" data-id="${product.id}">Editar</button>
                        <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm delete-product-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
            });

            // Añadir event listeners para botones de edición
            document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = parseInt(event.target.dataset.id);
                    loadProductForEdit(productId);
                });
            });

            // Añadir event listeners para botones de eliminación
            document.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const productId = parseInt(event.target.dataset.id);
                    // Reemplazar confirm() con un modal personalizado si es necesario
                    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
                        try {
                            await window.dbManager.deleteProduct(productId);
                            window.alert('Producto eliminado exitosamente.'); // Reemplazar alert()
                            loadProductsList(); // Recargar la lista
                            updateDashboard(); // Actualizar dashboard (stock total)
                        } catch (error) {
                            console.error('Error al eliminar producto:', error);
                            window.alert('Error al eliminar el producto.'); // Reemplazar alert()
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Error al cargar la lista de productos:', error);
            productsListTbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-400 py-4">Error al cargar productos.</td></tr>';
        }
    }

    // Función para cargar los datos de un producto en el formulario de edición
    async function loadProductForEdit(productId) {
        try {
            const product = await window.dbManager.getProductById(productId);
            if (product) {
                editProductIdInput.value = product.id;
                editProductNameInput.value = product.name;
                editProductDescriptionInput.value = product.description || '';
                editProductPriceInput.value = product.price;
                editProductSection.classList.remove('hidden'); // Mostrar el formulario de edición
                window.scrollTo({ top: editProductSection.offsetTop, behavior: 'smooth' }); // Desplazar a la vista
            } else {
                window.alert('Producto no encontrado.'); // Reemplazar alert()
            }
        } catch (error) {
            console.error('Error al cargar producto para edición:', error);
            window.alert('Error al cargar el producto para edición.'); // Reemplazar alert()
        }
    }

    // Event Listener para añadir un nuevo producto
    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = addProductForm.querySelector('#product-name-input').value;
        const description = addProductForm.querySelector('#product-description-input').value;
        const price = parseFloat(addProductForm.querySelector('#product-price-input').value);
        const initialStock = parseInt(addProductForm.querySelector('#product-initial-stock-input').value);

        if (isNaN(price) || price < 0) {
            window.alert('Por favor, introduce un precio válido.'); // Reemplazar alert()
            return;
        }
        if (isNaN(initialStock) || initialStock < 0) {
            window.alert('Por favor, introduce un stock inicial válido.'); // Reemplazar alert()
            return;
        }

        const newProduct = { name, description, price, stock: initialStock };

        try {
            await window.dbManager.addProduct(newProduct);
            window.alert('Producto añadido exitosamente.'); // Reemplazar alert()
            addProductForm.reset(); // Limpiar formulario
            loadProductsList(); // Recargar la lista de productos
            updateDashboard(); // Actualizar dashboard (stock total)
        } catch (error) {
            console.error('Error al añadir producto:', error);
            window.alert('Error al añadir el producto. Consulta la consola.'); // Reemplazar alert()
        }
    });

    // Event Listener para guardar los cambios del producto editado
    editProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = parseInt(editProductIdInput.value);
        const name = editProductNameInput.value;
        const description = editProductDescriptionInput.value;
        const price = parseFloat(editProductPriceInput.value);

        if (isNaN(price) || price < 0) {
            window.alert('Por favor, introduce un precio válido.'); // Reemplazar alert()
            return;
        }

        const updatedProduct = { id, name, description, price }; // El stock se maneja en Inventario

        try {
            await window.dbManager.updateProduct(updatedProduct);
            window.alert('Producto actualizado exitosamente.'); // Reemplazar alert()
            editProductSection.classList.add('hidden'); // Ocultar formulario de edición
            loadProductsList(); // Recargar la lista de productos
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            window.alert('Error al actualizar el producto. Consulta la consola.'); // Reemplazar alert()
        }
    });

    // Event Listener para cancelar la edición del producto
    cancelEditProductBtn.addEventListener('click', () => {
        editProductSection.classList.add('hidden'); // Ocultar el formulario
        editProductForm.reset(); // Limpiar el formulario
    });


    // --- 4. Lógica para la Sección de Ventas ---

    // Función para popular los selectores de productos (en Ventas e Inventario)
    async function populateProductSelect(selectElement) {
        try {
            const products = await window.dbManager.getAllProducts();
            selectElement.innerHTML = '<option value="">-- Seleccione un producto --</option>'; // Limpiar y añadir opción por defecto

            if (products.length === 0) {
                // Si no hay productos, mostrar mensaje y deshabilitar
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay productos disponibles';
                option.disabled = true;
                selectElement.appendChild(option);
                selectElement.disabled = true;
                return;
            } else {
                selectElement.disabled = false;
            }

            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} ($${product.price.toFixed(2)}) - Stock: ${product.stock}`;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error al popular el selector de productos:', error);
            selectElement.innerHTML = '<option value="">Error al cargar productos</option>';
            selectElement.disabled = true;
        }
    }

    // Función para cargar y mostrar el historial de ventas
    async function loadSales() {
        try {
            const sales = await window.dbManager.getAllSales();
            const products = await window.dbManager.getAllProducts(); // Necesario para obtener nombres de productos
            const productMap = new Map(products.map(p => [p.id, p])); // Mapa para búsqueda rápida

            salesHistoryTbody.innerHTML = ''; // Limpiar la tabla

            if (sales.length === 0) {
                // Colspan ajustado a 8 para las nuevas columnas de tipo de pago, pagado y saldo
                salesHistoryTbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-400 py-4">No hay ventas registradas.</td></tr>';
                return;
            }

            sales.forEach(sale => {
                const product = productMap.get(sale.productId);
                const productName = product ? product.name : 'Producto Desconocido';
                const productPrice = product ? product.price.toFixed(2) : 'N/A'; // Precio unitario de la venta
                const row = salesHistoryTbody.insertRow();
                const saleDate = new Date(sale.saleDate).toLocaleString();

                // Determinar el estado del crédito para mostrar en la tabla
                let creditStatusDisplay = '';
                if (sale.paymentType === 'credit') {
                    if (sale.balanceDue > 0) {
                        creditStatusDisplay = `<span class="text-red-400 font-semibold">$${sale.balanceDue.toFixed(2)} Pendiente</span>`;
                    } else {
                        creditStatusDisplay = `<span class="text-green-400 font-semibold">Pagado</span>`;
                    }
                } else {
                    creditStatusDisplay = 'N/A'; // No aplica para ventas al contado
                }

                row.innerHTML = `
                    <td class="py-2 px-4 border-b border-gray-700">${productName}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${sale.quantity}</td>
                    <td class="py-2 px-4 border-b border-gray-700">$${productPrice}</td>
                    <td class="py-2 px-4 border-b border-gray-700">$${sale.totalPrice.toFixed(2)}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${sale.paymentType === 'cash' ? 'Contado' : 'Crédito'}</td>
                    <td class="py-2 px-4 border-b border-gray-700">$${sale.amountPaid.toFixed(2)}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${creditStatusDisplay}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${saleDate}</td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            salesHistoryTbody.innerHTML = '<tr><td colspan="8" class="text-center text-red-400 py-4">Error al cargar ventas.</td></tr>';
        }
    }

    // NUEVO: Event Listener para el selector de tipo de pago
    salePaymentTypeSelect.addEventListener('change', () => {
        if (salePaymentTypeSelect.value === 'credit') {
            creditDetailsGroup.classList.remove('hidden');
            saleAmountPaidInput.required = true; // Hacer el campo requerido para crédito
            // if (saleCustomerNameInput) saleCustomerNameInput.required = true;
        } else {
            creditDetailsGroup.classList.add('hidden');
            saleAmountPaidInput.required = false;
            saleAmountPaidInput.value = ''; // Limpiar valor al cambiar a contado
            // if (saleCustomerNameInput) saleCustomerNameInput.required = false;
        }
    });

    // Event Listener para registrar una venta
    recordSaleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const productId = parseInt(saleProductSelect.value);
        const quantity = parseInt(saleQuantityInput.value);
        const saleDate = new Date(saleDateInput.value);
        const paymentType = salePaymentTypeSelect.value; // Obtener el tipo de pago
        let amountPaid = 0;
        let balanceDue = 0;
        // let customerName = ''; // Si lo incluiste

        if (isNaN(productId)) {
            window.alert('Por favor, selecciona un producto.'); // Reemplazar alert()
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            window.alert('Por favor, introduce una cantidad válida para la venta.'); // Reemplazar alert()
            return;
        }
        if (isNaN(saleDate.getTime())) {
            window.alert('Por favor, selecciona una fecha de venta válida.'); // Reemplazar alert()
            return;
        }

        try {
            const product = await window.dbManager.getProductById(productId);
            if (!product) {
                window.alert('Producto no encontrado.'); // Reemplazar alert()
                return;
            }

            if (product.stock < quantity) {
                window.alert(`No hay suficiente stock para ${product.name}. Stock actual: ${product.stock}`); // Reemplazar alert()
                return;
            }

            const totalPrice = quantity * product.price;

            // Lógica para ventas a crédito
            if (paymentType === 'credit') {
                amountPaid = parseFloat(saleAmountPaidInput.value);
                if (isNaN(amountPaid) || amountPaid < 0) {
                    window.alert('Por favor, introduce un monto pagado inicial válido.'); // Reemplazar alert()
                    return;
                }
                if (amountPaid > totalPrice) {
                    window.alert('El monto pagado inicial no puede ser mayor que el precio total.'); // Reemplazar alert()
                    return;
                }
                balanceDue = totalPrice - amountPaid;
                // customerName = saleCustomerNameInput.value; // Si lo incluiste
                // if (!customerName) { window.alert('Por favor, introduce el nombre del cliente para ventas a crédito.'); return; }
            } else { // paymentType === 'cash'
                amountPaid = totalPrice; // En ventas al contado, el monto pagado es el total
                balanceDue = 0;
            }

            const newStock = product.stock - quantity;

            // Actualizar stock del producto
            await window.dbManager.updateProduct({ ...product, stock: newStock });

            // Registrar venta
            const saleData = {
                productId: productId,
                quantity: quantity,
                totalPrice: totalPrice,
                saleDate: saleDate, // Usar la fecha del input
                paymentType: paymentType, // Añadir el tipo de pago
                amountPaid: amountPaid,   // Añadir el monto pagado
                balanceDue: balanceDue    // Añadir el saldo pendiente
                // customerName: customerName // Si lo incluiste
            };
            await window.dbManager.addSale(saleData);

            window.alert(`Venta de ${quantity} unidades de ${product.name} registrada por $${totalPrice.toFixed(2)} (${paymentType === 'credit' ? 'Crédito' : 'Contado'}).`); // Reemplazar alert()
            recordSaleForm.reset(); // Limpiar formulario
            saleDateInput.valueAsDate = new Date(); // Resetear a la fecha actual
            salePaymentTypeSelect.value = 'cash'; // Resetear el selector de tipo de pago a "Contado"
            creditDetailsGroup.classList.add('hidden'); // Ocultar los campos de crédito
            saleAmountPaidInput.required = false; // Quitar el atributo required
            saleAmountPaidInput.value = ''; // Limpiar el valor del monto pagado
            // if (saleCustomerNameInput) saleCustomerNameInput.required = false; // Quitar el atributo required

            populateProductSelect(saleProductSelect); // Recargar selector para mostrar stock actualizado
            loadSales(); // Recargar historial de ventas
            updateDashboard(); // Actualizar dashboard
        } catch (error) {
            console.error('Error al registrar venta:', error);
            window.alert('Error al registrar venta. Consulta la consola.'); // Reemplazar alert()
        }
    });

    // Establecer la fecha actual por defecto en el input de fecha de venta
    saleDateInput.valueAsDate = new Date();

    // --- 5. Lógica para la Sección de Inventario ---

    // Función para cargar y mostrar el historial de ajustes de inventario
    async function loadInventoryAdjustments() {
        try {
            const adjustments = await window.dbManager.getAllInventoryAdjustments();
            const products = await window.dbManager.getAllProducts(); // Necesario para obtener nombres de productos
            const productMap = new Map(products.map(p => [p.id, p])); // Mapa para búsqueda rápida

            inventoryHistoryTbody.innerHTML = ''; // Limpiar la tabla

            if (adjustments.length === 0) {
                inventoryHistoryTbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-4">No hay ajustes de inventario registrados.</td></tr>';
                return;
            }

            adjustments.forEach(adj => {
                const product = productMap.get(adj.productId);
                const productName = product ? product.name : 'Producto Desconocido';
                const row = inventoryHistoryTbody.insertRow();
                const adjustmentDate = new Date(adj.adjustmentDate).toLocaleString();
                const quantityChange = adj.type === 'add' ? `+${adj.quantity}` : `-${adj.quantity}`;

                row.innerHTML = `
                    <td class="py-2 px-4 border-b border-gray-700">${productName}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${adj.type === 'add' ? 'Entrada' : 'Salida'}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${quantityChange}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${adj.reason || ''}</td>
                    <td class="py-2 px-4 border-b border-gray-700">${adjustmentDate}</td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar ajustes de inventario:', error);
            inventoryHistoryTbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-400 py-4">Error al cargar ajustes.</td></tr>';
        }
    }

    // Event Listener para realizar un ajuste de stock
    stockAdjustmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const productId = parseInt(inventoryProductSelect.value);
        const adjustmentType = adjustmentTypeSelect.value;
        const quantity = parseInt(adjustmentQuantityInput.value);
        const reason = adjustmentReasonInput.value;

        if (isNaN(productId)) {
            window.alert('Por favor, selecciona un producto.'); // Reemplazar alert()
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            window.alert('Por favor, introduce una cantidad válida para el ajuste.'); // Reemplazar alert()
            return;
        }
        if (!reason) {
            window.alert('Por favor, introduce una razón para el ajuste.'); // Reemplazar alert()
            return;
        }

        try {
            const product = await window.dbManager.getProductById(productId);
            if (!product) {
                window.alert('Producto no encontrado.'); // Reemplazar alert()
                return;
            }

            let newStock = product.stock;
            if (adjustmentType === 'add') {
                newStock += quantity;
            } else { // 'remove'
                if (newStock < quantity) {
                    window.alert(`No se puede quitar ${quantity} unidades. Stock actual de ${product.name}: ${newStock}`); // Reemplazar alert()
                    return;
                }
                newStock -= quantity;
            }

            // Actualizar stock del producto
            await window.dbManager.updateProduct({ ...product, stock: newStock });

            // Registrar ajuste de inventario
            const adjustmentData = {
                productId: productId,
                type: adjustmentType,
                quantity: quantity,
                reason: reason,
                newStock: newStock, // Guardar el nuevo stock después del ajuste
                adjustmentDate: new Date()
            };
            await window.dbManager.addInventoryAdjustment(adjustmentData);

            window.alert(`Stock de ${product.name} ajustado exitosamente. Nuevo stock: ${newStock}.`); // Reemplazar alert()
            stockAdjustmentForm.reset(); // Limpiar formulario
            populateProductSelect(inventoryProductSelect); // Recargar selector para mostrar stock actualizado
            loadInventoryAdjustments(); // Recargar historial de ajustes
            updateDashboard(); // Actualizar dashboard
        } catch (error) {
            console.error('Error al ajustar stock:', error);
            window.alert('Error al ajustar stock. Consulta la consola.'); // Reemplazar alert()
        }
    });

    // --- 6. Lógica para el Dashboard y Gráficos ---

    // Función para actualizar los datos del dashboard
    async function updateDashboard() {
        try {
            const products = await window.dbManager.getAllProducts();
            const sales = await window.dbManager.getAllSales();
            // const adjustments = await window.dbManager.getAllInventoryAdjustments(); // Mantén esta línea si la usas

            // Calcular Stock Actual Total
            const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
            currentStockDisplay.textContent = totalStock;

            // Calcular Unidades Vendidas Totales e Ingresos Totales
            const totalUnitsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
            // totalRevenue ahora es el total de todas las ventas (contado + crédito total)
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
            totalUnitsSoldDisplay.textContent = totalUnitsSold;
            totalRevenueDisplay.textContent = `$${totalRevenue.toFixed(2)}`;

            // NUEVO: Calcular métricas específicas para ventas a crédito/contado
            let totalCashRevenue = 0; // Ingresos reales de ventas al contado
            let totalCreditSalesValue = 0; // El valor total de las ventas que fueron a crédito (no lo que se pagó)
            let totalBalanceDue = 0;     // El saldo pendiente a cobrar

            sales.forEach(sale => {
                if (sale.paymentType === 'cash') {
                    totalCashRevenue += sale.totalPrice;
                } else if (sale.paymentType === 'credit') {
                    totalCreditSalesValue += sale.totalPrice;
                    totalBalanceDue += sale.balanceDue;
                }
            });

            // Si quieres mostrar estas nuevas métricas en el dashboard,
            // debes añadir elementos HTML con los IDs correspondientes en index.html,
            // por ejemplo: <p>Ingresos Contado: <span id="total-cash-revenue"></span></p>
            // document.getElementById('total-cash-revenue').textContent = `$${totalCashRevenue.toFixed(2)}`;
            // document.getElementById('total-credit-sales-value').textContent = `$${totalCreditSalesValue.toFixed(2)}`;
            // document.getElementById('total-balance-due').textContent = `$${totalBalanceDue.toFixed(2)}`;


            // Actualizar gráficos
            updateSalesChart(sales);
            updateInventoryChart(products); // Gráfico de inventario por producto
        } catch (error) {
            console.error('Error al actualizar el dashboard:', error);
            currentStockDisplay.textContent = 'Error';
            totalUnitsSoldDisplay.textContent = 'Error';
            totalRevenueDisplay.textContent = 'Error';
            // Si agregaste nuevos displays, también maneja sus errores aquí
        }
    }

    // Función para actualizar el gráfico de ventas
    function updateSalesChart(sales) {
        // Agrupar ventas por día
        const salesByDate = {};
        sales.forEach(sale => {
            const date = new Date(sale.saleDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += sale.totalPrice; // Suma el total de la venta (contado o crédito)
        });

        const dates = Object.keys(salesByDate).sort((a, b) => {
            const [dayA, monthA] = a.split('/').map(Number);
            const [dayB, monthB] = b.split('/').map(Number);
            // Asume el año actual para la comparación de fechas
            const dateObjA = new Date(new Date().getFullYear(), monthA - 1, dayA);
            const dateObjB = new Date(new Date().getFullYear(), monthB - 1, dayB);
            return dateObjA - dateObjB;
        });
        const revenues = dates.map(date => salesByDate[date]);

        // Destruir instancia anterior si existe
        if (salesChartInstance) {
            salesChartInstance.destroy();
        }

        salesChartInstance = new Chart(salesChartCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Ingresos por Día',
                    data: revenues,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with alpha
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ingresos ($)',
                            color: '#e2e8f0' // text-gray-200
                        },
                        ticks: {
                            color: '#cbd5e0' // text-gray-300
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.3)' // gray-500 with alpha
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha',
                            color: '#e2e8f0' // text-gray-200
                        },
                        ticks: {
                            color: '#cbd5e0' // text-gray-300
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.3)' // gray-500 with alpha
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        labels: {
                            color: '#e2e8f0' // text-gray-200
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.raw.toFixed(2);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Función para actualizar el gráfico de estado del inventario (por producto)
    function updateInventoryChart(products) {
        const productNames = products.map(p => p.name);
        const productStocks = products.map(p => p.stock);
        const backgroundColors = products.map((_, i) => `hsl(${i * 60 % 360}, 70%, 50%)`); // Colores variados

        if (inventoryChartInstance) {
            inventoryChartInstance.destroy();
        }

        inventoryChartInstance = new Chart(inventoryChartCanvas, {
            type: 'bar', // Cambiado a barras para mejor visualización por producto
            data: {
                labels: productNames,
                datasets: [{
                    label: 'Stock Actual',
                    data: productStocks,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.2)', '1)')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad',
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#cbd5e0'
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.3)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Producto',
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#cbd5e0'
                        },
                        grid: {
                            color: 'rgba(107, 114, 128, 0.3)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false, // No se necesita leyenda para una sola serie de barras con colores directos
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }


    // --- 7. Inicialización al Cargar la Aplicación ---

    // Asegurarse de que la base de datos esté abierta antes de intentar cargar datos
    try {
        await window.dbManager.openDatabase(); // Esto asegura que la DB esté lista.
        console.log("Base de datos IndexedDB abierta y lista.");

        // Mostrar la pestaña inicial (Dashboard)
        showTab('dashboard');

        // Cargar datos iniciales en todas las secciones
        loadProductsList();
        populateProductSelect(saleProductSelect);
        populateProductSelect(inventoryProductSelect);
        loadSales();
        loadInventoryAdjustments();
        updateDashboard(); // Cargar datos del dashboard al inicio

        console.log("Aplicación inicializada con éxito.");
    } catch (error) {
        console.error("Error crítico al iniciar la aplicación:", error);
        window.alert("Error crítico al iniciar la aplicación. La base de datos no pudo abrirse. Consulta la consola para más detalles."); // Reemplazar alert()
    }

});
