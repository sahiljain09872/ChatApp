const mongoose = require("mongoose")
const {Schema} = mongoose;

// const chatSchema = new Schema({
//     _id: Schema.Types.ObjectId,
//     roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
//     senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     message: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

const chatSchema = new Schema({
    _id: Schema.Types.ObjectId,
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String }, // Message can be empty if a file is shared
    file: {
        fileName: { type: String, default: "" }, // Stores file name
        filePath: { type: String, default: "" }, // Stores file location in GCS
    },
    createdAt: { type: Date, default: Date.now },
});


chatSchema.index({ roomId: 1, createdAt: 1});
module.exports = mongoose.model("Chat", chatSchema);