export async function enterInRoom(data){

    // data is in json format
    console.log(data);
    try{
        const res = await fetch('http://localhost:3000/rooms/enterRoom' , {
            method : 'POST',
            headers:{
                'Content-Type' : 'application/json',
                'authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })

        const resData = await res.json();



        if(res.status == 201){
            alert("You are already in the same room");
            return {success : false , message : "already in the room"}
        } else if(res.ok){
            return {success : true , newRoom : resData.room};
        } else {
            return {success : false , message : "Invalid token "};
        }
    } catch (err){
        console.log("error" , err);
        return {success : false , message : "Network error"};
    }
}