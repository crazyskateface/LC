#!/bin/bash
set -e
LOGFILE=/home/ubuntu/logs/gunicorn.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
# user /group to run as
USER=root
GROUP=root
ADDRESS=127.0.0.1:3000
cd /home/ubuntu/LC
source /home/ubuntu/.virtualenvs/env/bin/activate
test -d $LOGDIR || mkdir -p $LOGDIR
exec gunicorn_django -w $NUM_WORKERS --bind=$ADDRESS --user=$USER --group=$GROUP --log-file=$LOGFILE 2>>$LOGFILE
