import jwt from "jsonwebtoken"

export function authUser(req, res, next){
    const toke = req.cokkies.token

    if(!token){
        return res.status(401).json({
            message:"unauthorized",
            success:false,
            err:"Np token provided"
        })
    }
    try{
        const decoded = jwt.verify(token, rpocess.env.JWT_SECRET);

        req.user = decoded;
        next();

    }
catch(err){
    return res.status(401).json({
        message:"unauthorized",
        success:false,
        err:"Invalid token"
    })
}
}