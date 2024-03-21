import { Member } from '../models/member.js';
import { Snowflake } from '@theinternetfolks/snowflake';
import mongoose from 'mongoose';


export const DBconnection=()=>{
 mongoose.connect(process.env.MONGO_URL)
 .then((c)=> console.log(`Database connected succesfully at host ${c.connection.host}`))
 .catch((e)=> console.log(e))
}


export const generateId = ()=>{
    return Snowflake.generate()
}


export const checkRole= async(communityId, userId, roleId)=>{
    const hasRole = await Member.findOne({
        community: communityId,
        user: userId,
        role: roleId
    }).select('_id');
    return hasRole;
}