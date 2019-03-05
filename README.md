# data-backup-scripts
this repo contains server scripts to backup different databases to storage buckets or servers

# List of backup scripts
- [mysql](https://github.com/venkatasaikatepalli/data-backup-scripts/blob/master/mysql/)
- [postgres](https://github.com/venkatasaikatepalli/data-backup-scripts/blob/master/postgres/)

# steps to add cronjob
- crontab -e 
- 0 1,13 * * * bash -c "/home/ubuntu/backup.sh > /home/ubuntu/backup.log"