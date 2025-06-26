    function initApp(){
        // Configuration
        const config = {
            jsonbin: {
                binId: "6856a91e8960c979a5ae6570",
                apiKey: "$2a$10$DY6Bo8O3ePuyfWxRh63SFenGPrD/TXQru7k.//.isDVbR6giTbPKG",
                productsKey: "products",
                passwordKey: "adminPassword"
            },
            telegram: {
                botToken: "8119987442:AAEY-0a1zp6mtDtWPg0J8njLiovoXyXoZKo",
                chatId: "6068899411"
            },
            imgbb: {
                apiKey: "595f3c57a1f03568b80287cca311144b"
            }
        };
        
        
        const loadingOverlay = document.getElementById('loading-overlay');
        // DOM Elements
const unitOptionsContainer = document.getElementById('unit-options-container');
const productPrice = document.getElementById('product-price');
const orderConfirmation = document.getElementById('order-confirmation');
const closeConfirmationBtn = document.querySelector('.close-confirmation');
// ... باقي المتغيرات ...
        // DOM Elements
        const sections = document.querySelectorAll('.section');
        const navItems = document.querySelectorAll('.nav-item');
        const productsContainer = document.getElementById('products-container');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTax = document.getElementById('cart-tax');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.querySelector('.cart-count');
        const checkoutBtn = document.getElementById('checkout-btn');
        const customerName = document.getElementById('customer-name');
        const customerPhone = document.getElementById('customer-phone');
        const customerLocation = document.getElementById('customer-location');
        const customerNotes = document.getElementById('customer-notes');
        const loginForm = document.getElementById('login-form');
        const adminPanel = document.getElementById('admin-panel');
        const adminPassword = document.getElementById('admin-password');
        const loginBtn = document.getElementById('login-btn');
        const adminProductsContainer = document.getElementById('admin-products');
        const productName = document.getElementById('product-name');
        const productDescription = document.getElementById('product-description');
      
        const productImage = document.getElementById('product-image');
        const productUnavailable = document.getElementById('product-unavailable');
        const productSale = document.getElementById('product-sale');
        const saveProductBtn = document.getElementById('save-product-btn');
        const newPassword = document.getElementById('new-password');
        const changePasswordBtn = document.getElementById('change-password-btn');
        const saleModal = document.getElementById('sale-modal');
        const closeSaleModal = document.getElementById('close-sale-modal');
        const oldPrice = document.getElementById('old-price');
        const newPrice = document.getElementById('new-price');
        const discountPercentage = document.getElementById('discount-percentage');
        const cancelSale = document.getElementById('cancel-sale');
        const saveSale = document.getElementById('save-sale');
        const toast = document.getElementById('toast');
        
        // State
        let products = [];
        let cart = [];
        let currentProductId = null;
        let currentSaleProductId = null;
        let editingProductId = null;
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            loadProducts();
            setupEventListeners();
            loadCartFromLocalStorage();
            updateCartUI();
        });
        
        // Event Listeners
        function setupEventListeners() {
            // Navigation
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = item.getAttribute('data-section');
                    showSection(sectionId);
                    
                    // Update active nav item
                    navItems.forEach(navItem => navItem.classList.remove('active'));
                    item.classList.add('active');
                });
            });
            
            // Checkout
            checkoutBtn.addEventListener('click', processCheckout);
               document.getElementById('add-auto-units').addEventListener('click', addAutoUnits);
            // Admin Login
            loginBtn.addEventListener('click', adminLogin);
            
            // Save Product
            saveProductBtn.addEventListener('click', saveProduct);
            
            // Change Password
            changePasswordBtn.addEventListener('click', changeAdminPassword);
            
            // Sale Modal
            productSale.addEventListener('change', toggleSaleModal);
            closeSaleModal.addEventListener('click', () => saleModal.style.display = 'none');
            cancelSale.addEventListener('click', () => {
                saleModal.style.display = 'none';
                productSale.checked = false;
            });
            saveSale.addEventListener('click', saveSalePrice);
            
            // Price calculation for sale
            newPrice.addEventListener('input', calculateDiscount);
            
            closeConfirmationBtn.addEventListener('click', () => {
    orderConfirmation.classList.remove('show');
});
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === saleModal) {
                    saleModal.style.display = 'none';
                    productSale.checked = false;
                }
            });
        }
        
        // Show Section
        function showSection(sectionId) {
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll to top when switching sections
            window.scrollTo(0, 0);
        }
        
        // Load Products from JSONBin.io
        async function loadProducts() {
            showLoading();
            
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
                    headers: {
                        'X-Master-Key': config.jsonbin.apiKey
                    }
                });
                
                if (!response.ok) throw new Error('Failed to load products');
                
                const data = await response.json();
                products = data.record[config.jsonbin.productsKey] || [];
                
                renderProducts();
                if (adminPanel.style.display === 'block') {
                    renderAdminProducts();
                }
            } catch (error) {
                console.error('Error loading products:', error);
                showToast('فشل تحميل المنتجات', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Render Products
        function renderProducts() {
            productsContainer.innerHTML = '';
            
            // Show sale products first
            const saleProducts = products.filter(p => p.sale && p.sale.active);
            const regularProducts = products.filter(p => !p.sale || !p.sale.active);
            
            saleProducts.forEach(product => {
                productsContainer.appendChild(createProductCard(product));
            });
            
            regularProducts.forEach(product => {
                productsContainer.appendChild(createProductCard(product));
            });
        }
        
        // Create Product Card
        function createProductCard(product) {
            const card = document.createElement('div');
            card.className = `product-card ${product.unavailable ? 'unavailable' : ''} ${product.sale?.active ? 'sale' : ''}`;
            card.dataset.id = product.id;
            
            let saleBadge = '';
            let priceDisplay = `<span class="current-price">${product.price} ليرة</span>`;
            
            if (product.sale?.active) {
                saleBadge = `<div class="sale-badge">خصم ${product.sale.discount}%</div>`;
                priceDisplay = `
                    <span class="current-price">${product.sale.newPrice} ليرة</span>
                    <span class="old-price">${product.price} ليرة</span>
                `;
            }
            
            card.innerHTML = `
                ${saleBadge}
                <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        ${priceDisplay}
                    </div>
                    <button class="add-to-cart" ${product.unavailable ? 'disabled' : ''}>
                        ${product.unavailable ? 'غير متوفر' : 'أضف إلى السلة'}
                    </button>
                </div>
            `;
            
            if (!product.unavailable) {
                card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product.id));
            }
            
            return card;
        }
        
        // Add to Cart
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const cartItem = cart.find(item => item.productId === productId);
            const price = product.sale?.active ? product.sale.newPrice : product.price;
            
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({
                    productId,
                    name: product.name,
                    price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            saveCartToLocalStorage();
            updateCartUI();
            showToast('تمت إضافة المنتج إلى السلة');
            
            // Add shake animation to cart icon
            const cartIcon = document.querySelector('#cart-nav-item i');
            cartIcon.classList.add('shake');
            setTimeout(() => cartIcon.classList.remove('shake'), 500);
        }
        
        // Update Cart UI
        function updateCartUI() {
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align: center;">السلة فارغة</p>';
                cartSubtotal.textContent = '0 ليرة';
                cartTax.textContent = '0 ليرة';
                cartTotal.textContent = '0 ليرة';
                cartCount.textContent = '0';
                return;
            }
            
            let subtotal = 0;
            
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">${item.price} ليرة</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity">+</button>
                        </div>
                    </div>
                    <i class="fas fa-trash remove-item"></i>
                `;
                
                itemElement.querySelector('.decrease-quantity').addEventListener('click', () => updateQuantity(item.productId, -1));
                itemElement.querySelector('.increase-quantity').addEventListener('click', () => updateQuantity(item.productId, 1));
                itemElement.querySelector('.remove-item').addEventListener('click', () => removeFromCart(item.productId));
                
                cartItemsContainer.appendChild(itemElement);
                subtotal += item.price * item.quantity;
            });
            
            const tax = subtotal * 0.15; // 15% VAT
            const total = subtotal + tax;
            
            cartSubtotal.textContent = `${subtotal.toFixed(2)} ليرة`;
            cartTax.textContent = `${tax.toFixed(2)} ليرة`;
            cartTotal.textContent = `${total.toFixed(2)} ليرة`;
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        // Update Quantity
        function updateQuantity(productId, change) {
            const itemIndex = cart.findIndex(item => item.productId === productId);
            if (itemIndex === -1) return;
            
            cart[itemIndex].quantity += change;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            saveCartToLocalStorage();
            updateCartUI();
        }
        
        // Remove from Cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.productId !== productId);
            saveCartToLocalStorage();
            updateCartUI();
            showToast('تمت إزالة المنتج من السلة');
        }
        
        // Process Checkout
        async function processCheckout() {
            if (cart.length === 0) {
                showToast('السلة فارغة', 'error');
                return;
            }
            
            if (!customerName.value.trim()) {
                showToast('الرجاء إدخال اسم المستلم', 'error');
                customerName.focus();
                return;
            }
                        if (!customerPhone.value.trim()) {
                showToast('الرجاء إدخال العنوان الدقيق ', 'error');
                customerPhone.focus();
                return;
            }
            
            showLoading();
            
            try {
                // Prepare order details
                const orderDetails = cart.map(item => {
                    return `${item.name} (${item.quantity} × ${item.price} ليرة) = ${(item.quantity * item.price).toFixed(2)} ليرة`;
                }).join('%0A');
                
                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const tax = subtotal * 0.15;
                const total = subtotal + tax;
                
                // Prepare message for Telegram
                let message = `🎉 *طلب جديد* 🎉%0A%0A`;
                message += `👤 *الاسم:* ${customerName.value}%0A`;
                if (customerPhone.value) message += `📞 *العوان:* ${customerPhone.value}%0A`;
                if (customerLocation.value) message += `📍 *الموقع:* ${customerLocation.value}%0A`;
                if (customerNotes.value) message += `📝 *ملاحظات:* ${customerNotes.value}%0A%0A`;
                
                message += `🛒 *تفاصيل الطلب:*%0A${orderDetails}%0A%0A`;
                message += `💰 *المجموع:* ${subtotal.toFixed(2)} ليرة%0A`;
                message += `💲 *الضريبة (15%):* ${tax.toFixed(2)} ليرة%0A`;
                message += `💵 *الإجمالي:* ${total.toFixed(2)} ليرة%0A%0A`;
                message += `🕒 *التاريخ:* ${new Date().toLocaleString('ar-SA')}`;
                
                // Send to Telegram bot
                const telegramUrl = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage?chat_id=${config.telegram.chatId}&text=${message}&parse_mode=Markdown`;
                
                const response = await fetch(telegramUrl);
                
                if (response.ok) {
                    showToast('تم إرسال الطلب بنجاح', 'success');
                    cart = [];
                    saveCartToLocalStorage();
                    updateCartUI();
                    customerName.value = '';
                    customerPhone.value = '';
                    customerLocation.value = '';
                    customerNotes.value = '';
                    
                    // Switch to home section
                    showSection('home-section');
                    document.querySelector('[data-section="home-section"]').classList.add('active');
                    document.querySelector('[data-section="cart-section"]').classList.remove('active');
                } else {
                    throw new Error('Failed to send order');
                }
            } catch (error) {
                console.error('Error processing checkout:', error);
                showToast('فشل إرسال الطلب', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Admin Login
        async function adminLogin() {
            const password = adminPassword.value.trim();
            if (!password) {
                showToast('الرجاء إدخال كلمة المرور', 'error');
                return;
            }
            
            showLoading();
            
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
                    headers: {
                        'X-Master-Key': config.jsonbin.apiKey
                    }
                });
                
                if (!response.ok) throw new Error('Failed to verify password');
                
                const data = await response.json();
                const storedPassword = data.record[config.jsonbin.passwordKey];
                
                if (password === storedPassword) {
                    loginForm.style.display = 'none';
                    adminPanel.style.display = 'block';
                    renderAdminProducts();
                    showToast('تم تسجيل الدخول بنجاح', 'success');
                    adminPassword.value = '';
                } else {
                    throw new Error('Incorrect password');
                }
            } catch (error) {
                console.error('Error during login:', error);
                showToast('كلمة المرور غير صحيحة', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Render Admin Products
        function renderAdminProducts() {
            adminProductsContainer.innerHTML = '';
            
            if (products.length === 0) {
                adminProductsContainer.innerHTML = '<p>لا توجد منتجات</p>';
                return;
            }
            
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'admin-product-card';
                productElement.innerHTML = `
                    <div>
                        <h4>${product.name}</h4>
                        <p>${product.price} ليرة ${product.sale?.active ? `(خصم ${product.sale.discount}% → ${product.sale.newPrice} ليرة)` : ''}</p>
                        <small>${product.unavailable ? 'غير متوفر' : 'متوفر'}</small>
                    </div>
                    <div class="admin-product-actions">
                        <button class="admin-btn edit-btn edit-product">تعديل</button>
                        <button class="admin-btn delete-btn delete-product">حذف</button>
                    </div>
                `;
                
                productElement.querySelector('.edit-product').addEventListener('click', () => editProduct(product.id));
                productElement.querySelector('.delete-product').addEventListener('click', () => deleteProduct(product.id));
                
                adminProductsContainer.appendChild(productElement);
            });
        }
        
        // Edit Product
        function editProduct(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            editingProductId = productId;
            productName.value = product.name;
            productDescription.value = product.description;
            productPrice.value = product.price;
            productUnavailable.checked = product.unavailable || false;
            productSale.checked = product.sale?.active || false;
            
            // Scroll to form
            document.getElementById('product-name').scrollIntoView({ behavior: 'smooth' });
        }
        
        // Delete Product
        async function deleteProduct(productId) {
            if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
            
            showLoading();
            
            try {
                products = products.filter(p => p.id !== productId);
                await saveProductsToJsonBin();
                
                renderProducts();
                renderAdminProducts();
                showToast('تم حذف المنتج بنجاح', 'success');
            } catch (error) {
                console.error('Error deleting product:', error);
                showToast('فشل حذف المنتج', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Save Product
        async function saveProduct() {
            const name = productName.value.trim();
            const description = productDescription.value.trim();
            const price = parseFloat(productPrice.value);
            const unavailable = productUnavailable.checked;
            const sale = productSale.checked;
            const imageFile = productImage.files[0];
            
            if (!name || !description || isNaN(price) || price <= 0) {
                showToast('الرجاء ملء جميع الحقول بشكل صحيح', 'error');
                return;
            }
            
            showLoading();
            
            try {
                let imageUrl = '';
                
                // Upload image if selected
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbb.apiKey}`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    imageUrl = data.data.url;
                }
                
                // Prepare product data
                const productData = {
                    id: editingProductId || Date.now().toString(),
                    name,
                    description,
                    price,
                    unavailable,
                    image: imageUrl || (editingProductId ? products.find(p => p.id === editingProductId)?.image : ''),
                    sale: sale ? {
                        active: true,
                        oldPrice: price,
                        newPrice: parseFloat(newPrice.value),
                        discount: parseInt(discountPercentage.value)
                    } : null
                };
                
                // Add or update product
                if (editingProductId) {
                    const index = products.findIndex(p => p.id === editingProductId);
                    if (index !== -1) {
                        products[index] = productData;
                    }
                } else {
                    products.push(productData);
                }
                
                // Save to JSONBin.io
                await saveProductsToJsonBin();
                
                // Reset form
                resetProductForm();
                
                // Update UI
                renderProducts();
                renderAdminProducts();
                showToast(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج بنجاح', 'success');
            } catch (error) {
                console.error('Error saving product:', error);
                showToast('فشل حفظ المنتج', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Toggle Sale Modal
        function toggleSaleModal() {
            if (productSale.checked) {
                const price = parseFloat(productPrice.value);
                if (isNaN(price) || price <= 0) {
                    showToast('الرجاء إدخال سعر صحيح أولاً', 'error');
                    productSale.checked = false;
                    return;
                }
                
                oldPrice.value = price;
                newPrice.value = price;
                discountPercentage.value = 0;
                currentSaleProductId = editingProductId || null;
                saleModal.style.display = 'flex';
            } else {
                saleModal.style.display = 'none';
            }
        }
        
        // Calculate Discount
        // Calculate Discount
// Calculate Discount
function calculateDiscount() {
  const oldPriceValue = parseFloat(oldPrice.value);
  const newPriceValue = parseFloat(newPrice.value);
  
  if (isNaN(oldPriceValue)) {
    return;
  }
  
  if (isNaN(newPriceValue)) {
    discountPercentage.value = 0;
    return;
  }
  
  const discount = Math.round(((oldPriceValue - newPriceValue) / oldPriceValue) * 100);
  discountPercentage.value = discount > 0 ? discount : 0;
}        
        // Save Sale Price
      // Save Sale Price
function saveSalePrice() {
  const newPriceValue = parseFloat(newPrice.value);
  const discountValue = parseInt(discountPercentage.value);
  
  if (isNaN(newPriceValue)) { // تم إضافة القوس الناقص هنا
    showToast('الرجاء إدخال سعر صحيح', 'error');
    return;
  }
  
  if (newPriceValue <= 0 || newPriceValue >= parseFloat(oldPrice.value)) {
    showToast('السعر الجديد يجب أن يكون أقل من السعر الأصلي', 'error');
    return;
  }
  
  saleModal.style.display = 'none';
}        
        // Change Admin Password
        async function changeAdminPassword() {
            const password = newPassword.value.trim();
            if (!password) {
                showToast('الرجاء إدخال كلمة مرور جديدة', 'error');
                return;
            }
            
            showLoading();
            
            try {
                // Get current data
                const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
                    headers: {
                        'X-Master-Key': config.jsonbin.apiKey
                    }
                });
                
                if (!response.ok) throw new Error('Failed to load current data');
                
                const data = await response.json();
                const currentData = data.record;
                
                // Update password
                currentData[config.jsonbin.passwordKey] = password;
                
                // Save updated data
                const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': config.jsonbin.apiKey
                    },
                    body: JSON.stringify(currentData)
                });
                
                if (!updateResponse.ok) throw new Error('Failed to update password');
                
                showToast('تم تغيير كلمة المرور بنجاح', 'success');
                newPassword.value = '';
            } catch (error) {
                console.error('Error changing password:', error);
                showToast('فشل تغيير كلمة المرور', 'error');
            } finally {
                hideLoading();
            }
        }
        
        // Reset Product Form
        function resetProductForm() {
            productName.value = '';
            productDescription.value = '';
            productPrice.value = '';
            productImage.value = '';
            productUnavailable.checked = false;
            productSale.checked = false;
            editingProductId = null;
            currentSaleProductId = null;
        }
        
        // Save Products to JSONBin.io
        async function saveProductsToJsonBin() {
            // Get current data
            const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
                headers: {
                    'X-Master-Key': config.jsonbin.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to load current data');
            
            const data = await response.json();
            const currentData = data.record;
            
            // Update products
            currentData[config.jsonbin.productsKey] = products;
            
            // Save updated data
            const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': config.jsonbin.apiKey
                },
                body: JSON.stringify(currentData)
            });
            
            if (!updateResponse.ok) throw new Error('Failed to save products');
        }
        
        // Save Cart to Local Storage
        function saveCartToLocalStorage() {
            localStorage.setItem('restaurant_cart', JSON.stringify(cart));
        }
        
        // Load Cart from Local Storage
        function loadCartFromLocalStorage() {
            const savedCart = localStorage.getItem('restaurant_cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
        }
        
        // Show Toast Notification
        function showToast(message, type = 'success') {
            toast.textContent = message;
            toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 
                                         type === 'error' ? 'var(--secondary-color)' : 
                                         'var(--info-color)';
            
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        // Show Loading
        function showLoading() {
            // You can implement a loading spinner here
            document.body.style.opacity = '0.7';
            document.body.style.pointerEvents = 'none';
        }
        
        // Hide Loading
      
        
        // ... الكود السابق ...

// Hide Loading
function hideLoading() {
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
} // هذه هي نهاية الدالة hideLoading

/**
 * إضافة وحدات القياس التلقائية للمنتج
 */
function addAutoUnits() {
    const price = parseFloat(productPrice.value);
    if (isNaN(price)) {
        showToast('الرجاء إدخال سعر المنتج أولاً', 'error');
        return;
    }

    // مسح أي وحدات موجودة مسبقاً
    unitOptionsContainer.innerHTML = '';

    // الوحدات التلقائية المطلوبة
    const autoUnits = [
        { label: 'ربع كيلو', value: 'quarter', factor: 0.25 },
        { label: 'نصف كيلو', value: 'half', factor: 0.5 },
        { label: 'ثلاثة أرباع كيلو', value: 'three-quarters', factor: 0.75 }
    ];

    // إضافة الوحدات إلى واجهة المستخدم
    autoUnits.forEach(unit => {
        const unitPrice = price * unit.factor;
        const unitElement = document.createElement('div');
        unitElement.className = 'auto-unit-item';
        unitElement.innerHTML = `
            <div>
                <strong>${unit.label}</strong>
                <span class="unit-badge">${unitPrice.toFixed(2)} ليرة سورية.</span>
            </div>
            <input type="hidden" class="unit-label" value="${unit.label}">
            <input type="hidden" class="unit-value" value="${unit.value}">
            <input type="hidden" class="unit-factor" value="${unit.factor}">
        `;
        unitOptionsContainer.appendChild(unitElement);
    });

    showToast('تمت إضافة الوحدات التلقائية بنجاح', 'success');
}
/**
 * حفظ المنتج مع خيارات الوحدات
 */
async function saveProduct() {
    const name = productName.value.trim();
    const description = productDescription.value.trim();
    const price = parseFloat(productPrice.value);
    const unavailable = productUnavailable.checked;
    const sale = productSale.checked;
    const imageFile = productImage.files[0];
    
    if (!name || !description || isNaN(price) || price <= 0) {
        showToast('الرجاء ملء جميع الحقول بشكل صحيح', 'error');
        return;
    }
    
    showLoading();
    
    try {
        let imageUrl = '';
        
        // رفع الصورة إذا تم اختيارها
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbb.apiKey}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            imageUrl = data.data.url;
        }
        
        // جمع خيارات الوحدات
        const units = [];
        const unitOptions = document.querySelectorAll('.auto-unit-item');
        
        unitOptions.forEach(option => {
            const label = option.querySelector('.unit-label').value.trim();
            const value = option.querySelector('.unit-value').value.trim();
            const factor = parseFloat(option.querySelector('.unit-factor').value);
            
            if (label && value && !isNaN(factor)) {
                units.push({ label, value, factor });
            }
        });
        
        // إعداد بيانات المنتج
        const productData = {
            id: editingProductId || Date.now().toString(),
            name,
            description,
            price,
            unavailable,
            image: imageUrl || (editingProductId ? products.find(p => p.id === editingProductId)?.image : ''),
            units: units.length > 0 ? units : null,
            sale: sale ? {
                active: true,
                oldPrice: price,
                newPrice: parseFloat(newPrice.value),
                discount: parseInt(discountPercentage.value)
            } : null
        };
        
        // إضافة أو تحديث المنتج
        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            products.push(productData);
        }
        
        // الحفظ في JSONBin.io
        await saveProductsToJsonBin();
        
        // إعادة تعيين النموذج
        resetProductForm();
        
        // تحديث الواجهة
        renderProducts();
        renderAdminProducts();
        showToast(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج بنجاح', 'success');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('فشل حفظ المنتج', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * إنشاء بطاقة منتج مع خيارات الوحدات
 */
/**
 * إنشاء بطاقة منتج جديدة مع كافة الميزات
 * @param {Object} product - بيانات المنتج
 * @returns {HTMLElement} عنصر بطاقة المنتج
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = `product-card ${product.unavailable ? 'unavailable' : ''} ${product.sale?.active ? 'sale' : ''}`;
  card.dataset.id = product.id;
  
  // معالجة السعر والتخفيضات
  const price = product.sale?.active ? product.sale.newPrice : product.price;
  const oldPrice = product.sale?.active ? product.price : null;
  const discount = product.sale?.active ? product.sale.discount : null;
  
  // إنشاء وحدات القياس إذا وجدت
  let unitOptions = '';
  if (product.units && product.units.length > 0) {
    unitOptions = `
            <div class="unit-buttons">
                <div class="unit-btn active" data-unit="full" data-price="${price}">
                    كيلو كامل
                    <div class="unit-price">${formatPrice(price)}</div>
                </div>
                ${product.units.map(unit => `
                    <div class="unit-btn" data-unit="${unit.value}" 
                         data-price="${(price * unit.factor).toFixed(2)}">
                        ${unit.label}
                        <div class="unit-price">${formatPrice(price * unit.factor)}</div>
                    </div>
                `).join('')}
            </div>
        `;
  }
  
  // إنشاء وسم التخفيض إذا كان موجوداً
  const saleBadge = discount ? `<div class="sale-badge">خصم ${discount}%</div>` : '';
  
  // بناء هيكل البطاقة
  card.innerHTML = `
        ${saleBadge}
        <img src="${product.image || 'placeholder.jpg'}" 
             alt="${product.name}" 
             class="product-image lazy"
             data-src="${product.image || 'placeholder.jpg'}">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">
                ${oldPrice ? `
                    <span class="current-price">${formatPrice(price)}</span>
                    <span class="old-price">${formatPrice(oldPrice)}</span>
                ` : `<span class="current-price">${formatPrice(price)}</span>`}
            </div>
            ${unitOptions}
            <button class="add-to-cart" ${product.unavailable ? 'disabled' : ''}>
                ${product.unavailable ? 'غير متوفر' : 'أضف إلى السلة'}
            </button>
        </div>
    `;
  
  // إضافة أحداث الوحدات إذا وجدت
  if (product.units) {
    const unitButtons = card.querySelectorAll('.unit-btn');
    unitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        unitButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  
  // إضافة حدث الزر "أضف إلى السلة"
  if (!product.unavailable) {
    card.querySelector('.add-to-cart').addEventListener('click', () => {
      const activeUnit = card.querySelector('.unit-btn.active');
      const selectedUnit = activeUnit ? activeUnit.dataset.unit : 'full';
      const selectedPrice = activeUnit ? parseFloat(activeUnit.dataset.price) : price;
      
      addToCart(product.id, selectedUnit, selectedPrice, product.name, product.image);
    });
  }
  
  return card;
}
/**
 * إضافة منتج إلى السلة مع اختيار الوحدة
 */
function addToCart(productId, unit = 'full', unitPrice = null) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let price = unitPrice || (product.sale?.active ? product.sale.newPrice : product.price);
    let unitLabel = 'كيلو كامل';
    
    if (product.units && product.units.length > 0 && unit !== 'full') {
        const selectedUnit = product.units.find(u => u.value === unit);
        if (selectedUnit) {
            unitLabel = selectedUnit.label;
        }
    }
    
    const cartItem = cart.find(item => item.productId === productId && item.unit === unit);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            productId,
            name: `${product.name} (${unitLabel})`,
            price,
            image: product.image,
            quantity: 1,
            unit
        });
    }
    
    saveCartToLocalStorage();
    updateCartUI();
    showToast('تمت إضافة المنتج إلى السلة');
    
    // إضافة تأثير اهتزاز لأيقونة السلة
    const cartIcon = document.querySelector('#cart-nav-item i');
    cartIcon.classList.add('shake');
    setTimeout(() => cartIcon.classList.remove('shake'), 500);
}
/**
 * تنسيق الأسعار لعرضها بطريقة مقروءة
 */
function formatPrice(price) {
    // تحويل السعر إلى عدد إذا كان نصاً
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' مليون';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + ' ألف';
    }
    return num.toFixed(2) + '';
}

// Process Checkout
async function processCheckout() {
    if (cart.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }
    
    if (!customerName.value.trim()) {
        showToast('الرجاء إدخال اسم المستلم', 'error');
        customerName.focus();
        return;
    }
    
    if (!customerPhone.value.trim()) {
        showToast('الرجاء إدخال العنوان الدقيق', 'error');
        customerPhone.focus();
        return;
    }
    
    showLoading();
    
    try {
        // Prepare order details
        const orderDetails = cart.map(item => {
            return `${item.name} (${item.quantity} × ${item.price} ليرة) = ${(item.quantity * item.price).toFixed(2)} ليرة`;
        }).join('%0A');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        
        // Prepare message for Telegram
        let message = `🎉 *طلب جديد* 🎉%0A%0A`;
        message += `👤 *الاسم:* ${customerName.value}%0A`;
        if (customerPhone.value) message += `📞 *العنوان:* ${customerPhone.value}%0A`;
        if (customerLocation.value) message += `📍 *الموقع:* ${customerLocation.value}%0A`;
        if (customerNotes.value) message += `📝 *ملاحظات:* ${customerNotes.value}%0A%0A`;
        
        message += `🛒 *تفاصيل الطلب:*%0A${orderDetails}%0A%0A`;
        message += `💰 *المجموع:* ${subtotal.toFixed(2)} ليرة%0A`;
        message += `💲 *الضريبة (15%):* ${tax.toFixed(2)} ليرة%0A`;
        message += `💵 *الإجمالي:* ${total.toFixed(2)} ليرة%0A%0A`;
        message += `🕒 *التاريخ:* ${new Date().toLocaleString('ar-SA')}`;
        
        // Send to Telegram bot
        const telegramUrl = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage?chat_id=${config.telegram.chatId}&text=${message}&parse_mode=Markdown`;
        
        const response = await fetch(telegramUrl);
        
        if (response.ok) {
            // Show order confirmation
            orderConfirmation.classList.add('show');
            
            // Auto-hide confirmation after 5 seconds
            setTimeout(() => {
                orderConfirmation.classList.remove('show');
            }, 5000);
            
            // Reset cart and form
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();
            customerName.value = '';
            customerPhone.value = '';
            customerLocation.value = '';
            customerNotes.value = '';
            
            // Switch to home section
            showSection('home-section');
            document.querySelector('[data-section="home-section"]').classList.add('active');
            document.querySelector('[data-section="cart-section"]').classList.remove('active');
            
            // Show success toast
            showToast('تم إرسال الطلب بنجاح', 'success');
        } else {
            throw new Error('Failed to send order');
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        showToast('فشل إرسال الطلب', 'error');
    } finally {
        hideLoading();
    }
}

// Show Loading
function showLoading() {
    loadingOverlay.classList.add('active');
}

// Hide Loading
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Preload important resources
function preloadResources() {
    const resources = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
        'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap'
    ];
    
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
    });
}

