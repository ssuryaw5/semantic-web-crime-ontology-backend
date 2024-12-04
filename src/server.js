import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env',
})

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.log("%ERROR% : ", err);
        throw err;
    });
    
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server Listening on PORT: ${process.env.PORT}`);
    })
}).catch(() => {
    console.log("%ERROR% in connection to GraphDB !!!: ", err);
})
