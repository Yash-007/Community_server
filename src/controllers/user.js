import { User } from '../models/user.js';
import Validator from 'validatorjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUp= async(req, res)=>{
  try {
    const { name, email, password } = req.body;
 
    // validate the input 
    Validator.register('strong_password', (value, requirement, attribute) => {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return value.match(strongPasswordRegex) !== null;
  },); 

    const rules = {
      name: 'required|min:2',
      email: 'required|email',
      password: 'required|strong_password|min:8',
    };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
      let errors= [];
      if((validation.errors.all()).name){
       errors.push({
          param: "name",
          message: "Name should be at least 2 characters.",
          code: "INVALID_INPUT"
       })
      }

      if((validation.errors.all()).email){
        errors.push({
           param: "email",
           messsage:"Please proive a valid email address.",
           code: "INVALID_INPUT",
        })
       }
  
      if((validation.errors.all()).password){
        errors.push({
           param: "password",
           message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
           code: "INVALID_INPUT"
        })
       }
  
      return res.status(400).json({
        status: false,
        errors,
      });
    }
  
    // check if user already exists 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status:false,
        errors: [
          {
          param: "email",
          messsage:"User with this email address already exists.",
          code: "RESOURCE_EXISTS",
         }
       ]
    });
  }
   
    // create new user 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    user.__v=undefined;
    user.password= undefined;
  
    const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  
    return res.cookie("access_token", accessToken, {httpOnly: true}).status(201).json({
      status:true,
      content: {
        data: user,
        meta: {
          access_token: accessToken
        }
      } 
    });
  } catch (error) {
    return res.status(500).json({
      status:false,
      error: "Internal Server Error",
    })
  }
}


export const signIn= async(req, res)=>{
  try {
    const { email, password } = req.body;
    
    // validate the input 
    const rules = {
      email: 'required|email',
    };
    const validation = new Validator(req.body, rules);
    if(validation.fails()){
      return res.status(400).json({
        status:false,
        errors: [
          {
          param: "email",
          messsage:"Please proive a valid email address.",
          code: "INVALID_INPUT",
         }
       ]
    }); 
   } 
    // matching password 
    const user = await User.findOne({ email });
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!user || !passwordMatch) {
      return res.status(400).json({
        status:false,
        errors: [
          {
          param: "password",
          messsage:"The credentials you provided are invalid.",
          code: "INVALID_CREDENTIALS",
         }
       ]
    }); 
  }
  
  
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    user.__v=undefined;
    user.password= undefined;
    return res.cookie("access_token", accessToken, {httpOnly: true}).status(200).json({
      status:true,
      content: {
        data: user,
        meta: {
          access_token: accessToken
        }
      } 
    });   
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:false,
      error: "Internal Server Error",
    })
  }
}


export const getMe= async(req, res)=>{
  const user = req.user.toObject();
  user.password= undefined;
  user.__v = undefined;

  return res.status(200).json({
    status:true,
    content: {
      data: user,
    } 
  });  
}
