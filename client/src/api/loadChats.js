export async function loadChats(data){
    console.log("call to loadChats");
    const res = await fetch('http://localhost:3000/chats/allChats' , {
        method:"POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('token')}`
        } ,
        body : JSON.stringify(data)
    })

    // console.log("res from the server for allchats -> " , res.status);

    if(res.status == 200){
        const resData = await res.json();
        const chats = resData.chats;

        // console.log("chats -> " , chats);
    
        // get the chats
        return {success : true , chats : chats};
    } else {
        return {success : false , message : "issue in getting chats "};
    }
}