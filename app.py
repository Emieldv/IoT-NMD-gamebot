import firebase_admin
from firebase_admin import credentials, firestore, db

from sense_hat import SenseHat
import sys
import threading
import requests
from io import BytesIO
import time
import PIL
from PIL import Image
import os

#
# Firebase
#blabla

# Define the credentials using the service account
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Define the ref point with collection
users_ref = db.collection('gameBot')
docs = users_ref.stream()

avatarArray = []

for doc in docs:
    avatars = doc.to_dict().get('avatar')
    avatarArray.append(avatars)

#
#senseHat
#
sense = SenseHat()
sense.set_imu_config(False,False,False)
sense.clear()

arrayIndex = 0


# Function to convert and show avatar
# Get the 64 pixels you need
while True:
    
    for event in sense.stick.get_events():
        if event.action == "pressed":
            if event.direction == "right":
                if (arrayIndex == len(avatarArray) - 1 ):
                   arrayIndex = 0
                else:
                    arrayIndex += 1
                    print(arrayIndex)
            if event.direction == "left":
                if (arrayIndex <= 0):
                    arrayIndex = len(avatarArray) - 1
                else:
                    arrayIndex -= 1
                    print(arrayIndex)
        
        response = requests.get(avatarArray[arrayIndex])
        img = Image.open(BytesIO(response.content))
        imgSmall = img.resize((8,8), resample=Image.BILINEAR)

        rgb_img = imgSmall.convert('RGB')
        image_pixels = list(rgb_img.getdata())
        sense.set_pixels(image_pixels)