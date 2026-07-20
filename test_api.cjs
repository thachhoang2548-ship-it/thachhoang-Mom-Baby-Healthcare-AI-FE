const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    // 1. Get token
    const loginRes = await axios.post('http://localhost:5265/api/auth/login', {
      email: 'thachhoang2548@gmail.com',
      password: 'Password123!'
    });
    const token = loginRes.data.data.token;
    console.log("Token:", token.substring(0, 20) + "...");

    // 2. Get baby profiles
    const profilesRes = await axios.get('http://localhost:5265/api/baby', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const babyId = profilesRes.data.data[0].id;
    console.log("Baby ID:", babyId);

    // 3. Get daily menu
    const menuRes = await axios.get(`http://localhost:5265/api/baby/${babyId}/menu/daily`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    fs.writeFileSync('menu_debug.json', JSON.stringify(menuRes.data, null, 2));
    console.log("Menu written to menu_debug.json");
    
    // 4. Get recipes from DB to see what titles exist
    const recipesRes = await axios.get(`http://localhost:5265/api/recipes/my?category=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    fs.writeFileSync('recipes_debug.json', JSON.stringify(recipesRes.data, null, 2));
    console.log("Recipes written to recipes_debug.json");

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
