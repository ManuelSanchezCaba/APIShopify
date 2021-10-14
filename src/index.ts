import express from 'express';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
require('dotenv').config();

const app = express();

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;

Shopify.Context.initialize({
	API_KEY,
	API_SECRET_KEY,
	SCOPES: [SCOPES],
	HOST_NAME: HOST,
	IS_EMBEDDED_APP: false,
	API_VERSION: ApiVersion.April21, // all supported versions are available, as well as "unstable" and "unversioned"
});

// the rest of the example code goes here
app.get('/login', async (req, res) => {
	let authRoute = await Shopify.Auth.beginAuth(req, res, SHOP, '/auth/callback', true);
	return res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
	try {
		await Shopify.Auth.validateAuthCallback(req, res, req.query as unknown as AuthQuery); // req.query must be cast to unkown and then AuthQuery in order to be accepted
	} catch (error) {
		console.error(error); // in practice these should be handled more gracefully
	}
	return res.redirect('/login'); // wherever you want your user to end up after OAuth completes
});

app.get('/products', async (req, res) => {
	// Load the current session to get the `accessToken`.
	const session = await Shopify.Utils.loadCurrentSession(req, res);
	console.log(session);
	// Create a new client for the specified shop.
	const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
	// Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
	const products = await client.get({
		path: 'products',
	});

	// return res.json(products);
});

app.listen(3000, () => {
	console.log('your app is now listening on port 3000');
});
