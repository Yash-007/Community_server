import { Role } from '../models/role.js';
import { Community } from '../models/community.js';
import { Member } from '../models/member.js';
import Validator from 'validatorjs';


export const createCommunity =async (req, res) =>{
    try {
        const { name } = req.body;

        // validate the input 
        const rules = {
            name: 'required|min:2',
          };
          const validation = new Validator(req.body, rules);
          if(validation.fails()){
            return res.status(400).json({
              status:false,
              errors: [
                {
                param: "name",
                messsage:"Name should be at least 2 characters.",
                code: "INVALID_INPUT",
               }
             ]
          }); 
         }

        const slug = name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');

        const ownerId = req.user._id;

        const community = await Community.create({
            name,
            slug,
            owner: ownerId,
        });
   
        // creating a member of a community as a admin 
        let adminRole = await Role.findOne({ name: 'Community Admin' });
        if(!adminRole){
        adminRole = new Role({name: 'Community Admin'})
        await adminRole.save();
        }

        const member = await Member.create({
            community: community._id,
            user: ownerId,
            role: adminRole._id,
        });

        community.__v=undefined;
        return res.status(201).json({
            status:true,
            content: {
              data: community,
            } 
          });
    } catch (err) {
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }
}



export const getAllCommunities= async (req, res)=> {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = limit * (page - 1);
    
        const [communities, total] = await Promise.all([
            Community.find({},{__v:0})
                .populate('owner', 'name')
                .skip(skip)
                .limit(limit),
                
            Community.countDocuments(),
        ]);
    
        const pages = Math.ceil(total / limit);
    
        const meta = {
            total,
            pages,
            page,
          }
        return res.status(200).json({
            status: true,
            content: {
              meta,
              data: communities,
            }
          });   
    } catch (error) {
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }
}


export const getAllMembers= async(req, res)=>{
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const communityId = req.params.id;
        const skip = (limit * (page-1));

        // check if community exists 
        const community = await Community.findOne({_id: communityId})
        if(!community){
            return res.status(400).json({
                status:false,
                errors: [
                  {
                  messsage:"Community not found.",
                  code: "RESOURCE_NOT_FOUND",
                 }
               ]
            });
        }

        const totalCountPromise = Member.countDocuments({ community: communityId });
        const membersPromise =  Member.find({ community: communityId },{__v:0})
        .skip(skip)
        .limit(limit)
        .populate('user', 'name')
        .populate('role', 'name')
        .lean();
        
        const [members,total ]= await Promise.all([membersPromise, totalCountPromise])


        const pages = Math.ceil(total / limit);

        const meta = {
            total,
            pages,
            page,
          }
        
        return res.status(200).json({
                status: true,
                content: {
                  meta,
                  data: members,
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


export const getMyOwnedCommunity= async(req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const userId = req.user.toObject()._id;
        const communities = await Community.find({ owner: userId }, {__v:0})
            .populate('owner','_id')
            .skip(skip)
            .limit(limit)
            .lean();

        communities.forEach((community)=> (community.owner = community.owner._id));

        const pages = Math.ceil(communities.length / limit);
        const meta = {
            total: communities.length,
            pages: pages,
            page: page,
        };

        return res.status(200).json({
            status: true,
            content: {
              meta,
              data: communities,
            }
          });
    } catch (err) {
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }

}



export const getMyJoinedCommunity= async(req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    try {
        const members = await Member.find({ user: userId },{__v:0})
            .populate({
                path: 'community',
                populate: {
                    path: 'owner',
                    select: '_id name',
                },
            })
            .skip(skip)
            .limit(limit)
            .exec();

        
        let communities=  members.map((member)=>{
              member.community.__v= undefined;
              return member.community;
            })
        

        const total = members.length;
        const pages = Math.ceil(total / limit);

        const meta= {
            total,
            pages,
            page,
          }

   return res.status(200).json({
      status: true,
      content: {
        meta,
        data: communities,
      }
    });
    } catch (err) {
        return res.status(500).json({
            status:false,
            message: 'Internal Server Error',
        });
    }
}
