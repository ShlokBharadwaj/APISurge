const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
})

app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        const data = response.data;

        const formattedData = data.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            address: user.address,
            phone: user.phone,
            website: user.website,
            company: user.company
        }));

        res.json(formattedData);
    } catch (error) {
        console.error("API request error: ", error);
        res.status(500).json({ error: "Error fetching data from the API" });
    }
});
