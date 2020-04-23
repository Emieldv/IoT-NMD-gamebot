# from sense_hat import Sensehat
from Naked.toolshed.shell import execute_js, muterun_js

# sense = Sensehat
# sense.set_rotation(270)

success = execute_js('bot.js')

if success:
    print('het is gelukt')
else:
    print('mislukt')


# try:
#     main()
# except (KeyboardInterrupt, SystemExit):
#     print("programma sluiten")