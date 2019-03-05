#/bin/bash
time_stamp=$(date +%Y-%m-%d.%H:%M:%S)
app_directory=/home/ubuntu/inmail-api/inmail_api
backup_directory=/home/ubuntu/backups/$time_stamp
source /home/ubuntu/env/bin/activate # activate python env
source /home/ubuntu/.env # add env configs
mkdir backup_directory # create backup folder
cd $app_directory
python3 $app_directory/manage.py dumpdata > $backup_directory/$time_stamp-backup.json

#upload to s3
/home/ubuntu/.local/bin/aws s3 cp $backup_directory/$time_stamp-backup.json s3://inmailuat-backup-data

# upload to git
cd backup_folder
git add .
git commit -m "${time_stamp}"
git push <repo_url or origin> <branch_name>