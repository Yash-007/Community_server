import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
    try {
      console.log('abcd');
    
        // verify the token 
        const token =  req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                status: false,
                errors: [
                  {
                    message: "You need to sign in to proceed.",
                    code: "NOT_SIGNEDIN"
                  }
                ]
            })
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(400).json({
            status: false,
            errors: [
              {
                message: "You need to sign in to proceed.",
                code: "NOT_SIGNEDIN"
              }
            ]
        })    
    }
};

