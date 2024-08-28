import cors from "cors";

const allowedOrigins = ['https://blog.sergiomarquez.dev'];

const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins
};

export default cors(corsOptions);
