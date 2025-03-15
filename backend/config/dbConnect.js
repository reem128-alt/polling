const mongoose=require("mongoose")

const dbConnect=async()=>{
    try{
        const connection=await mongoose.connect(`${process.env.MONGODB_URL}`,{
            dbName:"poll"
        })
        console.log(`mongo connected ${connection}`)
    }
    catch(error){
        console.log(`error is ${error.message}`)
        process.exit(0)  
    }
}

module.exports = dbConnect