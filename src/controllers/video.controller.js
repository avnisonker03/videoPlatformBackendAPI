import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    //1. set up pagination
    const pageNumber=parseInt(page)
    const limitNumber=parseInt(limit)
    const skip=(pageNumber-1)*limitNumber


    //2.prepare filter object
    let filter={}
    if(query){
        filter.title={ $regex: query, $options: 'i' }
    }
    if(userId){
        filter.owner=userId
    }
    
    //3.prepare sort object 
    let sort={}
    if(sortBy){
        sort[sortBy]=sortType==='desc'? -1:1
    }

    //4.execute query
    const videos=await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)

    const totalVideos=await Video.countDocuments(filter)

    if(!videos){
        throw new ApiError(500,"Error fetching videos")
    }

    if(totalVideos===undefined){
        throw new ApiError(500,"Error fetching total Videos Count")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,
            videos,
            pageNumber,
            Math.ceil(totalVideos/limitNumber),
            totalVideos,
            "All videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if (
        [title,description].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are compulsory or required")
    }
    // TODO: get video, upload to cloudinary, create video
    const videoFileLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    
    if(!videoFileLocalPath){
        throw new ApiError(400,"Video file is required");
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required");
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
    const videoFile=await uploadOnCloudinary(videoFileLocalPath);

    if(!thumbnail){
        throw new ApiError(500,"Internal Server Error please upload thumbnail again");
    }

    if(!videoFile){
        throw new ApiError(500,"Failed uploading video please try again");
    }

    const video=await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        views:0,
        duration:videoFile.duration,
        owner:req.user._id
    })

    const createdVideo= await Video.findById(video._id);
    
    if(!createdVideo){
        throw new ApiError(500,"Something went wrong while publishing video")
    }
    
    return res.status(201).json(
        new ApiResponse(200, createdVideo ,"Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format");
    }
    const video=await Video.findById(videoId).populate("owner", "username avatar");
    if(!video){
        throw new ApiError(404,"Video Not found");
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video with the given id")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description,thumbnail}=req.body;
    

    const updateFields={
        ...(title && {title}),
        ...(description && {description}),
        ...(thumbnail && {thumbnail})
    };

    // const updatedVideo=await Video.findByIdAndUpdate(
    //     videoId,
    //     {
    //         $set:updateFields
    //     },
    //     {new:true,
    //      runValidators:true,
    //      $where: function() {
    //         return this.owner.toString() === req.user._id.toString();
    //     }
    //     }
    // )
    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updateFields },
        { new: true, runValidators: true }
      );
      
      if (!updatedVideo) {
        throw new ApiError(403, "You do not have permission to update this video or the video doesn't exist");
      }

    if(!updatedVideo){
        throw new ApiError(403, "You do not have permission to update this video");
    }

    return res.status(200).json(
        new ApiResponse(200,updatedVideo,"Video Details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    // const deletedVideo=await Video.findByIdAndDelete(videoId,
    //     {
    //         $where: function() {
    //             return this.owner.toString() === req.user._id.toString();
    //         }
    //     }
    // );
    const deletedVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
      });
      
      if (!deletedVideo) {
        throw new ApiError(403, "You do not have permission to delete this video or the video doesn't exist");
      }
   
    return res.status(200).json(
        new ApiResponse(200,deletedVideo,"Video deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const video = await Video.findByIdAndUpdate(
    //     videoId, 
    //     {$set:{isPublished:!video.isPublished}},
    //     {new:true,
    //         $where: function() {
    //             return this.owner.toString() === req.user._id.toString();
    //         }
    //     } 
    // );
    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        [{ $set: { isPublished: { $not: "$isPublished" } } }],
        { new: true }
      );
      
      if (!video) {
        throw new ApiError(403, "You do not have permission to change the publish status of this video or the video doesn't exist");
      }
    return res.status(202)
    .json(
        new ApiResponse(200,"Published Status updated successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}