// في بداية initApp()
document.addEventListener('DOMContentLoaded', () => {
    preloadResources();
    loadProducts();
    setupEventListeners();
    loadCartFromLocalStorage();
    updateCartUI();
});

function renderProducts() {
    productsContainer.innerHTML = '';
    
    const saleProducts = products.filter(p => p.sale && p.sale.active);
    const regularProducts = products.filter(p => !p.sale || !p.sale.active);
    
    saleProducts.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
    
    regularProducts.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
    
    // تحميل الصور عند ظهورها
    setTimeout(lazyLoadImages, 100);
}
/**
 * دالة تحميل الصور الكسول (Lazy Load) - تحميل الصور فقط عند ظهورها في منطقة الرؤية
 * @version 1.1
 * @description تقوم هذه الدالة بمراقبة الصور ذات الكلاس 'lazy' وتحميلها فقط عندما تظهر في الشاشة
 * مع إضافة تأثير انتقالي عند التحميل، وتدعم الصور الاحتياطية عند الخطأ
 */
function lazyLoadImages() {
    // 1. تحديد جميع الصور التي نريد تحميلها بكسل
    const lazyImages = document.querySelectorAll('.product-image.lazy');
    
    // 2. إذا لم يكن المتصفح يدعم IntersectionObserver نستخدم الطريقة التقليدية
    if (!('IntersectionObserver' in window)) {
        lazyImages.forEach(img => {
            loadImageImmediately(img);
        });
        return;
    }

    // 3. إنشاء مراقب IntersectionObserver
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 4. إذا كانت الصورة في منطقة الرؤية
                if (img.dataset.src) {
                    // 5. تحميل الصورة
                    img.src = img.dataset.src;
                    
                    // 6. إزالة السمة data-src بعد التحميل
                    img.removeAttribute('data-src');
                    
                    // 7. إضافة حدث عند تحميل الصورة بنجاح
                    img.addEventListener('load', () => {
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        
                        // 8. إضافة تأثير انتقالي
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = 1;
                    });
                    
                    // 9. إضافة حدث عند خطأ التحميل
                    img.addEventListener('error', () => {
                        img.src = 'https://via.placeholder.com/300?text=Error+Loading';
                        img.classList.remove('lazy');
                        img.classList.add('error');
                        img.alt = 'فشل تحميل الصورة';
                    });
                    
                    // 10. التوقف عن مراقبة الصورة بعد تحميلها
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '200px 0px', // بدء التحميل قبل 200px من وصول الصورة للشاشة
        threshold: 0.01 // نسبة 1% من ظهور الصورة
    });

    // 11. بدء مراقبة جميع الصور
    lazyImages.forEach(img => {
        // 12. إذا كانت الصورة محملة مسبقاً (مثلاً من ذاكرة التخزين المؤقت)
        if (img.complete && img.naturalWidth !== 0) {
            img.classList.remove('lazy');
            img.classList.add('loaded');
        } else {
            imageObserver.observe(img);
        }
    });
}

