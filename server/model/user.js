const mongoose = require("mongoose")
const {Schema} = mongoose;

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// I wanna add a new field for every room in which user is connected and that is seen count of that room for this user 


const User = mongoose.model("User", userSchema);
module.exports = User;