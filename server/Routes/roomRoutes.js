const express = require('express')
const router = express.Router()

// console.log("room routes")

const User = require("../model/user")
const Room = require("../model/room")
const UserRoomMapping = require("../model/UserRoomMapping");

router.post('/rooms/createRoom', async (req, res) => {

    // console.log("createRoom route");
    
    const { roomName } = req.body;
    console.log("request to create a new room", roomName);

    if (!roomName) {
        console.log("room name not found");
        return res.status(400).json({ message: "Room name is required" });
    }

    const room = {
        _id: new mongoose.Types.ObjectId(),
        roomName: roomName,
        createdBy: req.user.id,
    };

    const newRoom = new Room(room);

    try {
        const savedRoom = await newRoom.save(); // Save the room
        // console.log("new Room created" , savedRoom)

        // Now we don't have to update any user in user collection because that is seperate collection
        // add the new document in userRoomMapping

        const userRoomMapping = {
            userId: req.user.id,
            roomId: newRoom._id,
        };
        
        const newUserRoomMapping = new UserRoomMapping(userRoomMapping);
        
        newUserRoomMapping
            .save()
            .then(() => {
                console.log("New UserRoom Mapping has been created");
            })
            .catch((err) => {
                console.error("Error creating UserRoom Mapping:", err);
            });
        

        return res.status(200).json({ newRoom: savedRoom });

    } catch (err) {
        console.error("Error occurred:", err);

        // Handle different types of errors
        if (err.name === 'ValidationError') {
            console.log("validation error")
            return res.status(400).json({ message: "Validation error", error: err.message });
        }

        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
});


router.get('/rooms/allRooms', async (req, res) => {
    try {

        const userId = req.user.id;

        const userRoomMappings = await UserRoomMapping.find({userId : userId}).populate('roomId').exec();

        const rooms = userRoomMappings.map(mapping => mapping.roomId);
        
        
        res.status(200).json({ rooms: rooms });
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;