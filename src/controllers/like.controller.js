import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid videoId")
    }
    
    const like=await Like.findOne({likedBy:req.user._id, video:videoId});
    if(like){
        await Like.deleteOne({_id:like._id});
        return res.status(200)
        .json(
            new ApiResponse(200,"video unlike successfully")
        )
    }
    const newLike=await Like.create(
        {likedBy:req.user._id,video:videoId}
    );
    if(!newLike){
    throw new ApiError(500,"error liking the video")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,newLike,"Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    
    const like=Like.findOne({comment:commentId,likedBy:req.user._id});
    if(like){
        await Like.deleteOne({_id:like._id})
        return res.status(200).json(
            new ApiResponse(200,"comment unlike successfully")
        )
    }

    const newLike=await Like.create({likedBy:req.user._id,comment:commentId});

    if(!newLike){
        throw new ApiError(500,"Error liking comment")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,newLike,"comment liked successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
   if(!isValidObjectId(tweetId)){
    throw new ApiError(400,"Invalid tweet Id")
   }

   const like=await Like.findOne({tweet:tweetId,likedBy:req.user._id})
   if(like){
    await Like.deleteOne({_id:like._id})
    return res.status(200)
    .json(
        new ApiResponse(200,"Tweet unlike successfully")
    )
   }

   const newLike=Like.create(
    {tweet:tweetId,likedBy:req.user._id}
   )

   if(!newLike){
    throw new ApiError(500,"Error liking tweet")
   }

   return res.status(200)
   .json(
    new ApiResponse(200,newLike,"Tweet like successfully")
   )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if(!isValidObjectId(req.user._id)){
        throw new ApiError(400,"Invalid user id")
    }
    const likedVideos=await Like.find({likedBy:req.user._id ,video:{ $exists: true }}).populate("video","_id title thumbnail").exec();

    if(!likedVideos.length){
        throw new ApiError(404,"No liked videos found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,likedVideos,"fetch all like videos")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}