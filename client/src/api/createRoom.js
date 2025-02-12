export async function createRoom(data){

    // data is in json format
    console.log(data);
    try{
        const res = await fetch('http://localhost:3000/rooms/createRoom' , {
            method : 'POST',
            headers:{
                'Content-Type' : 'application/json',
                'authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })

        const resData = await res.json();



        if(res.ok){
            return {success : true , newRoom : resData.newRoom};
        } else {
            return {success : false , message : "Invalid token "};
        }
    } catch (err){
        console.log("error" , err);
        return {success : false , message : "Network error"};
    }
}