/**
 * دالة مساعدة لتحميل الصور فوراً (للأجهزة التي لا تدعم IntersectionObserver)
 * @param {HTMLImageElement} img - عنصر الصورة المراد تحميله
 */
function loadImageImmediately(img) {
    if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy');
        img.classList.add('loaded');
    }
}

/**
 * دالة تهيئة لتحميل الصور الكسول (للاستخدام عند إضافة محتوى ديناميكي)
 */
function initLazyLoading() {
    // 1. تهيئة تحميل الصور الأولي
    lazyLoadImages();
    
    // 2. إعادة تهيئة عند تغيير حجم النافذة (لحساب المواقع الجديدة)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            lazyLoadImages();
        }, 250);
    });
    
    // 3. إعادة التهيئة عند التمرير (لحالات خاصة)
    window.addEventListener('scroll', () => {
        if (!scrollCheckTimer) {
            scrollCheckTimer = setTimeout(() => {
                lazyLoadImages();
                scrollCheckTimer = null;
            }, 300);
        }
    });
    let scrollCheckTimer = null;
}

// استدعاء التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initLazyLoading);

async function loadProducts() {
    showLoading();
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
            headers: {
                'X-Master-Key': config.jsonbin.apiKey,
                'X-Bin-Meta': 'false' // للحصول على البيانات مباشرة بدون ميتاداتا
            }
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الشبكة: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // تحقق من وجود البيانات وهيكلتها
        if (!data || !data[config.jsonbin.productsKey]) {
            throw new Error('هيكلة البيانات غير صحيحة');
        }
        
        products = data[config.jsonbin.productsKey] || [];
        
        renderProducts();
        
        if (adminPanel.style.display === 'block') {
            renderAdminProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        
        // رسالة خطأ أكثر وضوحاً للمستخدم
        const errorMessage = error.message.includes('Failed to fetch') 
            ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت'
            : `خطأ في تحميل المنتجات: ${error.message}`;
        
        showToast(errorMessage, 'error');
        
        // عرض حالة الطوارئ إذا فشل التحميل
        showEmergencyProducts();
    } finally {
        hideLoading();
    }
}

