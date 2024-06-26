const productList = document.querySelector('.list');
const cartList = document.querySelector('.listCard');
const cartQuantity = document.querySelector('.quantity');
const cartTotal = document.querySelector('.total');
const customerTable = document.querySelector('.customer-table');
const customerSelect = document.getElementById('customer-select');
const orderTable = document.querySelector('.order-table');

let cart = [];
let customers = [];
let orders = [];
let products = [];
let orderId = 1;
let customerId = 1;
let productId = 1;

function generateId(prefix, id) {
    return `${prefix}${String(id).padStart(3, '0')}`;
}


function addNewProduct() {
    const productImage = document.getElementById('product-image').files[0];
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    const productQuantity = document.getElementById('product-quantity').value;

    if (productName && productPrice && productImage && productQuantity) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProduct = {
                id: generateId('I', productId++),
                name: productName,
                price: parseFloat(productPrice),
                quantity: parseInt(productQuantity),
                image: e.target.result
            };
            products.push(newProduct);
            displayProduct(newProduct);
            displayProductInTable(newProduct);
        };
        reader.readAsDataURL(productImage);
        clearProductFields();
    } else {
        alert('Please fill all fields');
    }
}


//Product table Display

// Function to display a product in the product table
function displayProductInTable(product) {
    const productTableRow = document.createElement('tr');
    productTableRow.setAttribute('id', product.id);
    productTableRow.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price.toFixed(2)}</td>
        <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;"></td>
        <td>${product.quantity}</td>
    `;
    
    productTableRow.addEventListener('click', () => selectProductForUpdate(product));
    document.querySelector('.product-table').appendChild(productTableRow);
}

function clearProductFields() {
    document.getElementById('product-image').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-quantity').value = '';
}

function displayProduct(product) {
    const productElement = document.createElement('div');
    productElement.classList.add('item');
    productElement.dataset.productId = product.id;
    productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="title">${product.name}</div>
        <div class="price">$${product.price.toFixed(2)}</div>
        <div class="quantity">Quantity: <span class="quantity-value">${product.quantity}</span></div>
        <button onclick="addToCart('${product.id}')">Add to Cart</button>
    `;
    productList.appendChild(productElement);
}

// Function to update the display of a product
function updateProductDisplay(productId, productName, productPrice, productQuantity) {
    const productElement = document.querySelector(`.item[data-product-id='${productId}']`);
    if (productElement) {
        productElement.querySelector('.title').innerText = productName;
        productElement.querySelector('.price').innerText = `$${productPrice.toFixed(2)}`;
        productElement.querySelector('.quantity-value').innerText = productQuantity;
    }

    const productTableRow = document.querySelector(`.product-table tr[id='${productId}']`);
    if (productTableRow) {
        productTableRow.cells[1].innerText = productName;
        productTableRow.cells[2].innerText = productPrice.toFixed(2);
        productTableRow.cells[4].innerText = productQuantity;
    }
}

// Function to add a product to the cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product && product.quantity > 0) {
        const cartProduct = cart.find(item => item.id === productId);
        if (cartProduct) {
            cartProduct.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        product.quantity--; 
        updateProductDisplay(product.id, product.name, product.price, product.quantity); 
        updateCart(); 
    } else {
        alert('Product is out of stock');
    }
}

