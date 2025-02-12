export async function loadRooms(){
    const res = await fetch('https://chatverse-gld5.onrender.com/rooms/allRooms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if(res.ok){
        const data = await res.json();
        // console.log(data);
        return {success : true , rooms : data.rooms};
    } else {
        return {success : false , message : "invalid token"};
    }
}
