# ![Logo](images/logo72.png) courses
Courses app - Make buying simple

## Official website
Access to the official website of the project 
https://mprojects.fr/courses/

## Requirements
Require PHP, MySQL, Apache installed (use tools like Wamp or Mamp)
Require specific sql database structure (template provided in course.sql)

## Setup & Run
### Dowload
1. Download Wamp or Mam
2. Clone the repository in the htdocs folder
3. Import the database (you can use phpMyAdmin) with name "course" from course.sql
4. Run the Apache and SQL server and go to "localhost:${portnumber}" in a browser

### Create local account
When first opening the app, you'll be prompted to create an account. You'll need to activate it manually in the database by following these steps :
1. Create your account when prompted. You should be alerted that a mail has been sent to your email (This version bypasses the mail-sending process)
2. Go to your database (e.g. with phpMyAdmin) and open the users table
3. Fing your account and manually set activated field to 1 (default 0)
4. try to connect when within the app