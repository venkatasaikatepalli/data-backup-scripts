# Data Backup Scripts - MSSQL

This repository contains scripts for backing up MSSQL databases.

## Prerequisites
- Node.js v18.x

## Cloning the Repository
To clone only the MSSQL folder, use the following commands:

```bash
git clone --depth 1 https://github.com/venkatasaikatepalli/data-backup-scripts.git
cd data-backup-scripts
git sparse-checkout init --cone
git sparse-checkout set mssql
```

## Installing Dependencies
After cloning the repository, navigate to the mssql folder and run the following command to install dependencies:
```
npm install
```

## Running the Export Script
To run the export script, use the following command:
```
npm run export
```
