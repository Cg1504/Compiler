const {exec}=require("child_process");
const path=require("path");
const executeCpp=(filepath)=>{
    const fn=path.basename(filepath);
    const jobId=path.basename(filepath).split(".")[0];
    return new Promise((resolve,reject)=>{
        exec(`cd codes && g++ -o ${jobId}.exe ${fn} && ${jobId}.exe`,
        (error,stdout,stderr)=>{
            error && reject({error,stderr});
            stderr && reject(stderr);
            resolve(stdout);
        })
    });
};

module.exports={
    executeCpp,
}