import firebase_admin
from firebase_admin import credentials, db

from sense_hat import SenseHat
import sys
import threading
import requests
from io import BytesIO
import time
import PIL
from PIL import Image
import os

# Firebase
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')

firebase_admin.initialize_app(cred, {
    'databaseURL' : 'https://iot-eindproject.firebaseio.com/'
})

ref = db.reference('users')
snapshot = ref.order_by_child('-M8GA0Nym0jx_WjSe9JA').get()
print(snapshot)

avatarArray = []

#senseHat
sense = SenseHat()
sense.set_imu_config(False,False,False)
sense.clear()

"""
# Function to convert and show avatar
# Get the 64 pixels you need
basewidth = 8
response = requests.get(avatar)
img = Image.open(BytesIO(response.content))
wpercent = (basewidth / float(img.size[0]))
hsize = int((float(img.size[1]) * float(wpercent)))
img = img.resize((basewidth, hsize), PIL.Image.ANTIALIAS)

# Generate rgb values for image pixels
rgb_img = img.convert('RGB')
image_pixels = list(rgb_img.getdata())
sense.set_pixels(image_pixels)
time.sleep (8)

sense.clear()

