const express= require('express');
const cors=require('cors');
const mongoose=require('mongoose');

const { generateFile }=require('./generateFile');
const {addJobToQueue}=require("./jobQueue");
const Job=require("./models/Job")

mongoose.connect("mongodb://localhost/compilerapp",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
},(err)=>{
    if(err){
        console.error(err);
        process.exit(1);
    }
    console.log("Successfully connected to mongodb databbase!");
});
const app=express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.get('/status',async (req,res)=>{

    const jobId=req.query.id;
    if(jobId==undefined){
        return res.status(400).json({sucess:false,error:"missing id querry param"});
    }
    try{
        const job =await Job.findById(jobId);
        if(job === undefined){
            return res.status(404).json({success:false,error:"invalid job id"});
        }
        return res.status(200).json({success:true,job});
    }catch(err){
        return res.status(400).json({sucess: false,error:JSON.stringify(err)});
    }
});
app.post("/run",async (req,res)=>{
    const {code,language="cpp"}=req.body;
    if(code===undefined){
        return res.status(400).json({success:false,error:"Empty code body"});
    }
    let job;
    try{
        //need to generate a c++ file with content from the request
        const filepath= await generateFile(language,code);

        job=await new Job({language,filepath}).save();
        const jobId=job["_id"];
        addJobToQueue(jobId);

        res.status(201).json({success:true,jobId});
        //we need to run file and send the response
    }catch(err){
        return res.status(500).json({success: false,err: JSON.stringify(err)});
    }
});
app.listen(5000,()=>{
    console.log('Listening on port 5000');
});