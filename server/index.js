require('dotenv').config();

const express = require('express');
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require("path");

const mongoose = require("mongoose")

const PORT = process.env.PORT;
const SECRET_KEY = process.env.secret_key;

const { Storage } = require("@google-cloud/storage");
const multer = require("multer");

// models 

const User = require("./model/user")
const Room = require("./model/room")
const Chat = require("./model/chat")
const UserRoomMapping = require("./model/UserRoomMapping")

// routes

const roomRoutes = require('./Routes/roomRoutes');
const uploadRoutes = require("./Routes/uploadRoutes");


// file handling
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client/")));

app.use((req, res, next) => {
    const origin = req.header("Origin");
    const allowedOrigins = [
        'https://chatapp-gf0o.onrender.com',
        'https://chatverse-gld5.onrender.com'
    ];

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);  // Dynamically set allowed origin
    }
    
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


const { connectToDatabase } = require("./db.js");

(async () => {
    await connectToDatabase();
})()

// const upload = require("./multerConfig");

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const storage = new Storage({ credentials });

const bucket = storage.bucket("my-chatapp-files");

const upload = multer({
    storage: multer.memoryStorage(),
});

const allowedOrigins = [
    'https://chatapp-gf0o.onrender.com',
    'https://chatverse-gld5.onrender.com'
];

const io = socketIo(server, {
    cors: {
        origin: [
            'https://chatapp-gf0o.onrender.com',
            'https://chatverse-gld5.onrender.com'
        ], // Allow multiple origins
        methods: ['GET', 'POST', 'PUT', 'PATCH'], // Allowed HTTP methods
        allowedHeaders: ['Authorization'], // Allowed headers
        credentials: true, // Allow credentials like cookies
    },
});


// app.use("/api", uploadRoutes)

const verifyToken = (req, res, next) => {
    // console.log("came for authentication");
    const authHeader = req.headers['authorization'];

    // Check if the authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Extract the token (remove the "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // SECRET_KEY must be defined elsewhere
        req.user = decoded; // Attach decoded token to the request object
        next(); // Move to the next middleware
    } catch (err) {
        // console.log("token is not valid");
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

// connection to the mongodb server

// Middleware to verify token for API calls

// Middleware to verify token for socket connections


app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without origin (e.g., from Postman or server-to-server requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // Allow credentials if needed
}));

