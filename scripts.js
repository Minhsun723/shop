document.addEventListener('DOMContentLoaded', () => {
    // --- V6 Header Scroll Effect ---
    const headerElement = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (headerElement) {
            const scrollThreshold = 50;
            // 只有當選單沒打開時，才根據捲動改變 header 樣式
            if (window.scrollY > scrollThreshold && !headerElement.classList.contains('menu-open')) {
                headerElement.classList.add('scrolled');
            } else {
                headerElement.classList.remove('scrolled');
            }
        }
    });

    // --- V6 全螢幕手機選單功能 ---
    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const menuCloseBtn = document.querySelector('.menu-close-btn');
    const mobileMenuPanel = document.querySelector('.mobile-menu-panel');
    const bodyElement = document.querySelector('body');

    function openMenu() {
        if (mobileMenuPanel) mobileMenuPanel.classList.add('active');
        if (headerElement) {
            setTimeout(() => {
                headerElement.classList.add('menu-open');
            }, 100);
        }
        if (bodyElement) bodyElement.classList.add('no-scroll');
    }

    function closeMenu() {
        if (mobileMenuPanel) mobileMenuPanel.classList.remove('active');
        if (headerElement) {
            headerElement.classList.remove('menu-open');
            if (window.scrollY > 50) {
                headerElement.classList.add('scrolled');
            }
        }
        if (bodyElement) bodyElement.classList.remove('no-scroll');
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', openMenu);
    }
    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', closeMenu);
    }
    if (mobileMenuPanel) {
        mobileMenuPanel.querySelectorAll('a').forEach(navLink => {
            navLink.addEventListener('click', closeMenu);
        });
    }

    // --- verygoodshop Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ✨ 修改 updateCartCount 函式以包含新的手機版購物車圖示計數器
    const updateCartCount = () => {
        const cartCountDesktop = document.getElementById('cart-count');
        const cartCountMobilePanel = document.getElementById('cart-count-mobile'); // 側滑選單中的(已移除)
        const cartCountMobileIcon = document.getElementById('mobile-cart-count'); // 新增的圖示計數器
        
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        if (cartCountDesktop) {
            cartCountDesktop.textContent = totalItems;
        }
        if (cartCountMobilePanel) { // 保持檢查，以防萬一
            cartCountMobilePanel.textContent = totalItems;
        }
        if (cartCountMobileIcon) {
            cartCountMobileIcon.textContent = totalItems;
            // 如果數量為0，可以選擇隱藏計數器，看起來更簡潔
            cartCountMobileIcon.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    };

    const showAlert = (message) => {
        const alertBox = document.createElement('div');
        alertBox.className = 'alert';
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        setTimeout(() => alertBox.classList.add('show'), 10);
        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.addEventListener('transitionend', () => alertBox.remove());
        }, 3000);
    };

    const addToCart = (product) => {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showAlert(`${product.name} 已加入購物車!`);
    };
    
    const calculateTotalPrice = () => {
        return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productElement = button.closest('.product-item');
            const product = {
                id: productElement.dataset.id,
                name: productElement.dataset.name,
                price: parseFloat(productElement.dataset.price),
                image: productElement.querySelector('img').src
            };
            addToCart(product);
        });
    });

    // --- Cart Page Specific Logic ---
    const renderCartItems = () => {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>您的購物車目前是空的。</p>';
    } else {
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // ✨ 這段更新後的 HTML 結構會與您修改好的 CSS 完美搭配
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p class="item-total-price">$${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase" data-index="${index}">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
    updateCartPageTotals();
    addCartEventListeners();
};

    const updateCartPageTotals = () => {
        const totalPriceEl = document.getElementById('total-price');
        const checkoutBtn = document.getElementById('checkout');
        if (!totalPriceEl) return;
        
        const total = calculateTotalPrice();
        totalPriceEl.textContent = `總金額：$${total.toLocaleString()}`;

        if (checkoutBtn) {
            checkoutBtn.disabled = cart.length === 0;
        }
    };

    const addCartEventListeners = () => {
        document.querySelectorAll('.increase').forEach(btn => {
            btn.onclick = () => changeQuantity(btn.dataset.index, 1);
        });
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.onclick = () => changeQuantity(btn.dataset.index, -1);
        });
        
        const clearCartBtn = document.getElementById('clear-cart');
        if(clearCartBtn) {
            clearCartBtn.onclick = () => {
                if (confirm('確定要清空購物車嗎？')) {
                    cart = [];
                    saveAndRerenderCart();
                }
            };
        }
    };

    const changeQuantity = (index, delta) => {
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveAndRerenderCart();
        }
    };

    const saveAndRerenderCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); // 確保在購物車頁面重新渲染
    };
    
    // --- Checkout Page Logic ---
    const initCheckoutPage = () => {
        const checkoutForm = document.getElementById('checkout-form');
        if (!checkoutForm) return;

        if (cart.length === 0) {
            alert('購物車是空的，將返回首頁。');
            window.location.href = '../';
            return;
        }

        renderOrderSummary();
        initApplePay(); // 初始化 Apple Pay 按鈕

        const creditCardInfo = document.querySelector('.credit-card-info');
        const creditCardInputs = creditCardInfo ? creditCardInfo.querySelectorAll('input') : [];
        const paymentMethods = document.querySelectorAll('input[name="payment"]');

        const toggleCreditCardInfo = () => {
            if (!creditCardInfo) return;
            const creditCardRadio = document.getElementById('credit-card');
            const isCreditCard = creditCardRadio ? creditCardRadio.checked : false;
            creditCardInfo.classList.toggle('hidden', !isCreditCard);
            creditCardInputs.forEach(input => input.required = isCreditCard);
        };

        paymentMethods.forEach(method => {
            method.addEventListener('change', toggleCreditCardInfo);
        });

        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // 清空購物車並跳轉
            cart = [];
            saveAndRerenderCart();
            window.location.href = '../checkout_success/';
        });

        toggleCreditCardInfo(); // Initial check
    };
    
    const renderOrderSummary = () => {
        const summaryListEl = document.getElementById('summary-items-list');
        const subtotalEl = document.getElementById('summary-subtotal');
        const grandTotalEl = document.getElementById('summary-grand-total');

        if (!summaryListEl) return;
        
        summaryListEl.innerHTML = '';
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="summary-item-img">
                <div class="summary-item-info">
                    <span class="summary-item-name">${item.name}</span>
                    <span class="summary-item-qty">數量: ${item.quantity}</span>
                </div>
                <span class="summary-item-price">$${(item.price * item.quantity).toLocaleString()}</span>
            `;
            summaryListEl.appendChild(itemEl);
        });

        const total = calculateTotalPrice();
        if(subtotalEl) subtotalEl.textContent = `$${total.toLocaleString()}`;
        if(grandTotalEl) grandTotalEl.textContent = `$${total.toLocaleString()}`;
    };

    // --- Page Initializations ---
    updateCartCount(); // 確保所有頁面一開始都更新購物車數量

    if (document.body.id === 'page-cart') {
        renderCartItems();
    }
    if (document.body.id === 'page-checkout') {
        initCheckoutPage();
    }
    
    const checkoutBtnOnCartPage = document.getElementById('checkout'); // 特指購物車頁面的結帳按鈕
    if (checkoutBtnOnCartPage && document.body.id === 'page-cart') {
        checkoutBtnOnCartPage.addEventListener('click', () => {
            if(cart.length > 0) {
                 window.location.href = '../checkout/';
            }
        });
    }
    
    // --- Index Page Slider ---
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroSlideshow = hero.querySelector('.hero-slideshow');
        if(heroSlideshow) {
            const slides = heroSlideshow.querySelectorAll('.hero-slide');
            const prevButton = hero.querySelector('.prev-slide');
            const nextButton = hero.querySelector('.next-slide');
            let currentSlide = 0;
            let intervalId;

            const showSlide = (index) => {
                slides.forEach(slide => slide.classList.remove('active'));
                currentSlide = (index % slides.length + slides.length) % slides.length; // 確保索引在範圍內
                slides[currentSlide].classList.add('active');
            };

            const startSlideshow = () => {
                clearInterval(intervalId);
                intervalId = setInterval(() => {
                    showSlide(currentSlide + 1);
                }, 5000);
            };

            if(slides.length > 1) {
                showSlide(currentSlide); // Initial active slide
                startSlideshow();

                if (prevButton && nextButton) {
                    prevButton.addEventListener('click', () => {
                        showSlide(currentSlide - 1);
                        startSlideshow(); // 重置計時器
                    });

                    nextButton.addEventListener('click', () => {
                        showSlide(currentSlide + 1);
                        startSlideshow(); // 重置計時器
                    });
                }
            } else { 
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
            }
        }
    }

    // --- 全域的快速付款處理函式 ---
    function handleExpressPayment() {
        // 檢查全域的 cart 變數
        if (cart.length > 0) {
            // 1. 將全域 cart 變數清空
            cart = [];
            // 2. 呼叫統一的函式來儲存變更 (這會清空 localStorage) 並更新UI
            saveAndRerenderCart();
            // 3. 執行跳轉
            window.location.href = '../checkout_success/';
        } else {
            // 這種情況通常不會發生，因為按鈕在購物車為空時應無法觸發
            showAlert('您的購物車是空的！');
        }
    }

    // --- 將全域函式附加到 window 物件，以供 Google Pay 的 onload 回呼使用 ---
    window.handleExpressPayment = handleExpressPayment;
});


// --- Global Functions for Payment APIs (called via script onload) ---
function onGooglePayLoaded() {
  const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
  };

  const allowedPaymentMethods = [{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
      allowedCardNetworks: ["MASTERCARD", "VISA", "JCB", "AMEX", "DISCOVER"]
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId'
      }
    }
  }];

  const isReadyToPayRequest = Object.assign({}, baseRequest);
  isReadyToPayRequest.allowedPaymentMethods = allowedPaymentMethods;
  
  paymentsClient.isReadyToPay(isReadyToPayRequest)
    .then(function(response) {
      if (response.result) {
        const button = paymentsClient.createButton({
          buttonColor: 'default',
          buttonType: 'buy',
          buttonRadius: 8,
          onClick: () => {
              const cart = JSON.parse(localStorage.getItem('cart')) || [];
              if (cart.length > 0) {
                  localStorage.removeItem('cart');
                  // 在這裡也要確保 DOMContentLoaded 中的 updateCartCount 能被呼叫或手動更新
                  const cartCountDesktop = document.getElementById('cart-count');
                  const cartCountMobile = document.getElementById('cart-count-mobile');
                  if(cartCountDesktop) cartCountDesktop.textContent = '0';
                  if(cartCountMobile) cartCountMobile.textContent = '0';

                  window.location.href = '../checkout_success/';
              } else {
                  alert('您的購物車是空的！');
              }
          }
        });
        const container = document.getElementById('google-pay-button-container');
        if (container) {
          container.appendChild(button);
        }
      }
    })
    .catch(function(err) {
      console.error("Error checking readiness to pay for Google Pay", err);
    });
}

const initApplePay = () => {
    const container = document.getElementById('apple-pay-button-container');
    
    if (window.ApplePaySession) {
        console.log("偵測到 Safari，正在建立 Apple Pay 按鈕 (示範模式)");
        
        if (container) {
            const button = document.createElement('button');
            button.className = 'apple-pay-button apple-pay-button-black';
            button.setAttribute('aria-label', 'Buy with Apple Pay');
            button.style.cursor = 'pointer';
            
            button.onclick = () => {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length > 0) {
                    localStorage.removeItem('cart');
                     // 在這裡也要確保 DOMContentLoaded 中的 updateCartCount 能被呼叫或手動更新
                    const cartCountDesktop = document.getElementById('cart-count');
                    const cartCountMobile = document.getElementById('cart-count-mobile');
                    if(cartCountDesktop) cartCountDesktop.textContent = '0';
                    if(cartCountMobile) cartCountMobile.textContent = '0';

                    window.location.href = '../checkout_success/';
                } else {
                    alert('您的購物車是空的！');
                }
            };
            
            container.appendChild(button);
            container.style.display = 'flex'; // 確保容器是可見的
        }
    } else {
        if(container) container.style.display = 'none';
    }
};