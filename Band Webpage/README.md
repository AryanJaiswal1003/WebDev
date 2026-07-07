# One Direction Band Webpage

This project is a simple band-themed website for One Direction that combines static HTML pages with an Express-powered store and Stripe checkout flow. It includes a home page, an about page, a merchandise/music store, and a shopping cart experience for purchasing items online.

## Features

- A polished landing page for the band
- An About page with band history and milestones
- A dynamic store page that renders products from JSON data
- A shopping cart with quantity updates and removal actions
- Stripe Checkout integration for secure payments
- Server-side rendering with EJS templates

## Project Structure

```text
Band Webpage/
├── public/
│   ├── about.html
│   ├── index.html
│   ├── store.js
│   └── style.css
├── views/
│   └── store.ejs
├── Images/
├── items.json
├── server.js
├── init.js
├── package.json
└── README.md
```

## Main Files

- public/index.html — Home page for the website
- public/about.html — About page with background information about the band
- views/store.ejs — Store view rendered by the server using EJS
- public/store.js — Front-end cart and checkout logic
- server.js — Express server, routes, and Stripe integration
- items.json — Product catalog for music and merchandise
- package.json — Dependencies and project metadata
- init.js — Helper script for initializing the package configuration

## Technologies Used

- Node.js
- Express
- EJS
- Stripe Checkout
- HTML, CSS, and JavaScript
- dotenv for environment variables

## Installation

If dependencies have not been installed yet, run:

```bash
cd "Band Webpage"
npm install
```

If the project is missing a package configuration, you can initialize it with:

```bash
node init.js
```

## Environment Variables

Create a .env file in the project root with your Stripe credentials:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Running the Application

Start the server with:

```bash
node server.js
```

Then open your browser and visit:

```text
http://localhost:3000/store
```

## Application Flow

### Store Page

The store route reads product data from items.json and renders it using views/store.ejs.

### Checkout Process

When a user clicks Purchase, the browser sends the cart items to the server. The server creates a Stripe Checkout session and returns a session ID to the client.

```js
app.post('/create-checkout-session', async function (req, res) {
    try {
        const cartItems = req.body.items
        // Validate items and build Stripe line items
        // Create checkout session using Stripe
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})
```

### Cart Behavior

The client-side JavaScript in public/store.js handles adding products, updating quantities, removing items, and calculating the total.

```js
function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0

    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total += price * quantity
    }

    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}
```

## Sample Product Data

The shop catalog is defined in items.json and currently includes music albums and merchandise.

```json
{
  "music": [
    { "id": 1, "name": "Album 1", "price": 1499, "imgName": "Album 1.png" }
  ],
  "merch": [
    { "id": 5, "name": "T-Shirt", "price": 1999, "imgName": "Shirt.png" }
  ]
}
```

## Notes

- The app is designed as a small demo project for learning web development concepts.
- Stripe must be configured with valid keys for checkout to work.
- The site uses static assets from the public folder and image assets from the Images folder.
