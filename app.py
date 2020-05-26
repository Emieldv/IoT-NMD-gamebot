from sense_hat import SenseHat
from firebase_admin import credentials, firestore
import sys
import firebase_admin
import threading
import requests
from io import BytesIO
import time
import PIL
from PIL import Image
import os

COLLECTION = 'Discord'
DOCUMENT = 'userInfo'

# Firebase
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')
firebase_admin.initialize_app(cred)

def update_sensehat(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:
        doc_readable = doc.to_dict()
        print(doc_readable)

        avatar = pi_ref.get().to_dict()['avatar']
        print(avatar)

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
        time.sleep (3)

        sense.clear()

# connect firestore
db = firestore.client()
pi_ref = db.collection(COLLECTION).document(DOCUMENT)
pi_watch = pi_ref.on_snapshot(update_sensehat)

#senseHat
sense = SenseHat()
sense.set_imu_config(False,False,False)
sense.clear()

while True:
	pass
