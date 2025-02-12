export async function getUserId(){
    const res = await fetch("http://localhost:3000/getUserId" , {
        method : "POST",
        headers:{
            'Content-Type' : 'application/json',
            'authorization' : `Bearer ${localStorage.getItem('token')}`
        },
    })

    
    if(res.status == 200){
        const resData = await res.json(); 
        console.log("res is ok from the getUserId")

        return {success : true , userId : resData.userId , userName : resData.userName};
    } else {
        return {success : false , message : "userId not found"};
    }
}