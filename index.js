import bodyParser from "body-parser"
import { configDotenv } from "dotenv"
configDotenv()
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import user_router from "./routes/user_route.js"
import admin_router from "./routes/admin_route.js"

const port = process.env.PORT
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

async function main(){
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected...✅");    
    }
    catch(error){
        console.log(error);
    }
}
main()


app.use('/api',user_router)
app.use('/api/admin',admin_router)

app.listen(port,(error) => {
    if(error){
        console.log("Error while listening to server...!");
    }
    else{
        console.log("Server is listening on http://localhost:" + port);
    }
})