#!/bin/sh
time_stamp=$(date +%Y-%m-%d-%T)
backup_folder="~/backups/${time_stamp}" # backup folder to dump sql data
s3_bucket="<s3_bucket_name>" # backup folder to dump sql data
sudo mkdir -p backup_folder
sudo chown 777 backup_folder
cd backup_folder
sudo mysqldump --user=<username> --password=<password> --host=localhost <database_name> >"${time_stamp}"backup.sql

# upload to s3 bucket
aws s3 cp backup_folder s3_bucket/${time_stamp}

# upload to git
cd backup_folder
git add .
git commit -m "${time_stamp}"
git push <repo_url or origin> <branch_name>