require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
	rateLimit({
		windowMs: 1 * 60 * 1000,
		max: 100,
	})
);

const urlDBFile = require(process.env.URL_DB);

const generateId = () => {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
};

app.get("/api/add", (req, res) => {
	const { originalUrl, expirationTime } = req.query;

	if (originalUrl === undefined || expirationTime === undefined) {
		return res.status(400).json({
			error: "Missing parameters",
		});
	}
	if (!expirationTime.match(/^([1-9]|[01][0-9]|2[0-3]):([0-5][0-9])$/)) {
		return res.status(400).json({
			error: "Invalid expiration time",
		});
	}
	if (!originalUrl.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/)) {
		return res.status(400).json({
			error: "Invalid original url",
		});
	}
	// if (!shortUrlId.match(/^[a-zA-Z0-9]{6}$/)) {
	// 	return res.status(400).json({
	// 		error: "Invalid short url id",
	// 	});
	// }

	let shortUrlId = generateId();
	while (true) {
		if (!urlDBFile.find(url => url.shortUrlId === shortUrlId) !== undefined) break;
		shortUrlId = generateId();
	}

	const date = new Date();
	urlDBFile.push({ originalUrl: originalUrl, shortUrlId: shortUrlId, expirationTime: `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()} ${expirationTime}` });
	fs.writeFileSync(process.env.URL_DB, JSON.stringify(urlDBFile, null, 4), "utf8");

	res.json({ originalUrl: originalUrl, shortUrlId: shortUrlId, expirationTime: `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()} ${expirationTime}` });
});

app.get("/api/del", (req, res) => {
	const { shortUrlId } = req.query;

	if (shortUrlId === undefined) {
		return res.status(400).json({
			error: "Missing parameters",
		});
	}

	const data = urlDBFile.filter(item => item.shortUrlId !== shortUrlId);
	if (data.length === urlDBFile.length) {
		return res.status(400).json({
			error: "Short url not found",
		});
	}

	urlDBFile.forEach((item, index, data) => {
		if (item.shortUrlId === shortUrlId) {
			data.splice(index, 1);
		}
	});
	fs.writeFileSync(process.env.URL_DB, JSON.stringify(urlDBFile, null, 4), "utf8");

	res.send("ok");
});

app.get("/api/info", (req, res) => {
	res.json(urlDBFile);
});

app.get("/:url", (req, res) => {
	const { url } = req.params;

	const data = urlDBFile.find(item => item.shortUrlId === url);
	if (data === undefined) {
		return res.status(400).json({
			error: "Short url not found",
		});
	}
	if (data.expirationTime !== "never") {
		const date = new Date();
		const expirationTime = new Date(data.expirationTime);
		if (expirationTime < date) {
			return res.status(400).json({
				error: "Short url expired",
			});
		}
	}
	res.redirect(data.originalUrl);
});

// app.use("/", async (req, res) => {
// 	res.json(JSON.parse(urlDB));
// });

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
