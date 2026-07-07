// Check if the document is still loading
// If yes, wait for DOMContentLoaded before running `ready()`
// If not, run `ready()` immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

// Main setup function: attaches event listeners to buttons and inputs
function ready() {
    // Attach "Remove" button functionality to all existing cart items
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    // Attach "Quantity change" functionality to all existing cart inputs
    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    // Attach "Add to Cart" button functionality to all shop items
    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    // Attach "Purchase" button functionality
    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

var stripe = Stripe(stripePublicKey)

function purchaseClicked() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')

    if (cartRows.length === 0) {
        alert('Your cart is empty. Add items before checking out.')
        return
    }

    var items = []
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var quantity = Number(quantityElement.value)
        var id = cartRow.dataset.itemId

        if (!id || !Number.isInteger(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity for every cart item.')
            return
        }

        items.push({
            id: id,
            quantity: quantity
        })
    }

    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: items })
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            if (data.sessionId) {
                return stripe.redirectToCheckout({ sessionId: data.sessionId })
            }
            throw new Error(data.error || 'Unable to create checkout session.')
        })
        .catch(function (error) {
            console.error(error)
            alert('Unable to start checkout: ' + error.message)
        })
}

// Function: removes an item from the cart when "Remove" button is clicked
function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

// Function: handles quantity changes
// If user enters 0 or less, remove the item entirely
function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.parentElement.parentElement.remove()
    }
    updateCartTotal()
}

// Function: triggered when "Add to Cart" button is clicked
// Collects item details and calls addItemToCart
function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id = shopItem.dataset.itemId

    addItemToCart(title, price, imageSrc, id)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, id) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]

    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText === title) {
            alert('This item is already added to the cart')
            return
        }
    }

    var cartRowContents = `
        <div class="cart-item cart-column">
            <img src="${imageSrc}" width="100" height="100" class="cart-item-image">
            <span class="cart-item-title">${title}</span>
        </div>

        <span class="cart-price cart-column">${price}</span>

        <div class="cart-quantity cart-column">
            <input type="number" value="1" class="cart-quantity-input">
            <button role="button" class="btn btn-danger">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)

    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

// Function: updates the cart total whenever items are added/removed/changed
function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0

    // Loop through each cart row and calculate total
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total += price * quantity
    }

    // Round to 2 decimal places for currency formatting
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}