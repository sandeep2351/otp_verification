import jwt from "jsonwebtoken";
import env from "../config.js";

export default async function Auth(req, res, next) {
  try {
    // Check if the Authorization header is provided
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header not found" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization token not provided" });
    }

    // Verify the JWT token
    const decodedToken = await jwt.verify(token, env.JWT_SECRET);

    // Attach the decoded user details to the request object
    req.user = decodedToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Catch any errors related to JWT verification
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(500).json({ error: "Authentication failed" });
    }
  }
}


export function localvariables(req,res,next){
  req.app.locals={
    OTP:null,
    resetSession:false
  }
  next()
}
