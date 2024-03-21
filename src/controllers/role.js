import { Role } from '../models/role.js';
import Validator from 'validatorjs';


export const createRole= async(req, res)=>{
  try {
    const { name } = req.body;
    let role = await Role.findOne({name});
    
    // check if role already exits 
    if(role){
    return res.status(400).json({
      status:false,
       error: "This role already exits"
     })
    }
 
    // validate the input 
   const rules = {
     name: 'required|min:2',
   };
   const validation = new Validator(req.body, rules);
   if (validation.fails()) {
     return res.status(400).json({
      status:false, 
      errors: [
        {
           param: "name",
           message: "Name should be at least 2 characters.",
           code: "INVALID_INPUT"
        }
      ] });
   }
 
    role = new Role({
     name
   });
   await role.save();
 
   role.__v=undefined;
 
   return res.status(200).json({
    status:true,
    content: {
    data: role
   }}); 

  } catch (error) {
   return res.status(500).json({
      status:false,
      error: "Internal Server Error",
    })
  }
}



export const getAllRole= async(req, res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1)*limit;

    const total = await Role.countDocuments();
  
    const pages = Math.ceil(total / limit);
  
    const roles = await Role.find({},{__v:0})
      .skip(skip)
      .limit(limit);
       
     const meta= {
        total,
        pages,
        page,
      }
   return res.status(200).json({
      status: true,
      content: {
        meta,
        data: roles,
      }
    });
  } catch (error) {
    return res.status(500).json({
      status:false,
      error: "Internal Server Error",
    })
  }
}

