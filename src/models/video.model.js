import mongoose from 'mongoose'
import mongooseAggregatePaginateV2 from 'mongoose-aggregate-paginate-v2'

const videSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    
    videoFile:{
        type:String,
        required:true
    }, 
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    views:{
        type:String,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

// adding the plugin before the compiling model
mongoose.plugin(mongooseAggregatePaginateV2)

export const Video = mongoose.model("Video", videSchema)