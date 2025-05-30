// clients.js

// --- 1. Referencias a los elementos del DOM de la sección de Clientes ---
const clientForm = document.getElementById('client-form');
const clientNameInput = document.getElementById('client-name-input');
const clientPhoneInput = document.getElementById('client-phone-input');
const clientEmailInput = document.getElementById('client-email-input');
const clientsListTbody = document.getElementById('clients-list-tbody');

// Elementos para la edición
const editClientSection = document.getElementById('edit-client-section');
const editClientForm = document.getElementById('edit-client-form');
const editClientIdInput = document.getElementById('edit-client-id');
const editClientNameInput = document.getElementById('edit-client-name');
const editClientPhoneInput = document.getElementById('edit-client-phone');
const editClientEmailInput = document.getElementById('edit-client-email');
const cancelEditClientBtn = document.getElementById('cancel-edit-client-btn');


// --- 2. Función para añadir un nuevo cliente ---
async function handleAddClient(event) {
    event.preventDefault(); // Evitar que el formulario recargue la página

    const name = clientNameInput.value.trim();
    const phone = clientPhoneInput.value.trim();
    const email = clientEmailInput.value.trim();

    if (!name) {
        alert('El nombre del cliente es obligatorio.');
        return;
    }

    try {
        const newClient = { name, phone, email };
        await window.dbManager.addClient(newClient);
        alert('Cliente añadido con éxito.');
        clientForm.reset(); // Limpiar el formulario
        await loadClientsList(); // Recargar la lista de clientes
    } catch (error) {
        console.error('Error al añadir cliente:', error);
        alert('Hubo un error al añadir el cliente.');
    }
}

// --- 3. Función para cargar y mostrar la lista de clientes ---
async function loadClientsList() {
    try {
        const clients = await window.dbManager.getAllClients();
        clientsListTbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevos datos

        if (clients.length === 0) {
            clientsListTbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-400">No hay clientes registrados.</td></tr>';
            return;
        }

        clients.forEach(client => {
            const row = clientsListTbody.insertRow();
            row.className = 'hover:bg-gray-600 transition-colors duration-200';
            row.innerHTML = `
                <td class="py-2 px-4 border-b border-gray-600">${client.id}</td>
                <td class="py-2 px-4 border-b border-gray-600">${client.name}</td>
                <td class="py-2 px-4 border-b border-gray-600">${client.phone || '-'}</td>
                <td class="py-2 px-4 border-b border-gray-600">${client.email || '-'}</td>
                <td class="py-2 px-4 border-b border-gray-600 text-center">
                    <button class="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm mr-2 client-edit-btn" data-id="${client.id}">Editar</button>
                    <button class="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm client-delete-btn" data-id="${client.id}">Eliminar</button>
                </td>
            `;
        });
        addClientActionsListeners(); // Añadir listeners después de renderizar
    } catch (error) {
        console.error('Error al cargar la lista de clientes:', error);
        clientsListTbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-400">Error al cargar clientes.</td></tr>';
    }
}

// --- 4. Funciones para editar y eliminar clientes (Event Delegation) ---
function addClientActionsListeners() {
    clientsListTbody.querySelectorAll('.client-edit-btn').forEach(button => {
        button.onclick = (event) => editClient(parseInt(event.target.dataset.id));
    });
    clientsListTbody.querySelectorAll('.client-delete-btn').forEach(button => {
        button.onclick = (event) => deleteClientById(parseInt(event.target.dataset.id));
    });
}

async function editClient(clientId) {
    try {
        const clientToEdit = await window.dbManager.getClientById(clientId);
        if (clientToEdit) {
            // Ocultar el formulario de añadir y mostrar el de edición
            clientForm.closest('div').classList.add('hidden');
            editClientSection.classList.remove('hidden');

            // Rellenar el formulario de edición
            editClientIdInput.value = clientToEdit.id;
            editClientNameInput.value = clientToEdit.name;
            editClientPhoneInput.value = clientToEdit.phone;
            editClientEmailInput.value = clientToEdit.email;
        } else {
            alert('Cliente no encontrado.');
        }
    } catch (error) {
        console.error('Error al cargar cliente para edición:', error);
        alert('Error al cargar datos del cliente para editar.');
    }
}

async function handleUpdateClient(event) {
    event.preventDefault();

    const id = parseInt(editClientIdInput.value);
    const name = editClientNameInput.value.trim();
    const phone = editClientPhoneInput.value.trim();
    const email = editClientEmailInput.value.trim();

    if (!name) {
        alert('El nombre del cliente es obligatorio.');
        return;
    }

    try {
        const updatedClient = { id, name, phone, email };
        await window.dbManager.updateClient(updatedClient);
        alert('Cliente actualizado con éxito.');
        cancelEditClient(); // Ocultar formulario de edición y mostrar el de añadir
        await loadClientsList(); // Recargar la lista
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        alert('Hubo un error al actualizar el cliente.');
    }
}

function cancelEditClient() {
    editClientForm.reset();
    editClientSection.classList.add('hidden');
    clientForm.closest('div').classList.remove('hidden'); // Vuelve a mostrar el div del formulario de añadir
}

async function deleteClientById(clientId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        return;
    }
    try {
        await window.dbManager.deleteClient(clientId);
        alert('Cliente eliminado con éxito.');
        await loadClientsList(); // Recargar la lista después de la eliminación
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Hubo un error al eliminar el cliente.');
    }
}


// --- 5. Asignar Event Listeners (cuando el DOM de esta sección esté disponible) ---
// Esto se ejecutará cuando clients.js sea cargado por el navegador
document.addEventListener('DOMContentLoaded', () => {
    // Listener para el formulario de añadir cliente
    if (clientForm) {
        clientForm.addEventListener('submit', handleAddClient);
    }

    // Listener para el formulario de edición de cliente
    if (editClientForm) {
        editClientForm.addEventListener('submit', handleUpdateClient);
    }
    if (cancelEditClientBtn) {
        cancelEditClientBtn.addEventListener('click', cancelEditClient);
    }

    // NO necesitamos llamar a loadClientsList aquí, ya que será llamada
    // por script.js cuando la pestaña de clientes se haga visible.
});


// --- 6. Exportar funciones que script.js necesitará llamar ---
// Hacemos que estas funciones sean globales para que script.js pueda invocarlas
window.clientsManager = {
    loadClientsList,
};