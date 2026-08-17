const mongoose = require('mongoose');
const User = require('./server/model/User');
require('dotenv').config({ path: './server/.env' });

async function checkToken() {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
    const user = await User.findOne();
    if (user && user.pi360Data) {
        console.log("pi360Data keys:", Object.keys(user.pi360Data));
        if (user.pi360Data.token) console.log("Has token!");
        else if (user.pi360Data.jwt) console.log("Has jwt!");
        else if (user.pi360Data.data?.token) console.log("Has data.token!");
        else if (user.pi360Data.student && user.pi360Data.student[0]?.token) console.log("Has student.token!");
        else console.log("No obvious token key found in pi360Data.");
    }
    process.exit(0);
}
checkToken();
