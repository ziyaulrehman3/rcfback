'use strict';

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import {fileURLToPath} from 'url'
import jwt from 'jsonwebtoken'
import upload from './customModules/multerConfig.js'
import {mongoConnect,Event,SlideShow} from './customModules/mongodb.js'


import {TransporterSend} from './customModules/nodemailer.js'
import jwtMiddleware from './customModules/jwtMiddleware.js'

const app=express();

dotenv.config();

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use("/uploads", express.static("uploads"));

//URL Start

 const __filename=fileURLToPath(import.meta.url);
 const __dirname=path.dirname(__filename);

//URL End


app.get("/",(req,res)=>{
    res.send("Server is Running")
})



app.post('/login',(req,res)=>{

    const {username,password}=req.body;
    const USERNAME=process.env.USERNAME1;
    const PASSWORD=process.env.PASSWORD;

  
    const payload={
        username,
    }

    const options={
        expiresIn:'1h',
        algorithm:'HS256'
    }

    if(username===USERNAME && password===PASSWORD){

        res.send(jwt.sign(payload,process.env.SEACREATE_KEY,options))
   
    }else{
        res.status(401).send({message:"Invalid Username or Password"})
    }
     

})

//Slide Show Start

app.get('/getSlideShow',async (req,res)=>{

    try{
        mongoConnect();
        const result=await SlideShow.find();
        res.status(200).send(result)
    }catch(err){
        console.log(err)
        res.status(400).json({message:"Some error with Database"});
    }

})

app.post('/addSlideShow',jwtMiddleware,upload.single('file'),async (req,res)=>{


    if(!req.file){
        res.status(400).json({message:"No Image send by User End"});
        return ;
    }

    try{
        const newSlide=new SlideShow({
            image:req.file.filename,
        })


        mongoConnect();
        const result=await newSlide.save();

        res.status(200).json({message:"Slide add Succesfully"})
    }catch(err){
        console.log(err);

        res.status(400).json({message:"Slide add Unsuccesfully"});
    }
        
})

app.delete('/removeSlideShow/:filename',jwtMiddleware,async (req,res)=>{

    const filename=req.params.filename;
    const filePath=path.join(__dirname,'uploads',filename);

    try{

        await fs.unlink(filePath,(err)=>{
            
            if(err){
                res.status(400).json({message:"Slide not deleted"})
            }
        })

        mongoConnect();

        await SlideShow.findOneAndDelete({image:filename})

        res.status(200).json({message:"Slide delete Succesfully"})

    }catch(err){
        console.log(err)
    
        res.status(400).json({message:"There is error with database"})
    }

    
})

//Slide Show End


//send Message Start

app.post('/sendmsg',(req,res)=>{

    const {name,mobile,email,msg}=req.body;

    TransporterSend(name,email,mobile,msg)?res.status(200).json({message:"Message send Succesfully"}):res.status(400).json({message:"Message can't send"})

})

//Send Message End


//Control Pennel APIs Start

app.post('/addEvent',jwtMiddleware,async (req,res)=>{

    const {eventName,shortDescription,story,sDate,eDate,location,members,estimated}=req.body;

    let date=new Date();

    let event=new Event({
    
        _id: Date.now(),
        eventName,
        sDate,
        eDate,
        location,
        members,
        estimated,
        story,
        shortDescription,
    })

    mongoConnect();
    


          try{
            
            await event.save();
            res.status(200).json({eventId:event._id})


          }catch(err){

            res.status(401).json({message:"Event Added Unsuccessfully"})

            console.log(err);
          }
    
})

app.put('/eventUpdate/:_id',jwtMiddleware,async (req,res)=>{

    try{
        mongoConnect();

        const result=await Event.findByIdAndUpdate(req.params._id,
            req.body,
            {new:true,overwrite:true},
        )

        res.status(200).json(result);
        
    }catch(err){

        res.status(400)

        console.log(err);
    }
})

app.post('/addMainImage/:_id',jwtMiddleware,upload.single('file'),async (req,res)=>{

       if(!req.file){
        res.status(400).send({message:"Image not found"})

       }else{

            try{
                mongoConnect();

                await Event.findOneAndUpdate({_id:req.params._id},{imageMain:req.file.filename})
                
                res.status(200).json({message:"Image Update Succesfully"})
    
            }catch(err){
                res.status(401).json({message:"Image not Upload"})
    
            }
       }

})

app.post('/addThankingPerson/:_id',jwtMiddleware,upload.single('file'),async (req,res)=>{


    if(!req.file){
        res.status(400).send({message:"Image not found"})

       }else{

            try{
                mongoConnect();

                await Event.findOneAndUpdate(
                    {_id:req.params._id},
                    {$push:{thankingPerson:{name:req.body.name,image:req.file.filename}}},
                )
                
                res.status(200).json({message:"Image Update Succesfully"})
    
            }catch(err){
                res.status(401).json({message:"Image not Upload"})
                console.log(err)
    
            }
       }
})



app.post('/addEventImages/:_id',jwtMiddleware,upload.single('file'),async (req,res)=>{

    if(!req.file){
        res.status(400).send({message:"Image not found"})

       }else{

            try{
                mongoConnect();

                await Event.findOneAndUpdate(
                    {_id:req.params._id},
                    {$push:{images:req.file.filename}},
                )
                
                res.status(200).json({message:"Image Update Succesfully"})
    
            }catch(err){
                res.status(401).json({message:"Image not Upload"})
                console.log(err)
    
            }
       }
    
})

//Controll Penal APIs End

//Open Get APIs Start

app.get('/getAllEvents',async (req,res)=>{


    try{
        mongoConnect();
        const result=await Event.find()
        res.status(200).json(result)
    }catch(err){
        res.status(400);
        console.log(err)
    }
})

app.get('/getEvent/:eventId',async (req,res)=>{

    try{
        mongoConnect();
        const result=await Event.findOne({_id:req.params.eventId})

        res.status(200).json(result);

    }catch(err){
        res.status(400);

        console.log(err)
    }
})

app.get('/getLatestEvent',async (req,res)=>{

    try{
        mongoConnect();
        const result=await Event.findOne().sort({_id:-1})
        res.status(200).json(result)
    }catch(err){

        res.status(400)

        console.log(err);
    }
})


app.listen(process.env.PORT,()=>{
    console.log("Server is Running..")
    console.log("Raah to Cure Foundation Trust")
    console.log("Now live on Localhost 3000")
})