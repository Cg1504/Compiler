const {exec}=require("child_process");
const path=require("path");
const executePy=(filepath)=>{
    const fn=path.basename(filepath);
    return new Promise((resolve,reject)=>{
        exec(`cd codes && python ${fn}`,
        (error,stdout,stderr)=>{
            error && reject({error,stderr});
            stderr && reject(stderr);
            resolve(stdout);
        })
    });
};

module.exports={
    executePy,
}