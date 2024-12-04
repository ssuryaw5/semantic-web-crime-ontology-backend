import express from 'express';
import cors from "cors";
import { REPOSITORY_NAME } from './constants.js';

const app = express();

const whitelist = process.env.CORS_WHITELIST.split(',');

const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true); // allow requests
        }else{
            callback(
                new ApiError(403, "CORS :: app.js :: NOT ALLOWED BY CORS")
            );
        }
    }
}

// MiddleWares
app.use(cors(corsOptions));
app.use(express.json({limit: "16kb"}));

// Routes import
import userRouter from './routes/user.routes.js';

// Route declaration
app.use(`/api/v1/${REPOSITORY_NAME}`, userRouter);

export default app;