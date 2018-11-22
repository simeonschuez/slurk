#!/bin/env python

import argparse
import sys
import os
import json
import time

from random import randint
from socketIO_client import SocketIO, BaseNamespace

chat_namespace = None
users = {}
self_id = None

class Game:

    def __init__(self):
        self.images = False
        self.pointer = False
        self.curr_img = False
        self.started = False
        self.json_path = False
        self.img_path = "/static/images/"
        self.audio_path = "/static/audio/"

    def get_json(self, dir):
        cwd = os.getcwd()+"/"
        # find json files in directory
        for file in [f for f in os.listdir(cwd+dir) if f.endswith(".json")]:
            path = os.path.join(cwd+dir,file)
            with open(path) as raw_jfile:
                jfile = json.load(raw_jfile)
                if jfile["used"] == False:
                    self.images = jfile
                    self.json_path = path
                    self.started, self.pointer = True, 0
                    return
                print("File {name} was already used.".format(name=file))
        self.images = False
        self.json_path = False

    def get_image(self):
        for entry in self.images:
            if entry == str(self.pointer):
                self.curr_img = self.images[entry]
                return
        self.curr_img = False # if self.pointer exeeds the highest id

    def next_image(self):
        self.pointer += 1
        self.get_image()

    def click_on_target(self, click):
        bb = self.curr_img["bb"]

        x = int(bb[0])
        y = int(bb[1])
        width = int(bb[2])
        height = int(bb[3])

        if int(click['x']) in range(x, x+width+1) and int(click['y']) in range(y, y+height+1):
            return True
        else:
            return False

game = Game()

def add_user(room, id):
    global users
    room = int(room)
    id = int(id)
    print("adding user", id, "to room", room)
    if room == 1:
        return
    if room not in users:
        users[room] = []
    users[room].append(id)



class ChatNamespace(BaseNamespace):
    @staticmethod
    def on_joined_room(data):
        global users, self_id

        self_id = data['self']['id']

        for user in data['users']:
            if user['id'] != self_id:
                add_user(data['room']['id'], user['id'])

    @staticmethod
    def on_status(data):
        global users
        print("status:", data)

        if data['user']['id'] != self_id:
            add_user(data['room']['id'], data['user']['id'])

    def on_new_task_room(self, data):
        print("hello!!! I have been triggered!")
        print("new task room:", data)
        if data['task']['name'] != 'meetup':
            return

        room = data['room']
        print("Joining room", room['name'])
        self.emit('join_task', {'room': room['id']})
        self.emit("command", {'room': room['id'], 'data': ['listen_to', 'start_game']})
        self.emit("command", {'room': room['id'], 'data': ['listen_to', 'skip_image']})

    def on_start_game(self,data):
        """
        prepare & start game:
        import json files, set first image, send audio files to client
        """
        # check if game was already started
        if game.started == True:
            self.emit("text", {"msg": "Game already started!", 'room': data['room']['id']})
            return
        # assign initial values
        game.get_json("app/static/json/")
        if game.images == False:
            print ("no json files left in directory")
            return
        game.get_image()
        # mark file as used
        with open(game.json_path, 'w') as outfile:
            game.images["used"] = True
            json.dump(game.images, outfile, sort_keys=True, indent=1)
        self.emit("text", {"msg": "Game started!", 'room': data['room']['id']})
        # set first image
        self.emit('command', {'room': data['room']['id'],
                              'data': ['new_image', game.img_path+game.curr_img["image_filename"]]})
        # send audio files to client
        self.emit('transferFilePath', {'type':'audio','file':game.audio_path+game.curr_img['audio_filename'], 'room': data['room']['id']})

    def on_new_image(self,data):
        room = data['user']['latest_room']['id']
        if game.curr_img:
            # if game is running: overlay is created if new image is set
            self.emit("text", {"msg": "#nodisplay# Click the button to continue.", 'room': room})

    #def on_mouse_move(self,data):
       #print ("mouse_move: ", data["coords"], data["coords_prev"], data["user"]["name"])

    def on_skip_image(self,data):
        """
        skip image, set new image if possible, otherwise quit game
        """
        room = data['room']['id']
        self.emit("text", {"msg": "Next image", 'room': room})
        game.next_image()
        if game.curr_img:
            self.emit('command', {'room': room,
                                  'data': ['new_image', game.img_path+game.curr_img["image_filename"]]})
            self.emit('transferFilePath', {'type':'audio','file':game.audio_path+game.curr_img['audio_filename'], 'room': room})
        else:
            # return message if no images are left
            self.emit("text", {"msg": "No images left", 'room': room})
            game.started = False
            #thank you image
            self.emit('command', {'room': room,
                                  'data': ['new_image', "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/A_Businessman_Holding_A_Thank_You_Sign.svg/202px-A_Businessman_Holding_A_Thank_You_Sign.svg.png"]})

    def on_mouse_position(self, data):
        """
        on mouse click:
        check if client clicked on button
            if so: perform corresponding action
            if not: check if client clicked on target.
                if so: set new image,
                otherwise send feedback message
        """
        if data['type'] == 'click':
            room = data['user']['latest_room']['id']
            pos = data['coordinates']
            print("mouse click: ({x_pos}, {y_pos}), {user_name}".format(x_pos=pos['x'],y_pos=pos['y'],user_name=data['user']['name']))
            if not game.curr_img: # if image is clicked before game was started
                return
            if data['element']== "#overlay-button":
                # display target description and return
                self.emit("text", {"msg": "#nodisplay# Please click on the {d_name}.".format(d_name=game.curr_img["refexp"]), 'room': room})
            elif game.click_on_target(pos):
                self.emit("text", {"msg": "#nodisplay# Correct!", 'room': room})
                time.sleep(0.3)
                game.next_image()
                if game.curr_img:
                    self.emit('command', {'room': room,
                                          'data': ['new_image', game.img_path+game.curr_img["image_filename"]]})
                    self.emit('transferFilePath', {'type':'audio','file':game.audio_path+game.curr_img['audio_filename'], 'room': room})
                else: # if no images are left
                    self.emit("text", {"msg": "No images left! Congratulations!", 'room': room})
                    game.started = False
                    #thank you image
                    self.emit('command', {'room': room,
                                        'data': ['new_image', "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/A_Businessman_Holding_A_Thank_You_Sign.svg/202px-A_Businessman_Holding_A_Thank_You_Sign.svg.png"]})
            else:
                # display message if click was off target
                self.emit("text", {"msg": "#nodisplay# Try again!", 'room': room})

class LoginNamespace(BaseNamespace):
    @staticmethod
    def on_login_status(data):
        global chat_namespace
        if data["success"]:
            chat_namespace = socketIO.define(ChatNamespace, '/chat')
        else:
            print("Could not login to server")
            sys.exit(1)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Example MultiBot')
    parser.add_argument('token',
                        help='token for logging in as bot ' +
                        '(see SERVURL/token)')
    parser.add_argument('-c', '--chat_host',
                        help='full URL (protocol, hostname; ' +
                        'ending with /) of chat server',
                        default='http://localhost')
    parser.add_argument('-p', '--chat_port', type=int,
                        help='port of chat server', default=5000)
    args = parser.parse_args()

    with SocketIO(args.chat_host, args.chat_port) as socketIO:
        login_namespace = socketIO.define(LoginNamespace, '/login')
        login_namespace.emit('connectWithToken', {'token': args.token, 'name': "Image_Click_Bot"})
        socketIO.wait()
