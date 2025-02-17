
import jwt from 'jsonwebtoken'

export default function jwtMiddleware(req,res,next){

    const token=req.headers['authorization'];

    if(!token){
        return res.status(403).json({message:"No token Provided"})
    }

    jwt.verify(token.split(" ")[1],process.env.SEACREATE_KEY,(err,user)=>{

        if(err){
            return res.status(403).json({message:"Invalid Token"})
        }

        req.user=user;
        next();
    });
}
