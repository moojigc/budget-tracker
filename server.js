const express = require("express"),
	logger = require("morgan"),
	mongoose = require("mongoose"),
	compression = require("compression"),
	PORT = process.env.PORT || 3500,
	app = express();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: false
});

app.use(logger("dev"))
	.use(compression())
	.use(express.urlencoded({ extended: true }))
	.use(express.json())
	.use(express.static("public"))
	.use(require("./routes/api.js"))
	.listen(PORT, () => {
		console.log(`App running on port ${PORT}!`);
	});