io.use((socket, next) => {
    // console.log("Middleware reached");

    const authHeader = socket.handshake.auth.token; // Get the token from auth
    // console.log("Auth header is ->", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Error('Authentication error: Token not provided or invalid'));
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'
    // console.log("Token for io ->", token);

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verify the token
        socket.user = decoded; // Attach user data to the socket object
        socket.token = token;
        next();
    } catch (err) {
        console.log("Authentication error occurred");
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', async (socket) => {
    console.log('New client connected ✅');
    // console.log("the socket has the info about the user ->", socket.user);

    const res = await fetch('https://chatverse-gld5.onrender.com/rooms/allRooms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${socket.token}`
        }
    })

    const resData = await res.json();
    const rooms = resData.rooms;
    // console.log("room is which the user is connected are -> " , rooms , resData);

    rooms.forEach((room) => {
        socket.join(room.roomId._id);
        // console.log(`${socket.id} joined room: ${room}`);
    });

    socket.on("sendMessage", async (chatData) => {
        console.log("Received message data ->", chatData);

        try {
            // Validate incoming chatData
            if (!chatData.roomId || (!chatData.message && !chatData.file) || !chatData.senderId) {
                console.error("Invalid chat data received -> " , chatData);
                return;
            }

            // 1. Increment the chat count for the roomId
            await Room.findOneAndUpdate(
                { _id: chatData.roomId },
                { $inc: { chatCount: 1 } },
                { new: true }
            );

            // 2. Add the chat to the Chat model
            const newChat = new Chat({
                _id: new mongoose.Types.ObjectId(),
                roomId: chatData.roomId,
                message: chatData.message,
                createdAt: chatData.createdAt,
                senderId: chatData.senderId._id,
                file: chatData.file // Assuming senderId is an object with _id
            });

            console.log("New chat to save ->", newChat);
            await newChat.save();

            // 3. Emit the message to all other sockets in the same roomId
            socket.to(chatData.roomId).emit("receiveMessage", chatData);

            console.log("Message successfully saved and broadcasted.");
        } catch (error) {
            console.error("Error handling message:", error);
        }
    });

    socket.on('updateSeenCount', async ({ userId, roomId }) => {
        try {
            // Get the chat count from the room
            const room = await Room.findById(roomId).select("chatCount"); // Fetch only chatCount
            if (!room) {
                console.error("Room not found");
                return;
            }

            // Update the user's seenCount to match chatCount and update lastSeenAt
            await UserRoomMapping.findOneAndUpdate(
                { userId, roomId },
                {
                    seenCount: room.chatCount
                },
                { new: true } // Return the updated document
            );

            // console.log(`Seen count updated for user ${userId} in room ${roomId}`);
        } catch (error) {
            console.error("Error updating seen count:", error);
        }
    });


    socket.on('joinRoom', async (roomId) => {
        // console.log("came to join the newRoom");
        socket.join(roomId);
    })


    socket.on('changeRoom', async (roomId) => {
        // console.log("come to join/change the room");
        // console.log("prev Room Id : -> ",roomId);
        const userId = socket.user.id;

        if (!roomId) {
            console.error("there is no prev roomId present to update the seen count  ");
            return;
        }

        try {
            // Fetch the chat count of the specified room
            const room = await Room.findById(roomId);
            if (!room) {
                console.error("Room not found");
                return;
            }
            const chatCount = room.chatCount;
            // console.log("rooms chat count is -> ", chatCount)

            // Update the seenCount in UserRoomMapping for the specified user and room
            const updatedUserRoomMapping = await UserRoomMapping.findOneAndUpdate(
                { userId, roomId }, // Find by userId and roomId
                { seenCount: chatCount }, // Update seenCount to chatCount
                { new: true } // Return the updated document
            );

            if (!updatedUserRoomMapping) {
                console.error("UserRoomMapping not found");
                return;
            }

            // console.log("UserRoomMapping updated successfully:", updatedUserRoomMapping);
        } catch (err) {
            console.error("Error while updating seenCount:", err);
        }
    });


    socket.on('exitRoom', async (roomId) => {
        // remove the socket from the roomId 
        console.log("exitRoom at io server");
        await UserRoomMapping.deleteOne({ userId: socket.user.id, roomId: roomId });
        socket.leave(roomId);
        // remove the userId roomId mapping 
    })
    // console.log("current socket Id : ", socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // when the client get disconnected then I wanna update the seen count of the user to the chatcount of the room
    });
});



// file upload


app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    blobStream.on("finish", async () => {
        try {
            // Store file reference in the database
            const fileInfo = {
                fileName: req.file.originalname,
                path: req.file.originalname, // Save path, NOT URL
            };

            // Save fileInfo to your database (MongoDB, SQL, etc.)

            res.status(200).json({message : "file has been stored successfully" , file : fileInfo});
        } catch (error) {
            console.error("Error storing file info:", error);
            res.status(500).json({ error: "Failed to store file info" });
        }
    });

    blobStream.end(req.file.buffer);
});

