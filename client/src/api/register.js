export async function registerUser(data){
    console.log("data to registerUser" , data)
    console.log("call to registerUser");
    try{
        const res = await fetch('https://chatverse-gld5.onrender.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if(res.status == 200){
            // user is registered
            const resData = await res.json();
            console.log("resData" , resData);
            console.log("User registered" , res);
            localStorage.setItem('token' , resData.token);

            window.location.href = 'http://localhost:5173/';

            return {success : true};
        } else if (res.status == 409){
            console.log("user with this email already exists");
            window.location.href = 'http://localhost:5173/login';
            return {success : "false"};
            
        } else {
            console.log("An error occurred. Please try again later.");
            return {success : false};
        }
    } catch (err) {
        console.log("error , " , err);
        return {success : false};
    }
}
