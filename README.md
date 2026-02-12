# Welcome to PINKVOMIT, a return to the old web!

This is the development repo for PINKVOMIT.


# Documentation

## Installation

To run this project you will need the following locally installed:

### Required

* Node and NPM 
* MySql 

### Optional but recommended 
* An sql workbench (I use dbeaver, it's universal and works with MySql, it's also free)

### Guide

1) clone the git repo to your local machine
2) in your terminal, navigate to the repo and run `npm install`
4) create a local mysql database (setting up your database can either be done through the CLI or through a GUI like dbeaver)
5) create a database user that can access your local database using a password
6) run `npm run migrations refresh` to run all migrations bringing your database up to date (DO NOT USE old.schema.sql, and see the [MySql](#MySql) section for a warning about the `refresh` command)
7) create a .env file following the format of the .env.example file 

## Running

To run the project simply run `npm run dev` while in the project directory and go to [localhost:3000](http://localhost:3000/) in your web browser

## Contributing

When contributing changes:

1) Create a new local branch, make sure it is unique from other existing branch names
2) Make changes and commit them to your feature branch (please make small commits with descriptive commit messages)
3) Push your changes to the repo
4) Create a pull request to pull your changes into either main or another feature branch if it's a part of a larger featureset still in development
5) Answer questions, make changes, etc until your changes are either rejected or pulled into the requested branch
