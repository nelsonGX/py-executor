from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from execute_code import execute_code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def default():
    return {"message": "Hello World"}

class GenerateData(BaseModel):
    code: str

@app.post("/exec_code")
async def generate(data: GenerateData):
    """
    Execute the provided code in a restricted environment.
    """
    try:
        result = execute_code(data.code)
        print(f"User executed code: {data.code}, result: {result}")
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}