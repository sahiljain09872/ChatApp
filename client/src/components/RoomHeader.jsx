import React , {useState , useEffect , useContext} from 'react'
import {roomContext} from "../pages/Home"

export default function RoomHeader(){
    let [room , setRoom] = useContext(roomContext);
    
    return (
        <>
            <h1> currRoom is : {room.roomName}</h1>

            
        </>
    )
}