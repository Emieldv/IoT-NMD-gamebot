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

callback_done = threading.Event()

#
# Firebase
#blabla

# Define the credentials using the service account
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Define the ref point with collection
col_query = db.collection('gameBot')
docs = col_query.stream()

users_ref = db.collection('gameBot')
docsFirst = users_ref.stream()

avatarArray = []

for doc in docsFirst:
    avatars = doc.to_dict().get('avatar')
    avatarArray.append(avatars)

avatarArray = avatarArray[:-1]

def on_snapshot(col_snapshot, changes, read_time):
    for doc in col_snapshot:
        avatars = doc.get('avatar')
    avatarArray.append(avatars)

        
    callback_done.set()
    print(avatarArray)
doc_watch = col_query.on_snapshot(on_snapshot)


#
#senseHat
#
sense = SenseHat()
sense.set_imu_config(False,False,False)
sense.clear()

arrayIndex = 0
print(avatarArray)


# Function to convert and show avatar
# Get the 64 pixels you need
try:
    while True:
        for event in sense.stick.get_events():
            print(avatarArray)
            if event.action == "pressed":
                if event.direction == "right":
                    if (arrayIndex == len(avatarArray) - 1 ):
                        print(arrayIndex)
                        arrayIndex = 0
                    else:
                        arrayIndex += 1
                        print(arrayIndex)
                if event.direction == "left":
                    if (arrayIndex <= 0):
                        arrayIndex = len(avatarArray) - 1
                        print(arrayIndex)
                    else:
                        arrayIndex -= 1
                        print(arrayIndex)
            
            response = requests.get(avatarArray[arrayIndex])
            img = Image.open(BytesIO(response.content))
            imgSmall = img.resize((8,8), resample=Image.BILINEAR)

            rgb_img = imgSmall.convert('RGB')
            image_pixels = list(rgb_img.getdata())
            sense.set_pixels(image_pixels)

except (KeyboardInterrupt, SystemExit):
    print('Programma sluiten')
finally:
    print('Opkuisen van de matrix')
    sense.clear()
    sys.exit(0)