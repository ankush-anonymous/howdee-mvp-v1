require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const generateRoute = require("./routes/imageGenerationRoutes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/image-generate", generateRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