// دالة لعرض منتجات افتراضية عند فشل التحميل
function showEmergencyProducts() {
    const emergencyProducts = [
        {
            id: '1',
            name: 'منتج افتراضي',
            description: 'هذا منتج مؤقت حتى يتم تحميل البيانات',
            price: 1000,
            image: 'https://via.placeholder.com/300',
            unavailable: false
        }
    ];
    
    products = emergencyProducts;
    renderProducts();
}
// أضف هذه المتغيرات في بداية الدوال
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const productNameConfirm = document.querySelector('.product-name-confirm');
let productToDelete = null;

// في دالة setupEventListeners أضف:
confirmDeleteBtn.addEventListener('click', executeDelete);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);
document.querySelector('.close-confirm').addEventListener('click', hideDeleteModal);

// دالة عرض نافذة الحذف
function showDeleteModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productToDelete = productId;
    productNameConfirm.textContent = product.name;
    deleteConfirmModal.classList.add('show');
}

// دالة إخفاء نافذة الحذف
function hideDeleteModal() {
    deleteConfirmModal.classList.remove('show');
    productToDelete = null;
}

// دالة تنفيذ الحذف
async function executeDelete() {
    if (!productToDelete) return;
    
    hideDeleteModal();
    showLoading();
    
    try {
        products = products.filter(p => p.id !== productToDelete);
        await saveProductsToJsonBin();
        
        renderProducts();
        renderAdminProducts();
        showToast('تم حذف المنتج بنجاح', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('فشل حذف المنتج', 'error');
    } finally {
        hideLoading();
    }
}

// تعديل دالة deleteProduct الأصلية لتصبح:
function deleteProduct(productId) {
    showDeleteModal(productId);
}

function renderAdminProducts() {
    adminProductsContainer.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsContainer.innerHTML = '<p>لا توجد منتجات</p>';
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'admin-product-card';
        productElement.innerHTML = `
            <div>
                <h4>${product.name}</h4>
                <p>${product.price} ليرة ${product.sale?.active ? `(خصم ${product.sale.discount}% → ${product.sale.newPrice} ليرة)` : ''}</p>
                <small>${product.unavailable ? 'غير متوفر' : 'متوفر'}</small>
            </div>
            <div class="admin-product-actions">
                <button class="admin-btn edit-btn edit-product">تعديل</button>
                <button class="admin-btn delete-btn delete-product">حذف</button>
            </div>
        `;
        
        productElement.querySelector('.edit-product').addEventListener('click', () => editProduct(product.id));
        productElement.querySelector('.delete-product').addEventListener('click', () => deleteProduct(product.id));
        
        adminProductsContainer.appendChild(productElement);
    });
}
// في دالة setupEventListeners أضف:
const imageUpload = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');

imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
            imagePreview.parentElement.classList.add('has-image');
            
            // تحقق من أبعاد الصورة
            const img = new Image();
            img.onload = function() {
                if (img.width < 400 || img.height < 300) {
                    showToast('لأفضل نتائج، استخدم صورة بدقة أعلى', 'warning');
                }
            };
            img.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = 'https://via.placeholder.com/300x200?text=اختر+صورة';
        imagePreview.parentElement.classList.remove('has-image');
    }
});

function showDeleteModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('المنتج غير موجود', 'error');
        return;
    }
    
    productToDelete = productId;
    productNameConfirm.textContent = product.name;
    deleteConfirmModal.classList.add('show');
    
    // إضافة لأغراض التصحيح
    console.log('Product to delete ID:', productToDelete);
}

async function executeDelete() {
    if (!productToDelete) {
        showToast('لم يتم تحديد منتج للحذف', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // تصحيح: إنشاء نسخة جديدة من المصفوفة بدلاً من التعديل المباشر
        const updatedProducts = products.filter(p => p.id !== productToDelete);
        
        // تحقق قبل الحذف
        if (updatedProducts.length === products.length) {
            throw new Error('لم يتم العثور على المنتج في القائمة');
        }
        
        products = updatedProducts;
        
        // حفظ التغييرات
        await saveProductsToJsonBin();
        
        // تحديث الواجهة
        renderProducts();
        if (adminPanel.style.display === 'block') {
            renderAdminProducts();
        }
        
        showToast('تم حذف المنتج بنجاح', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast(`فشل حذف المنتج: ${error.message}`, 'error');
    } finally {
        hideLoading();
        hideDeleteModal();
        productToDelete = null; // إعادة التعيين بعد الحذف
    }
}

async function saveProductsToJsonBin() {
    try {
        // تحميل البيانات الحالية أولاً
        const response = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
            headers: {
                'X-Master-Key': config.jsonbin.apiKey
            }
        });
        
        if (!response.ok) throw new Error('Failed to load current data');
        
        const data = await response.json();
        const currentData = data.record || {};
        
        // تحديث بيانات المنتجات فقط
        currentData[config.jsonbin.productsKey] = products;
        
        // إرسال التحديثات
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': config.jsonbin.apiKey
            },
            body: JSON.stringify(currentData)
        });
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        
        console.log('Products saved successfully:', products);
        return true;
    } catch (error) {
        console.error('Error saving products:', error);
        throw error; // إعادة رمي الخطأ للتعامل معه في الدالة الأم
    }

}



