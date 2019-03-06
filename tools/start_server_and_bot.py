import os
from os.path import abspath, dirname, basename, realpath
import sys
import argparse
import requests
from lxml.html import document_fromstring
import configparser
import subprocess
import signal
import atexit
from time import sleep

parser = argparse.ArgumentParser()
parser.add_argument('bot', nargs='*', help='path to bot file')
parser.add_argument('--log', action='store_true', help='log stdout and stderr from bot files')
args = parser.parse_args()

# get absolute paths for all bot files
bots = [abspath(bot) for bot in args.bot]
files = []

# use dirname twice to move to parent directory of current file (i.e. root folder of slurk)
dir_path = dirname(dirname(realpath(__file__)))
os.chdir(dir_path)

# get secret key from config.ini
config = configparser.ConfigParser()
config.read('config.ini')
secret_key = config['server']['secret-key']

def get_bot_token(name, key):
    """ get a token for connecting a bot """
    url = 'http://127.0.0.1:5000/token'
    s = requests.session()
    r = s.get(url)
    source = document_fromstring(r.content)
    token = source.xpath('//input[@name="csrf_token"]/@value')[0]
    headers = {'Referer': 'http://127.0.0.1:5000/token'}
    data = {'csrf_token': token, 'room': '1', 'task': '2', 'reusable': 'y', 'source': name, 'key': key}
    login_token = s.post(url, data=data, headers=headers).text
    if login_token.endswith('<br />'):
        login_token = login_token[:-6]
    return login_token

if __name__ == "__main__":
    # print basic information
    print ("Directory:",dir_path)
    print ("Bots: ",bots, "\n")
    processes = []

    # start slurk
    print ('starting server')
    server = subprocess.Popen('python {path}/chat.py'.format(path=dir_path), shell=True)

    # add process id to list of running processes
    processes.append(server.pid)
    # pause to allow server to start before adding bots
    sleep(2)

    # start bots
    for i in bots:
        bot_dir = dirname(i)
        bot_filename = basename(i)
        os.chdir(bot_dir)
        token = get_bot_token(bot_filename, secret_key)

        if args.log:
            # write to log file
            logfile = bot_filename[:-3]+".log"
        else:
            # stdout and stderr redirected to /dev/null
            logfile = os.devnull

        print ("\nstarting", i, "\ntoken:", token)
        outfile = open(logfile, "w")
        if outfile not in files:
            files.append(outfile)

        bot_process = subprocess.Popen('python {name} {bot_token}'.format(name=bot_filename, bot_token=token), shell=True, stdout=outfile, stderr=outfile)

        # add process id to list of running processes
        processes.append(bot_process.pid)
        sleep(1)

    # clean up at exit
    def terminate_processes():
        # terminate all processes in list of running processes
        for process in processes[::-1]:
            os.killpg(os.getpgid(process), signal.SIGTERM)
    def close_files():
        # close files
        for file in files:
            file.close()

    # register exit handlers
    atexit.register(terminate_processes)
    atexit.register(close_files)

    # wait for keyboardinterrupt
    signal.pause()
