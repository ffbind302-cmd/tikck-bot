const express = require("express");
const path = require("path");

const app = express();

app.use(
    "/transcripts",
    express.static(path.join(__dirname, "transcripts"))
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Web Server Running On Port ${PORT}`);
});