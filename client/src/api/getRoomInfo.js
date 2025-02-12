export async function getRoomInfo(data){
    // this function will get the whole info about the room
    try{
        const res = await fetch("https://chatverse-gld5.onrender.com/rooms/getRoomInfo" ,  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })

        if(res.ok){
            const resData = await res.json();
            console.log("from server for getRoomInfo -> ", resData);
            return {success : true , RoomInfo : resData.room};
        } else {
            return {success : false};
        }
    } catch (error){
        console.error('Error:', error);

        // Show a general error message to the user
        alert('An error occurred. Please try again later.');

        return { success: false, message: 'Network or server error' };
    }
}