/**
 * تحويل الأرقام إلى صيغة مالية مقروءة بالعربية
 * @param {number|string} price - السعر المدخل (رقم أو نص)
 * @param {string} currency - العملة (اختياري)
 * @returns {string} السعر المنسق
 */
function formatPrice(price, currency = 'ليرة') {
    // التحقق من المدخلات وتحويلها لرقم
    const num = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(num)) {
        console.warn('قيمة السعر غير صالحة:', price);
        return 'السعر غير متوفر';
    }

    // الصيغ المختلفة حسب حجم الرقم
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)} مليار ${currency}`;
    } else if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)} مليون ${currency}`;
    } else if (num >= 1000) {
        return `${Math.round(num / 1000)} ألف ${currency}`;
    } else if (num >= 1) {
        // للأرقام الصغيرة نستخدم الفاصلة العشرية عند الحاجة
        return num % 1 === 0 
            ? `${Math.round(num)} ${currency}` 
            : `${num.toFixed(2)} ${currency}`;
    } else {
        return `${num} ${currency}`;
    }
}




/**
 * تحديث واجهة مستخدم السلة وعرض المحتويات
 */
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    
    // حالة السلة الفارغة
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>سلة التسوق فارغة</p>
                
      
            </div>
        `;
        cartSubtotal.textContent = formatPrice(0);
        cartTax.textContent = formatPrice(0);
        cartTotal.textContent = formatPrice(0);
        cartCount.textContent = '0';
        return;
    }

    let subtotal = 0;
    const cartItemsMap = new Map();

    // تجميع العناصر المكررة
    cart.forEach(item => {
        const key = `${item.productId}-${item.unit}`;
        if (cartItemsMap.has(key)) {
            cartItemsMap.get(key).quantity += item.quantity;
        } else {
            cartItemsMap.set(key, {...item});
        }
        subtotal += item.price * item.quantity;
    });

    // عرض العناصر المجمعة
    cartItemsMap.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image || 'placeholder.jpg'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 loading="lazy">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-quantity" data-id="${item.productId}" data-unit="${item.unit}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.productId}" data-unit="${item.unit}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.productId}" data-unit="${item.unit}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });

    // حساب الضريبة والمجموع
    const tax = subtotal * 0.15; // 15% ضريبة
    const total = subtotal + tax;

    // تحديث الأرقام
    cartSubtotal.textContent = formatPrice(subtotal);
    cartTax.textContent = formatPrice(tax);
    cartTotal.textContent = formatPrice(total);
    cartCount.textContent = [...cartItemsMap.values()].reduce((sum, item) => sum + item.quantity, 0);

    // إضافة الأحداث
    document.querySelectorAll('.decrease-quantity').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(
            btn.dataset.id, 
            -1, 
            btn.dataset.unit
        ));
    });

    document.querySelectorAll('.increase-quantity').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(
            btn.dataset.id, 
            1, 
            btn.dataset.unit
        ));
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(
            btn.dataset.id,
            btn.dataset.unit
        ));
    });

    // تحميل الصور عند الظهور
    lazyLoadImages();
}


/**
 * تفريغ جميع حقول النموذج بعد النشر
 * @param {string} formId - ID الخاص بالنموذج (اختياري)
 */
function resetForm(formId = 'product-form') {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // تفريغ حقول الإدخال النصية
    const textInputs = form.querySelectorAll('input[type="text"], input[type="number"], textarea');
    textInputs.forEach(input => {
        input.value = '';
        input.classList.remove('valid', 'invalid');
    });
    
    // إعادة تعيين حقول التحديد
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // إعادة تعيين حقول الراديو
    const radios = form.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
        radios[0].checked = true; // اختيار أول زر راديو
    }
    
    // إعادة تعيين حقول التحديد (Select)
    const selects = form.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    // إعادة تعيين حقل رفع الملفات
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.value = '';
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.src = 'https://via.placeholder.com/300x200?text=اختر+صورة';
            preview.classList.remove('loaded');
        }
    });
    
    // إزالة رسائل التحقق
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // إعادة تعيين حالة الوحدات إذا وجدت
    const unitButtons = form.querySelectorAll('.unit-btn');
    if (unitButtons.length > 0) {
        unitButtons.forEach(btn => btn.classList.remove('active'));
        if (unitButtons[0]) unitButtons[0].classList.add('active');
    }
    
    // إخفاء نافذة التخفيضات إذا كانت ظاهرة
    const saleModal = document.getElementById('sale-modal');
    if (saleModal) saleModal.style.display = 'none';
   const productName = document.getElementById('product-name').value="";
        const productDescription = document.getElementById('product-description').value="";
      
        const productImage = document.getElementById('product-image').value="";
        const productUnavailable = document.getElementById('product-unavailable').value="";
        const productSale = document.getElementById('product-sale').value="";
     
    // إزالة أي تنبيهات
    showToast('تم نشر المنتج بنجاح', 'success');
            
}

async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    
    // ملء الحقول مع الاحتفاظ بالقيم الحالية إذا كانت موجودة
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-unavailable').checked = product.unavailable || false;
    document.getElementById('product-sale').checked = product.sale?.active || false;

    // الاحتفاظ بقيمة الصورة الحالية
    const imagePreview = document.getElementById('image-preview');
    if (product.image && imagePreview) {
        imagePreview.src = product.image;
        imagePreview.classList.add('loaded');
    }

    // إذا كان هناك تخفيض، تعبئة بياناته
    if (product.sale?.active) {
        document.getElementById('old-price').value = product.sale.oldPrice;
        document.getElementById('new-price').value = product.sale.newPrice;
        document.getElementById('discount-percentage').value = product.sale.discount;
    }

    // الاحتفاظ بوحدات القياس إذا وجدت
    if (product.units && product.units.length > 0) {
        renderUnitOptions(product.units);
    }

    // التمرير للنموذج
    document.getElementById('product-name').scrollIntoView({ behavior: 'smooth' });
    
    // إظهار زر التحديث وإخفاء زر الإضافة
    document.getElementById('update-product-btn').style.display = 'block';
    document.getElementById('add-product-btn').style.display = 'none';
}


function getCurrentUnitOptions() {
    const unitOptions = [];
    const unitElements = document.querySelectorAll('.unit-option');
    
    unitElements.forEach(unit => {
        unitOptions.push({
            label: unit.querySelector('.unit-label').value,
            value: unit.querySelector('.unit-value').value,
            factor: parseFloat(unit.querySelector('.unit-factor').value)
        });
    });
    
    return unitOptions.length > 0 ? unitOptions : null;
}

async function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const unavailable = document.getElementById('product-unavailable').checked;
    const sale = document.getElementById('product-sale').checked;
    const imageFile = document.getElementById('product-image').files[0];
    
    // التحقق من الصحة الأساسية
    if (!name || !description || isNaN(price) || price <= 0) {
        showToast('الرجاء ملء الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }

    showLoading();

    try {
        // الحصول على المنتج الحالي في حالة التعديل
        const currentProduct = editingProductId ? products.find(p => p.id === editingProductId) : null;
        
        // الاحتفاظ بالصورة الحالية إذا لم يتم تغييرها
        let imageUrl = currentProduct?.image || '';

        // إذا تم اختيار صورة جديدة، رفعها
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbb.apiKey}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            imageUrl = data.data.url;
        }

        // جمع وحدات القياس المضافة
        const units = [];
        document.querySelectorAll('.unit-option').forEach(option => {
            const label = option.querySelector('.unit-label').value.trim();
            const value = option.querySelector('.unit-value').value.trim();
            const factor = parseFloat(option.querySelector('.unit-factor').value);

            if (label && value && !isNaN(factor)) {
                units.push({ label, value, factor });
            }
        });

        // تجهيز بيانات المنتج
        const productData = {
            id: editingProductId || Date.now().toString(),
            name,
            description,
            price,
            unavailable,
            image: imageUrl,
            units: units.length > 0 ? units : null,
            sale: sale ? {
                active: true,
                oldPrice: price,
                newPrice: parseFloat(document.getElementById('new-price').value),
                discount: parseInt(document.getElementById('discount-percentage').value)
            } : null
        };

        // التحديث أو الإضافة
        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            products.push(productData);
        }

        await saveProductsToJsonBin();
        
        loadProducts();
        const productName = document.getElementById('product-name').value="";
        const productDescription = document.getElementById('product-description').value="";
      
        const productImage = document.getElementById('product-image').value="";
        const productUnavailable = document.getElementById('product-unavailable').value="";
        const productSale = document.getElementById('product-sale').value="";
    
        showToast(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج بنجاح', 'success');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('فشل في حفظ المنتج: ' + error.message, 'error');
    } finally {
        hideLoading();
        editingProductId = null;
    }
}

/**
 * تفريغ جميع حقول نموذج المنتج بعد النشر أو التعديل
 */
/**
 * تفريغ جميع حقول نموذج المنتج بعد النشر أو التعديل
 */
function resetProductForm() {
    // تفريغ الحقول الأساسية
    productName.value = '';
    productDescription.value = '';
    productPrice.value = '';
    productUnavailable.checked = false;
    productSale.checked = false;
    
    // تفريغ حقل الصورة وإعادة الصورة الافتراضية
    productImage.value = '';
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
        imagePreview.src = 'https://via.placeholder.com/300x200?text=اختر+صورة';
        imagePreview.parentElement.classList.remove('has-image');
    }
    
    // تفريغ خيارات الوحدات
    unitOptionsContainer.innerHTML = '';
    
    // إعادة تعيين معرف المنتج قيد التعديل
    editingProductId = null;
    currentSaleProductId = null;
    
    // إخفاء نافذة التخفيض إذا كانت ظاهرة
    saleModal.style.display = 'none';
    
    // إعادة عرض زر الإضافة وإخفاء زر التحديث إذا كان ظاهراً
    document.getElementById('save-product-btn').textContent = 'حفظ المنتج';
}

async function saveProduct() {
    // جمع بيانات النموذج الأساسية
    const name = productName.value.trim();
    const description = productDescription.value.trim();
    const price = parseFloat(productPrice.value);
    const unavailable = productUnavailable.checked;
    const sale = productSale.checked;
    const imageFile = productImage.files[0];
    
    // التحقق من الصحة الأساسية
    if (!name || !description || isNaN(price) || price <= 0) {
        showToast('الرجاء ملء الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }

    showLoading();

    try {
        // معالجة الصورة
        let imageUrl = '';
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbb.apiKey}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            imageUrl = data.data.url;
        } else if (editingProductId) {
            // الاحتفاظ بالصورة الحالية إذا لم يتم تغييرها
            const existingProduct = products.find(p => p.id === editingProductId);
            if (existingProduct) {
                imageUrl = existingProduct.image;
            }
        }

        // جمع وحدات القياس المضافة
        const units = [];
        const unitElements = document.querySelectorAll('.auto-unit-item');
        
        unitElements.forEach(unitElement => {
            const label = unitElement.querySelector('.unit-label').value.trim();
            const value = unitElement.querySelector('.unit-value').value.trim();
            const factor = parseFloat(unitElement.querySelector('.unit-factor').value);
            
            if (label && value && !isNaN(factor)) {
                units.push({ label, value, factor });
            }
        });

        // إعداد بيانات المنتج
        const productData = {
            id: editingProductId || Date.now().toString(),
            name,
            description,
            price,
            unavailable,
            image: imageUrl,
            units: units.length > 0 ? units : null,
            sale: sale ? {
                active: true,
                oldPrice: price,
                newPrice: parseFloat(newPrice.value),
                discount: parseInt(discountPercentage.value)
            } : null
        };

        // إضافة أو تحديث المنتج
        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            products.push(productData);
        }

        // الحفظ في JSONBin.io
        await saveProductsToJsonBin();
        
        // تحديث الواجهة وإعادة التعيين
        renderProducts();
        if (adminPanel.style.display === 'block') {
            renderAdminProducts();
        }
        
        resetProductForm();
        showToast(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج بنجاح', 'success');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('فشل حفظ المنتج', 'error');
    } finally {
        hideLoading();
    }
}

}



initApp()