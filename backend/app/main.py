from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to InterviewIQ!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}