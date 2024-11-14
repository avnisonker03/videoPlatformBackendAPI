import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name){
        throw new ApiError(400,"Name is required")
    }
    if(!description){
        throw new ApiError(400,"Description is required")
    }
    const playlist=await Playlist.create(
        {
            name:name,
            description:description,
            owner:req.user._id
        }
    )

    if(!playlist){
        throw new ApiError(500,"Error creating playlist")
    }

    return res.status(201)
    .json(
       new ApiResponse(201,playlist,"Playlist created successfully")
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const userPlaylists=await Playlist.find({owner:userId})
    .populate("owner","username avatar")
    .populate("videos", "videoFile title duration");

    if(!userPlaylists.length){
        return res.status(200).json(
            new ApiResponse(200,"User has not created any playlist yet")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,userPlaylists,"Playlist created by user fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist=await Playlist.find({_id:playlistId})

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}