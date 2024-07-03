import os

from flask import Flask
from routes import api_blueprint

if not os.path.exists('saves'):
    os.makedirs('saves')

app = Flask('BrickBrain')
app.register_blueprint(api_blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
