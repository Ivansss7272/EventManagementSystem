from flask import Flask, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/')
def welcome():
    return jsonify({"message": "Welcome to the Event Management System!"})

def run_server():
    port = os.getenv('PORT', 5000)
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    run_server()