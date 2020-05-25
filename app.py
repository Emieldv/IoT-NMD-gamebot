from sense_hat import SenseHat
#from Naked.toolshed.shell import execute_js, muterun_js
from firebase_admin import credentials, firestore
import sys
import firebase_admin
import threading

COLLECTION = 'Discord'
DOCUMENT = 'userInfo'

# Firebase
cred = credentials.Certificate('./iot-eindproject-firebase-adminsdk-jxtfi-69fb32dd3c.json')
firebase_admin.initialize_app(cred)

#success = execute_js('bot.js')
#if success:

#else:
   #print('mislukt')

def update_sensehat(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:
        doc_readable = doc.to_dict()
        print(doc_readable)

        avatar = pi_ref.get().to_dict()['avatar']
        # Hier moet de functie komen om de avatar op de sensehat te plaatsen

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
