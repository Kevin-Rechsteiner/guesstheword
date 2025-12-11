const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.RAILWAY_PUBLIC_DOMAIN, process.env.RAILWAY_STATIC_URL]
    : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));