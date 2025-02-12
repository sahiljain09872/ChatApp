export function loadUser(){
    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, message: 'User not logged in' };
    }
    return { success: true, data: { token } };
}