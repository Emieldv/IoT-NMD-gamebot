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

# Define the credentials using the service account
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Define the ref point with collection
col_query = db.collection('gameBot')
docs = col_query.stream()

users_ref = db.collection('gameBot')
docsFirst = users_ref.stream()

#
# Make arrays and convert images
#

# Arrays with picture and names
avatarArray = []
nameArray = []
idArray = []

# declare arrayindex
arrayIndex = 0

# Convert image to 8x8 image
def convertImage(avatar):
    response = requests.get(avatar)
    img = Image.open(BytesIO(response.content))
    imgSmall = img.resize((8,8), resample=Image.BILINEAR)

    rgb_img = imgSmall.convert('RGB')

    avatarArray.append(rgb_img)

# Get all the profiles in database
for doc in docsFirst:
    avatar = doc.to_dict().get('avatar')
    name = doc.to_dict().get('nickname')
    steamId = doc.to_dict().get('id')

    nameArray.append(name)
    idArray.append(steamId)
    convertImage(avatar)

avatarArray = avatarArray[:-1]
nameArray = nameArray[:-1]
idArray = idArray[:-1]

# Get newly added profile
def on_snapshot(col_snapshot, changes, read_time):
    for doc in col_snapshot:
        avatar = doc.get('avatar')
        name = doc.get('nickname')
        steamId = doc.get('id')
    convertImage(avatar)
    nameArray.append(name)
    idArray.append(steamId)

        
    callback_done.set()
    print(avatarArray)
    print(nameArray) 
    print(idArray) 

    showLastProfile()   

doc_watch = col_query.on_snapshot(on_snapshot)

# Declare senseHat
sense = SenseHat()
sense.set_imu_config(False,False,False)
sense.clear()

# Show the name of the profile
def showNameMessage():
    sense.show_message(nameArray[arrayIndex], scroll_speed=0.03)
    # sense.set_pixels(image_pixels)

# Show last picture added
def showLastProfile():

    global arrayIndex
    arrayIndex = len(avatarArray) - 1
    image_pixels = list(avatarArray[arrayIndex].getdata())

# Show profile nickname and picture
def showProfile():

    image_pixels = list(avatarArray[arrayIndex].getdata())
    # sense.show_message(nameArray[arrayIndex], scroll_speed=0.03)
    sense.set_pixels(image_pixels)

try:
    while True:
        # Before interacting with joystick --> show photo of last profile in array
        showProfile()

        # Describe every event when interacting with joystick
        for event in sense.stick.get_events():
            #When joystick is pressed left or right change arrayindex and display image
            if event.action == "pressed":
                if event.direction == "right":
                    if (arrayIndex == len(avatarArray) - 1 ):
                        arrayIndex = 0
                    else:
                        arrayIndex += 1
                    showProfile()
                if event.direction == "left":
                    if (arrayIndex <= 0):
                        arrayIndex = len(avatarArray) - 1
                    else:
                        arrayIndex -= 1
                    showProfile()
                # When joystick is pressed down send --> steamid to firestore
                if event.direction == "middle":
                    data = {
                        'id' : idArray[arrayIndex]
                    }

                    db.collection('senseProfile').document('Last').set(data)
                    # show the name of the profile sent to firestore
                    showNameMessage()


except (KeyboardInterrupt, SystemExit):
    print('Programma sluiten')
finally:
    print('Opkuisen van de matrix')
    sense.clear()
    sys.exit(0)