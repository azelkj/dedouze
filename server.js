const express = require('express');
const app = express();

// Remplplace par ta vraie clé secrète Stripe (à trouver sur ton tableau de bord Stripe)
const stripe = require('stripe')('sk_test_votre_cle_secrete_ici');

app.use(express.json());
app.use(express.static('.')); // Permet de lire le fichier index.html

app.post('/creer-session-paiement', async (req, res) => {
    const { panier } = req.body;

    // On transforme ton panier au format demandé par Stripe
    const line_items = Object.keys(panier).map(nom => {
        const item = panier[nom];
        return {
            price_data: {
                currency: 'eur',
                product_data: { name: nom },
                unit_amount: item.prix * 100, // Stripe calcule en centimes (15€ = 1500)
            },
            quantity: item.quantite,
        };
    });

    try {
        // Création de la session sécurisée chez Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // URL où renvoyer le client après le paiement
            success_url: `${req.headers.origin}/?succes=true`,
            cancel_url: `${req.headers.origin}/?annulation=true`,
        });

        // On renvoie l'URL de paiement sécurisée au format JSON
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
