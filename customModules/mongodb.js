import mongoose from 'mongoose';

export const mongoConnect=async function(){

    try{
        let connectionRes= await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected...")
            
    }catch(err){
        console.log(err);
    }

}



let eventSchema= new mongoose.Schema({
    _id: Number,
    eventName: {type:String, required: true},
    sDate: {type:Date, required: true},
    eDate: {type:Date},
    location: {type:String},
    members: {type: [String], required: true},
    estimated: [{
        estimatedPoint:{type:String},
        estimatedValue:{type:Number},
    }],
    story: {type: [String], required: true},
    shortDescription:{type:String},
    images:{type:[String]},
    imageMain:{type:String},
    thankingPerson:[{
        name:{type:String},
        image:{type:String},
    }]
    

})

let slidesShow=new mongoose.Schema({
    _id:{type:String},
    image:{type:String},
})

export let SlideShow=mongoose.model("SlideShow",slidesShow);

export let Event=mongoose.model("Event", eventSchema);
