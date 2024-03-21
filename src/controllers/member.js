import { Community } from '../models/community.js';
import { Member } from '../models/member.js';
import { Role } from '../models/role.js';
import { User } from '../models/user.js';
import { checkRole } from '../utils/features.js';


export const addMember= async(req, res)=>{
    try {
        const { community, user, role } = req.body;

        // if the user to be added does not exists 
        const currentUser = await User.findOne({_id: user}).select('_id');
        if(!currentUser){
            return res.status(400).json({
                status: false,
                errors: [
                  {
                    param: "user",
                    message: "User not found.",
                    code: "RESOURCE_NOT_FOUND"
                  }
                ]
            })
        }
 
        // if the community does not exists 
         const currentCommunity = await Community.findOne({_id: community}).select('_id');
        if(!currentCommunity){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  param: "community",
                  messsage:"Community not found.",
                  code: "RESOURCE_NOT_FOUND",
                 }
               ]
            });
        }

        // if that role does not exists 
        const currentRole = await Role.findOne({_id: role}).select('_id');
        if(!currentRole){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  param: "role",
                  messsage:"Role not found.",
                  code: "RESOURCE_NOT_FOUND",
                 }
               ]
            });
        }
         

        // if the signedin user is not admin 
        const adminRole = await Role.findOne({ name: 'Community Admin' }).select('_id');
        
        const admin = await checkRole(community, req.user.toObject()._id, adminRole._id);
        if(!admin){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  messsage:"You are not authorized to perform this action.",
                  code: "NOT_ALLOWED_ACCESS",
                 }
               ]
            });
        }

        // if the user is already added to the community 
        const currentMember = await Member.findOne({community, user, role}).select('_id');
        if(currentMember){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  messsage:"User is already added in the community.",
                  code: "RESOURCE_EXISTS",
                 }
               ]
            });
        }
   

        let memberRole = await Role.findOne({name: 'Community Member'}).select('_id');
        if(!memberRole){
            memberRole = new Role({name: 'Community Member'})
            await memberRole.save();
        }

        const newMember = await Member.create({
            community,
            user,
            role:memberRole._id,
        });
 
        newMember.__v=undefined;

        return res.status(201).json({
            status:true,
            content: {
              data: newMember,
            } 
          });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }
}


export const deleteMember= async(req, res)=>{
    try{
        const {id} = req.params;
        const member = await Member.findOne({_id: id});

        // if the member does not exists 
        if(!member){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  messsage:"Member not found.",
                  code: "RESOURCE_NOT_FOUND",
                 }
               ]
            });
        }

        // check if the signedin user is either Community Moderator or Community Admin 
        const [moderatorRole,adminRole] = await Promise.all([
                                                             Role.findOne({ name: 'Community Moderator' }), 
                                                             Role.findOne({ name: 'Community Admin' })
                                                            ]) 

        const admin = await checkRole(member.community, (req.user.toObject())._id, adminRole?._id);
        const moderator = await checkRole(member.community, (req.user.toObject())._id, moderatorRole?._id);
        if (!admin  && !moderator ) {
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  messsage:"You are not authorized to perform this action.",
                  code: "NOT_ALLOWED_ACCESS",
                 }
               ]
            });
        }

        await Member.deleteOne({_id: id});
        return res.json({status: true});

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }
}