app.get("/file/:filename", async (req, res) => {
    // console.log("came to get the file to show in the chat !!");
    try {
        const fileName = req.params.filename;
        const file = bucket.file(fileName);

        // Generate a fresh signed URL valid for 24 hours
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
        // console.error("the url that we are returning to show the file at the frontend is -> " , url );
        res.json({ url });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        res.status(500).json({ error: "Failed to fetch file" });
    }
});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: user.email, id: user._id, name: user.name },
            SECRET_KEY
        );

        console.log("assigning the token");

        // Send success response
        res.status(200).json({ token });
    } catch (err) {
        console.error("Login server error -> ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/rooms/enterRoom', verifyToken, async (req, res) => {

    console.log("enterRoom route");

    const { roomId } = req.body;
    const userId = req.user.id;

    console.log("request to enter a new room", roomId);

    if (!roomId) {
        console.log("roomId not found");
        return res.status(400).json({ message: "RoomId is not given" });
    }

    // check if there is any userRoomMapping already exists 


    try {

        const userRoom = await UserRoomMapping.findOne({ userId: userId, roomId: roomId });

        if (userRoom) {
            console.log(userRoom);
            console.log(userRoom.lastSeenAt);
            res.status(201).json({ message: "already in the room" });
        } else {

            console.log("Now maching found while entering the new room ")

            const room = await Room.findOneAndUpdate(
                { _id: roomId },
                { $addToSet: { participants: userId } }, // $addToSet ensures no duplicates
                { new: true } // Return the updated room
            );

            console.log(room);

            if (!room) {
                console.log("Room not found with this roomId");
                return res.status(404).json({ message: "Room not found with this roomId" });
            }

            const userRoomMapping = {
                userId: req.user.id,
                roomId: room._id,
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


            return res.status(200).json({ room });
        }



    } catch (err) {
        console.log("some error at the server side in entering the room", err);
        res.status(500).json({ message: "Internal Server Error in entering the room " })
    }
});


app.post('/rooms/createRoom', verifyToken, async (req, res) => {

    console.log("createRoom route");

    const { roomName } = req.body;
    console.log("request to create a new room", roomName);

    if (!roomName || roomName.trim() == "") {
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


app.post('/chats/allChats', verifyToken, async (req, res) => {
    // console.log("come to get all chats");
    const { roomId } = req.body;
    console.log(roomId);

    try {
        const chats = await Chat.find({ roomId }).sort({ createdAt: 1 })
            .populate({
                path: 'senderId',
                select: '_id name' // Include both _id and name
            })
            .exec();


        const finalChats = chats.map((chat) => {
            return { ...chat._doc, userId: req.user.id };
        })

        // console.log("returning all chats -> here we are showing only the one chat from the chats ", finalChats[0]);

        res.status(200).json({ chats: finalChats });

    } catch (err) {
        console.log("error", err);
        res.status(400).json({ message: "not found the chats " });
    }
})

app.post("/getUserId", verifyToken, (req, res) => {
    res.status(200).json({ userId: req.user.id, userName: req.user.name });
})
// get all rooms for the user


app.get('/rooms/allRooms', verifyToken, async (req, res) => {
    try {

        const userId = req.user.id;

        const userRoomMappings = await UserRoomMapping.find({ userId: userId })
            .populate('roomId', '_id roomName chatCount') // Select only required fields
            .exec();


        // const rooms = userRoomMappings.map(mapping => mapping.roomId);
        const rooms = userRoomMappings.map(mapping => {
            const seenCount = mapping.seenCount || 0; // Default to 0 if undefined
            const chatCount = mapping.roomId?.chatCount || 0; // Default to 0 if undefined

            return {
                roomId: mapping.roomId, // Include only the room object
                unseenCount: chatCount - seenCount // Calculate unseen count
            };
        });

        console.log("all rooms in which user is connected -> ", rooms[0]);


        res.status(200).json({ rooms: rooms });
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/rooms/getRoomInfo', verifyToken, async (req, res) => {
    const { roomId } = req.body;
    console.log("roomId that we are getting to get the info -> ", roomId);
    if (!roomId) {
        res.status(400).json({ message: "roomId not found to get the roomInfo" });
    }

    try {
        const room = await Room.findOne({ _id: roomId }).populate('participants', "_id name email").exec();
        if (!room) {
            res.status(400).json({ message: "there is no such room with the given roomId to get the roomInfo!!" });
        }

        console.log("the roomInfo of the room is -> ", room);
        res.status(200).json({ room });

    } catch (err) {
        console.log("error at getRoomInfo at server side -> ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
})



app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password asynchronously
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ email: newUser.email, id: newUser._id }, SECRET_KEY, { expiresIn: '1h' });

        // Respond with success
        res.status(200).json({ token, message: "User created successfully" });
    } catch (err) {
        console.error("Error while registering the user:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/tokenVerification', verifyToken, (req, res) => {
    res.status(200).json({ message: "token is valid" });
})

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/", "index.html"));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