// Function to update the cart display
function updateCart() {
    cartList.innerHTML = '';
    let total = 0;
    let totalQuantity = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>${item.name}</div>
            <div>$${item.price.toFixed(2)}</div>
            <div>
                <button onclick="changeQuantity('${item.id}', -1)">-</button>
                <span class="count">${item.quantity}</span>
                <button onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
        `;
        cartList.appendChild(itemElement);
        total += item.price * item.quantity;
        totalQuantity += item.quantity;
    });
    
    cartQuantity.innerText = totalQuantity;

    // Calculate subtotal and apply discount if applicable
    let discount = 0;
    let subtotal = total;
    if (totalQuantity > 2000) {
        discount = 0.2 * total; // 20% discount
        subtotal = total - discount;
    }

    // Display total in cart
    cartTotal.innerText = `$${subtotal.toFixed(2)}`;
}

function changeQuantity(productId, change) {
    const cartProduct = cart.find(item => item.id === productId);
    const originalProduct = products.find(p => p.id === productId);
    if (cartProduct && originalProduct) {
        if (change === 1 && originalProduct.quantity > 0) {
            cartProduct.quantity++;
            originalProduct.quantity--;
        } else if (change === -1 && cartProduct.quantity > 0) {
            cartProduct.quantity--;
            originalProduct.quantity++;
        }
        if (cartProduct.quantity === 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        updateProductDisplay(originalProduct.id, originalProduct.name, originalProduct.price, originalProduct.quantity);
        updateCart();
    }
}

function updateProduct() {
    const productId = document.getElementById('product-name').dataset.id;
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    const productQuantity = document.getElementById('product-quantity').value;
    const productImage = document.getElementById('product-image').files[0];

    if (productId && productName && productPrice && productQuantity) {
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            products[productIndex].name = productName;
            products[productIndex].price = parseFloat(productPrice);
            products[productIndex].quantity = parseInt(productQuantity);
            
            if (productImage) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    products[productIndex].image = e.target.result;
                    updateProductDisplay(productId, productName, parseFloat(productPrice), parseInt(productQuantity));
                    clearProductFields();
                    alert('Product updated successfully!');
                };
                reader.readAsDataURL(productImage);
            } else {
                updateProductDisplay(productId, productName, parseFloat(productPrice), parseInt(productQuantity));
                clearProductFields();
                alert('Product updated successfully!');
            }
        } else {
            alert('Product not found');
        }
    } else {
        alert('Please fill all fields');
    }
}

function deleteProduct() {
    const productId = document.getElementById('product-name').dataset.id;
    if (productId) {
        products = products.filter(item => item.id !== productId);
        displayProducts();
        alert('Product deleted successfully!');
        clearProductFields();
    } else {
        alert('Product ID not provided');
    }
}

function displayProducts() {
    productList.innerHTML = '';
    document.querySelector('.product-table').innerHTML = '';
    products.forEach(product => {
        displayProduct(product);
        displayProductInTable(product);
    });
}

function selectProductForUpdate(product) {
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-name').dataset.id = product.id;
    document.getElementById('product-image').value = '';
}

function clearCustomerFields() {
    document.getElementById
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('customer-salary').value = '';
    document.getElementById('customer-name').removeAttribute('data-id');
}

function clearOrderFields() {
    // Clear any fields if needed
}


//Customer Mange
function addCustomer() {
    const customerName = document.getElementById('customer-name').value;
    const customerAddress = document.getElementById('customer-address').value;
    const customerSalary = document.getElementById('customer-salary').value;

    if (customerName && customerAddress && customerSalary) {
        const newCustomer = {
            id: generateId('C', customerId++),
            name: customerName,
            address: customerAddress,
            salary: parseFloat(customerSalary)
        };
        customers.push(newCustomer);
        displayCustomer(newCustomer);
        clearCustomerFields();
        updateCustomerSelect();
    } else {
        alert('Please fill all fields');
    }
}

function displayCustomer(customer) {
    const customerElement = document.createElement('tr');
    customerElement.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.address}</td>
        <td>${customer.salary.toFixed(2)}</td>
    `;
    customerElement.addEventListener('click', () => selectCustomer(customer)); // Add click event listener
    customerTable.appendChild(customerElement);
}

function updateCustomerSelect() {
    customerSelect.innerHTML = '<option value="" disabled selected>Select Customer</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.innerText = customer.name;
        customerSelect.appendChild(option);
    });
}

function selectCustomer(customer) {
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-address').value = customer.address;
    document.getElementById('customer-salary').value = customer.salary;
    document.getElementById('customer-name').dataset.id = customer.id;
}

