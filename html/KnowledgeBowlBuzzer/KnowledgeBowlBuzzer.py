# This is a small program written by H. Ryan Jones (hryanjones@gmail.com) with
# the purpose of serving as a buzzer for a Knowledge Bowl type competition.
# It waits for certain keypresses (some are designated for each team, see below) and
# then gives that team a predetermined amount of seconds to answer the question.
# The administrator of the questions uses the two main mouse buttons to control
# game flow:
    # The left mouse button opens & closes answering sessions
    # The right mouse button will pause during a team countdown
#
# Note that this was written using Python 3.1.2 (not the often used 2.7), I quickly tried 
# and failed to make it compatible in both, but may try again at another date.
# Also, one thing that I know breaks this program is if someone presses and
# holds on one of the keyboards.
# 
# This software is distributed under the GNU General Public License 3 which is available in full text
# at this link  http://www.gnu.org/copyleft/gpl.
# Some brief information is available at http://en.wikipedia.org/wiki/GNU_General_Public_License#Terms_and_conditions
# Generally this means you are able to copy, use, modify, and even sell this software 
#
# A source I used for how to get keypresses is here   http://www.daniweb.com/forums/thread115282.html#

import tkinter as tk             # this is the GUI module that allows the simple window to be built
from tkinter.constants import *  # this allows the root keybindings at the end of the code
import time as t
#import winsound as ws    # if you want to add in sounds mess around with this

#GUIDE TO BUZZER LOCK STATES
# lock = 2 (Buzzer closed, also stops any current countdowns)
# lock = 1 (Buzzer closed while a team counts down)
# lock = 0 (Buzzer open and waiting for a team)


lock = 1
pause = 0 # for pausing while a team is answering so teams in the queue don't come up
queue = [] # teams that are waiting to answer
has_answered = []

def lock_toggle(event):
    global lock
    if lock == 2:
        lock = 0
        root.text.set('Any team may buzz in!')
        label.configure(background='white')
    elif lock == 1 or lock == 0:
        lock = 2
        root.text.set('BUZZER CLOSED!')
        label.configure(background='red')
    print('lock_toggle set to %s' % lock)
##    print 'lock_toggle set to %s' % lock

    
def answering():
    global has_answered
    global queue
    global lock
    global pause
    pause = 0
    lock = 1
    print('ANSWERING HAS BEGUN')
##    print 'ANSWERING HAS BEGUN'
    while queue:
        print('the current queue is %s' % queue)
##        print 'the current queue is %s' % queue
        team = queue.pop(0)
        pause = 0
        has_answered.append(team)
        label.configure(background=team)
        secs = 15                ################## TIME FOR EACH TEAM TO ANSWER AFTER THEY'VE BUZZED IN
        while secs and lock == 1 and not pause:
            if queue: extra_string = '\n' + str(queue)[1:-1] + ' coming next'
            else: extra_string = ''
            root.text.set('Team %s has \n%s seconds to answer%s' % (team,secs,extra_string))
            label.update()
            t.sleep(1)
            secs -= 1
##            print(secs)
##            print secs
        while lock == 1 and pause:
            root.text.set('PAUSED')
            label.update()
            t.sleep(0.5)
        if not secs:
            root.text.set('FAIL!')
            label.configure(background='orange')
            label.update()
            t.sleep(1) # wait for a sec so people can see the FAIL screen
    has_answered = []  # reset teams that have answered
    lock_toggle(1)

def pause_toggle(event):
    global pause
    if pause == 0:   pause = 1
    elif pause == 1: pause = 0
    print('pause set to %s' % pause)
##    print 'pause set to %s' % pause


def keypress(event):
    global has_answered
    team = ''
    if event.keysym == 'Escape': # allow the program to be quit at any time with ESC
        root.destroy()
    x = event.char
##    print x
    if x in   ['1','x','X','6',',','=','8','3']: team = 'blue'  ###############BLUE TEAM BUTTONS
    elif x in ['2','c','C','-','.','9']: team = 'green'         ##############GREEN TEAM BUTTONS
    elif x in ['z','Z','5','m','M','0','7']: team = 'yellow'    #############YELLOW TEAM BUTTONS

    print('\t' + x + 'TEAM %s' % team )


    if team and lock < 2:
        print('%s has answered' % has_answered)
##        print '%s has answered' % has_answered
        if team not in has_answered and team not in queue:
            queue.append(team)
            print('%s team has been added to the queue' % team)
##            print '%s team has been added to the queue' % team
            if not lock: answering() # start the answering queue if buzzer's open
            
            

root = tk.Tk()
root.text = tk.StringVar()
root.bgcolor = tk.StringVar()
root.bind_all('<Key>',keypress)
root.bind('<Button-1>',lock_toggle)
root.bind('<Button-3>',pause_toggle)
label = tk.Label(root, bg='red', fg='black', textvariable=root.text, font=('Helvetica',45), padx=300, pady=400)
label.pack(fill=BOTH, expand=1)
root.mainloop()
toggle_buzzer(1)
 
