const mongoose = require("mongoose")
const {Schema} = mongoose;

const roomSchema = new Schema({
    _id: Schema.Types.ObjectId,
    roomName: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: function() { return [this.createdBy]; } },
    chatCount: { type: Number, default: 0 }, // Tracks total chats in the room
    createdAt: { type: Date, default: Date.now }
});



// I wanna add a new field that is chat count in that room 

 

module.exports = mongoose.model('Room', roomSchema);