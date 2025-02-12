const mongoose = require("mongoose")
const {Schema} = mongoose;

const UserRoomMappingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    seenCount: { type: Number, default: 0 }, // Tracks how many chats the user has seen
    lastSeenAt: { type: Date, default: Date.now} // Tracks the last time the user checked the room
})

module.exports = mongoose.model("UserRoomMapping" , UserRoomMappingSchema);