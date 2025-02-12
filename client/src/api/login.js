export async function loginUser(data) {
    try {
        const res = await fetch('https://chatverse-gld5.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check if the response status is 200 (success)
        if (res.ok) {
            const resData = await res.json();

            // Store the token in local storage
            localStorage.setItem('token', resData.token);

            // Redirect to the homepage
            window.location.href = 'https://chatapp-gf0o.onrender.com';

            return { success: true };
        } 

        // Handle specific status codes
        if (res.status === 404) {
            alert('User Not Found');
            return { success: false, message: 'User not found' };
        }

        // Handle other unsuccessful responses
        alert('Recheck your credentials or register');
        return { success: false, message: 'Invalid credentials' };
    } catch (error) {
        console.error('Error:', error);

        // Show a general error message to the user
        alert('An error occurred. Please try again later.');

        return { success: false, message: 'Network or server error' };
    }
}
