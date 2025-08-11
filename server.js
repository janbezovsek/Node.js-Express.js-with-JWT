const dotenv = require('dotenv')
dotenv.config({path: "./.env"})
const mongoose = require('mongoose')
const app = require("./src/app")

//Database connection
async function dbConnect() {
    mongoose.connect(process.env.DB_URL, {
    //   these are options to ensure that the connection is done properly
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
})
.catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
    process.exit()
})
}

//Calling db connection
dbConnect()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running on port " + `${PORT}`)
})