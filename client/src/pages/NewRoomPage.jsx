import React from 'react'
import {createRoom} from '../api/createRoom'

export default function NewRoomPage(){

    function handleCreateRoom (e) {
        e.preventDefault()
        // this will submit the newRoom 
        const newRoomData = new FormData(e.target);
        const roomData = {
            roomName: newRoomData.get('roomName')
        }

        createRoom(roomData).then((res) => {
            if(res.success){
                console.log("Room Created");
            } else {
                console.log("Error in room creation");
            }
        })
    }
    return(
        <>
            <form onSubmit={handleCreateRoom}>
                <label htmlFor="roomName">Room Name:</label>
                <input type="text" id="roomName" name="roomName" required />

                <button type="submit">Create Room</button>  
            </form>
        </>
    )
}