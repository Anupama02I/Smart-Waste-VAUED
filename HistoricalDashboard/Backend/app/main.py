from fastapi import FastAPI
from app.routes import data, chatbot
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(data.router)
app.include_router(chatbot.router)

@app.get("/")
def root():
    return {"message": "Backend is running"}
