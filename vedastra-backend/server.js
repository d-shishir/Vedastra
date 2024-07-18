// server.js
const dotenv = require("dotenv");
dotenv.config();

console.log(process.env.MONGO_URI); // This should log your MongoDB URI

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
