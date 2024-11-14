import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const pageNumber=parseInt(page)
    const limitNumber=parseInt(limit)
    const skip=(pageNumber-1)*limitNumber
    
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const comments=await Comment.find({
        video:videoId
    })
    .populate('user','username avatar')
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limitNumber);

    if(!comments.length){
        return res.status(200).json(
            new ApiResponse(200, {
                comments: [],
                totalComments: 0,
                totalPages: 0,
                currentPage: pageNumber
            }, "No comments found for this video")
        );
    }

    const totalComments=await Comment.countDocuments({video:videoId});

    return res.status(200).json(
        new ApiResponse(200,
            {
                comments,
                totalComments,
                totalPages: Math.ceil(totalComments / limitNumber),
                currentPage: pageNumber
            }, 
            "Comments fetched successfully"
        )
    );

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const owner=req.user._id;
    const {content}=req.body;
    if(!videoId){
        throw new ApiError(400,"Error fetching video")
    }
    if(!owner){
        throw new ApiError(400,"user id not found")
    }
    if(!content){
        throw new ApiError(400,"Provide proper comment")
    }
    const comment=await Comment.create(
       { video:videoId,
         content,
         owner}
    );
    if(!comment){
        throw new ApiError(500,"Server error in creating comment")
    }

    return res.status(201)
    .json(
        new ApiResponse(201,comment,"Comment created succesfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} =req.body;
    const {commentId}=req.params;
    const userId = req.user._id;
    if(!content){
        throw new ApiError(400,"Please provide valid comment to update")
    }
    if(!commentId){
        throw new ApiError(400,"Comment Id is not valid")
    }
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId }, // Ensure the user is the owner
        { $set: { content: content } },
        { new: true }
    );
    if(!updatedComment){
        throw new ApiError(500,"Error updating comment you are not authorised to update the comment or comment not found")
    }

    return res.status(200).json(
        new ApiResponse(200,updatedComment,"comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    const userId=req.user._id
    if(!commentId){
        throw new ApiError(403,"Comment Id is invalid")
    }
    const deletedComment=await Comment.findOneAndDelete(
        { _id: commentId, owner: userId }, // Ensure the user is the owner
    )

    if(!deletedComment){
        throw new ApiError(500,"Error deleting comment")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }