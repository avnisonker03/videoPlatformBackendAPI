import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }
  
    const subscription=await Subscription.findOne({channel:channelId,subscriber:req.user._id});

    if(subscription){
        await Subscription.deleteOne({_id:subscription._id})
        return res.status(200)
        .json(
            new ApiResponse(200,"unsubscribe successfully")
        )
    }

    const newSubscription=await Subscription.create(
        {channel:channelId,subscriber:req.user._id}
    )
    if(!newSubscription){
        throw new ApiError(500,"Error subscribing the channel try again")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,newSubscription,"Subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const userChannelSubscribers=await Subscription.find({channel:channelId,subscriber:{ $ne: null}}) 
    .populate('subscriber', 'username avatar');

    if(!userChannelSubscribers.length){
        return res.status(200).json(
            new ApiResponse(200,"No subscribers found")
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200,userChannelSubscribers,"Fetched subscribers successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id")
    }

    const channelList=await Subscription.find({
        subscriber:subscriberId,channel:{$ne:null}
    }).populate('channel', 'username ,avatar').exec()

    if(!channelList.length){
        return res.status(200)
        .json(
            new ApiResponse(200,"User has not subscribed to any channel yet")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,channelList,"Channel list fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}