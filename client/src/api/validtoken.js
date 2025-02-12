export async function validtoken(){
    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, message: 'User not logged in' };
    }
    const res = await fetch('http://localhost:3000/tokenVerification', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if(res.ok){
        return {success : true , message : 'user logged in'};
    } else {
        return {success : false , message : "invalid token"};
    }
}