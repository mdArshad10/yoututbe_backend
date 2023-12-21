import mongoose from 'mongoose'
import { DatabaseName,mongoURL } from '../constants.js'
import colors from 'colors'

const connectionDB = async ()=>{
    try {
       const connectionInstance =await mongoose.connect(`${mongoURL}/${DatabaseName}`)
       console.log(`the connection at ${connectionInstance.connection.port}`.bgGreen);
       
    } catch (error) {
        console.error("Error: ",error);
        process.exit(1)
    }
}
export default connectionDB;