const Queue= require("bull");
const jobQueue=new Queue('job-queue');
const NUM_WORKERS = 15;
const {executeCpp}=require("./executeCpp");
const {executePy}=require("./executePy");
const Job=require("./models/Job");

jobQueue.process(NUM_WORKERS,async({data})=>{
    const {id: jobId} = data;
    const job =await Job.findById(jobId);
    if(job === undefined || job===null){
        throw Error("job not found");
    }
    // console.log("Fetched Job",job);
    try{
        // let output;
        job["startedAt"]=new Date();
        if(job.language==="cpp"){
        output=await executeCpp(job.filepath);
        }else{
        output=await executePy(job.filepath);
        }
        job["completedAt"]=new Date();
        job["status"]="success";
        job["output"]=output;
        await job.save();
    }catch(err){
        job["completedAt"]=new Date();
        job["status"]="error";
        job["output"]=JSON.stringify(err);
        await job.save();
    }

});

jobQueue.on('failed',(error)=>{
    console.log(error.data.id,'failed',error.failedReason);
});
const addJobToQueue=async(jobId)=>{
    await jobQueue.add({id : jobId});
};

module.exports={
    addJobToQueue,
};