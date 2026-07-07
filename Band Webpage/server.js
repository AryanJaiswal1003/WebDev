if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripe = require('stripe')(stripeSecretKey)

const express = require('express')
const app = express()
const fs = require('fs')

app.set('view engine', 'ejs')
app.use(express.static('Simple Band Webpage'))
app.use(express.json())

app.get('/store', function (req, res) {
    fs.readFile('items.json', function (error, data) {
        if (error) {
            res.status(500).end()
        } else {
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data),
                success: req.query.success === 'true',
                canceled: req.query.canceled === 'true'
            })
        }
    })
})

app.post('/create-checkout-session', async function (req, res) {
    try {
        const cartItems = req.body.items
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' })
        }

        const itemsJson = JSON.parse(fs.readFileSync('items.json'))
        const availableItems = [...itemsJson.music, ...itemsJson.merch]
        const lineItems = []

        for (const cartItem of cartItems) {
            const id = Number(cartItem.id)
            const quantity = Number(cartItem.quantity)

            if (!id || !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid cart item quantity or ID.' })
            }

            const product = availableItems.find((item) => item.id === id)
            if (!product) {
                return res.status(400).json({ error: 'Invalid cart item.' })
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name
                    },
                    unit_amount: product.price
                },
                quantity: quantity
            })
        }

        if (lineItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty or invalid.' })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${req.protocol}://${req.get('host')}/store?success=true`,
            cancel_url: `${req.protocol}://${req.get('host')}/store?canceled=true`
        })

        res.json({ sessionId: session.id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

app.listen(3000, () => {
    console.log('Server listening on port 3000')
})

