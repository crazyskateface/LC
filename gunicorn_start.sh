#!/bin/bash
set -e
LOGFILE=/home/ubuntu/LC_chat/logs/gunicorn.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=1
# user /group to run as
USER=root
GROUP=root
ADDRESS=127.0.0.1:3000
cd /home/ubuntu/LC_chat/LC/
source /home/ubuntu/Envs/venv/bin/activate
test -d $LOGDIR || mkdir -p $LOGDIR
exec gunicorn LC.wsgi -w $NUM_WORKERS --bind=$ADDRESS --log-file=$LOGFILE 2>>$LOGFILE