function updateCustomer() {
    const customerId = document.getElementById('customer-name').dataset.id;
    const customerName = document.getElementById('customer-name').value;
    const customerAddress = document.getElementById('customer-address').value;
    const customerSalary = document.getElementById('customer-salary').value;

    if (customerId && customerName && customerAddress && customerSalary) {
        const index = customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            customers[index].name = customerName;
            customers[index].address = customerAddress;
            customers[index].salary = parseFloat(customerSalary);

            customerTable.innerHTML = '';
            customers.forEach(displayCustomer);
            updateCustomerSelect();
            clearCustomerFields();
        } else {
            alert('Customer not found');
        }
    } else {
        alert('Please fill all fields');
    }
}

function deleteCustomer() {
    const customerId = document.getElementById('customer-name').dataset.id;
    if (customerId) {
        customers = customers.filter(c => c.id !== customerId);
        customerTable.innerHTML = '';
        customers.forEach(displayCustomer);
        clearCustomerFields();
        updateCustomerSelect();
    } else {
        alert('No customer selected');
    }
}

function placeOrder() {
    const selectedCustomerId = customerSelect.value;

    if (selectedCustomerId && cart.length > 0) {
        const customer = customers.find(c => c.id === selectedCustomerId);
        const date = new Date().toLocaleDateString();
        const currentOrderId = generateId('OR', orderId++);
        let total = 0;

        cart.forEach(item => {
            const orderQuantity = item.quantity;
            const orderTotalPrice = item.price * orderQuantity;
            let discountTotal = 0;

            // Check if total exceeds $2000 to apply discount
            if (orderTotalPrice > 2000) {
                const discount = 0.2 * orderTotalPrice; // 20% discount
                discountTotal = discount;
            }

            const order = {
                id: currentOrderId,
                date: date,
                customerId: customer.id,
                customerName: customer.name,
                customerAddress: customer.address,
                itemId: item.id,
                itemName: item.name,
                quantity: orderQuantity,
                totalPrice: orderTotalPrice,
                discountTotal: discountTotal
            };
            orders.push(order);
            total += orderTotalPrice;
            displayOrder(order);
        });

        // Calculate total discount for all orders combined
        const totalDiscount = orders.reduce((acc, order) => acc + order.discountTotal, 0);

        // Construct congratulatory message with order details
        const congratsMessage = `
            Congratulations! Your purchase qualifies for a 20% discount.<br><br>
            
            <strong>Total:</strong> $${total.toFixed(2)}<br>
            <strong>Total Discount:</strong> $${totalDiscount.toFixed(2)}<br>
            <strong>Discounted Total:</strong> $${(total - totalDiscount).toFixed(2)}
        `;

        // Display the modal with the congratulatory message
        const modal = document.getElementById('myModal');
        const messageElement = document.getElementById('congratsMessage');
        messageElement.innerHTML = congratsMessage;
        modal.style.display = 'block';

        // Close the modal when the close button is clicked
        const closeBtn = document.querySelector('.close');
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };

        // Clear cart after placing order
        cart = [];
        updateCart(); 
    } else {
        alert('No customer selected or cart is empty');
    }
}



function displayOrder(order) {
    const orderElement = document.createElement('tr');
    orderElement.innerHTML = `
        <td>${order.id}</td>
        <td>${order.date}</td>
        <td>${order.customerId}</td>
        <td>${order.customerName}</td>
        <td>${order.customerAddress}</td>
        <td>${order.itemId}</td>
        <td>${order.itemName}</td>
        <td>${order.quantity}</td>
        <td>$${order.totalPrice.toFixed(2)}</td>
        <td>$${order.discountTotal.toFixed(2)}</td> <!-- Display discount total -->
        <td>$${(order.totalPrice - order.discountTotal).toFixed(2)}</td> <!-- Display discounted total -->
    `;
    orderTable.appendChild(orderElement);
}


function toggleCart() {
    document.querySelector('.container').classList.toggle('active');
}


// Close the modal when clicking on the close button
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('congratsModal').style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('congratsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


// Initial functions to display existing data if any
displayProducts();
updateCustomerSelect();