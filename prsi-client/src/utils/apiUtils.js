// src/utils/apiUtils.js
export async function call_api(api) {
    const url = `http://localhost:3006/api/${api}`;
    const token = sessionStorage.getItem("JWT_token");

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'authorization': `${token}`, // Add JWT token to header
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        try {
            return await response.json();
        } catch (error) {
            return response;
        }

    } catch (error) {
        console.error(`API call failed: ${error.message}`);
        alert("An error occurred while communicating with the server.");
    }
}