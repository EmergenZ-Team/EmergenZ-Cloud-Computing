# API-EmergenZ

These are all the APIs that will be used in the EmergenZ app project. The API is made to run these functions :
- Handle register and login for user
- Handle user profile data in the app
- Handle the news/article in the app
- Handle the news recommendation for users based on what they have read.

## **1. List API**

### Register API
This API used to create users account
```
URL: register/
Method: POST
Request Body :
{
    username,
    email,
    password
}
Success Response :
{
  "error": false,
  "message": "User Created"
}
```

### Login API
This API used to validate user login attempt
```
URL: login/
Method: POST
Request Body:
{
    email,
    password
}
Success Response:
{
    "error": false,
    "message": "{{email}} login success",
    "data": {
        "userId": "User Id",
        "name": "Username",
        "token": "Token for authorization"
    }
}
```

### User Detail API
This API used to create user profile in the app
```
URL: add_detail_user/
Method: POST
Headers:
    Content-Type: multipart/form-data
    Authorization: Bearer <token>
Request Body:
{
    email,
    name,
    nik,
    gender,
    province,
    city,
    address,
    image
}
Success Response:
{
    "error": false,
    "message": "{{name}} data has been created",
    "link": "link KTP image if needed"
}
```

### User Data API
This API used to get user profile data
```
URL: user_data/{{email}}
Method: GET
Headers:
    Authorization: Bearer <token>
Success Response:
{
    "error": false,
    "message": "{{email}} found",
    "data": 
    {
        "email": "user email",
        "name": "user fullname",
        "gender": "user gender",
        "nik": "user ID number",
        "province": "user province",
        "city": "user city",
        "address": "user address",
        "image_url": "user ID image url"
    }
}
```

### Personalized News API
This API used to give the user news/article recommendation based on the article they have seen.
```
URL: news/{{email}}
Method: GET
Headers:
    Authorization: Bearer <token>
Response:
{
    "error": false,
    "message": "News for {{email}}",
    "data": 
    [
        {
            "news_id": news id,
            "title": "news title",
            "author": "news author",
        	"category": "news category",
        	"image": "news image url",
        },
        {
            "news_id": news id,
            "title": "news title",
            "author": "news author",
        	"category": "news category",
        	"image": "news image url",
        },
        ... 
    ]
}
```

### News Content and Add History API
This API used to give the content of the news that user pick and also add that access to history for the recommendation 
```
URL: news/{{news_id}}
Method: POST
Headers:
    Authorization: Bearer <token>
Request Body:
{
    email
}
Response:
{
    "error": false,
    "message": "News history record added and news retrieved",
    "data": 
    [
        {
            "news_id": news id,
            "title": "news title",
            "author": "news author",
            "content": "news content",
            "category": "news category",
            "image": "news image url",
            "upload_date": "news upload date",
        }
    ]
}
```


## 2. Service Needed
To deploy this API, we need use some services in the Cloud (for this, we deploy it in Google Cloud Platform)
- `Cloud SQL with MySQL`. This service will be used to store all app data in the database using MySQL. You can check it in [here](https://cloud.google.com/sql/docs/features).
- `App Engine`. This service will be used to deploy our Node.js app. The Node.js app is the main app for the API. This is **optional** and you also can deploy it with cloud run. You can check it in [here](https://cloud.google.com/appengine/docs/the-appengine-environments).
- `Cloud Run`. This service will be used to deploy our Flask app where we deploy the machine learning model for the recommendation system. You can check it in [here](https://cloud.google.com/run/docs/overview/what-is-cloud-run)
- `Cloud Storage`. This service will be used to store all image related to the app, such as user image and news image. You can check it in [here](https://cloud.google.com/storage/docs/introduction)


## 3. Database

<p align="center">
  <img src="https://github.com/Azhar275/API-EmergenZ/blob/main/Images/database.png" />
</p>

The database consists of 4 tables :
- `account` table. It is used to store user account information, like email and password. it has 4 fields:
  - user_id VARCHAR(255)
  - email VARCHAR(255)
  - username VARCHAR(255)
  - password VARCHAR(255)
- `user` table. It is used to store user profile information, such as name, gender, nik, etc. It has 9 fields:
  - user_id INT(11)
  - email VARCHAR(255)
  - name VARCHAR(255)
  - gender VARCHAR(1)
  - nik VARCHAR(16)
  - province VARCHAR(255)
  - city VARCHAR(255)
  - address VARCHAR(255)
  - image_url VARCHAR(255)
- `news` table. It is used to store all the news data for the app. it has 7 fields:
  - news_id INT(11)
  - title TEXT
  - author VARCHAR(255)
  - content TEXT
  - category VARCHAR(255)
  - image TEXT
  - upload_date DATETIME
- `history` table. It is used to store user news history. The data in this table will be used for the news recommendation. it has 3 fields:
  - email VARCHAR(255)
  - news_id INT(11)
  - time TIMESTAMP

To create the table, we can use sql query below, or run the sql file in this repository
```
CREATE TABLE account(
    user_id varchar(255) NOT NULL primary key,
    email varchar(255) not null unique,
    username varchar(255) not null,
    password varchar(255) not null
);

create table user(
    user_id int primary key auto_increment,
    email varchar(255) not null unique,
    name varchar(255) not null, 
    gender varchar(1) not null, 
    nik varchar(16) not null unique, 
    province varchar(255) not null, 
    city varchar(255) not null, 
    address varchar(255) not null,
    image_url varchar(255) not null,
    foreign key(email) references account(email)
);

create table history(
    email varchar(255),
    news_id int,
    time timestamp default current_timestamp(),
    foreign key(email) references user(email),
    foreign key(news_id) references news(news_id)
);

create table news(
    news_id int primary key auto_increment,
    title text not null,
    author varchar(255) default "Admin",
    content text not null,
    category varchar(255) not null,
    image text not null,
    upload_date DATETIME DEFAULT current_timestamp()
);
```


## 4. Cloud Architecture and Workflow
The app architecture in the cloud will be like this :

![Image](https://github.com/Azhar275/API-EmergenZ/blob/main/Images/cloud.png "Cloud Architecture Image")

### Workflow
- `Register`: User register account with API &rarr; save the account data in Cloud SQL &rarr; User send the profile data &rarr; ID (KTP) image stored in Cloud SQL &rarr; user profile stored in Cloud SQL.
- `Login`: User input email and password &rarr; the Cloud SQL will check the email if exist &rarr; the App Engine will validate if the password is right &rarr; If right, the user will be directed to homepage.
- `News Recommendation`: User login &rarr; the cloud SQL will collect the user news history &rarr; App Engine will send it to the Cloud Run to get the user news recommendation &rarr; Cloud Run response with the recommendation &rarr; App Engine sends it to Cloud SQL to find the recommended news &rarr; app engine will send the news back to user.
- `Access news` : User click on news &rarr; New record will be added to news access history &rarr;Cloud SQL send the news content to App Engine &rarr; The App Engine will sends the content back to user.



## 5. How to Run The App


### 5.1 Create the cloud storage bucket
This bucket will be used to save the image that has been uploaded by the user.
1. Open your Google Cloud console
2. Go to cloud storage and make a storage bucket
3. Make sure the bucket is accessible through the internet so we won't have problem when we want to get the image
4. Make a service account in IAM that has permission to store file in the bucket
5. Make a key for the service account and then store it as json. The key will be used in the node.js 

### 5.2 Run the Node.js app

1. Make sure you already install the Node.js.
2. Create the project using `npm init` inside the project directory.
3. run `npm install <package name>` for these package:
   - @google-cloud/storage
   - bcrypt
   - body-parser
   - dotenv
   - express
   - jsonwebtoken
   - multer
   - mysql
   - nodemon (optional)
4. Make the `server.js` and `routes.js` for the app. You can see the example in this repository.
5. Make a javascript code to handle the image upload. You can see the example in the `imgUpload.js` in folder modules in this repository.
6. Don't forget to add the service account key and `.env` file to the Node.js project. The service account will be used to upload the image and the `.env` will be used to store access token for the authorization.
7. After finished, we can add `"start"` script in the package.json. The script will be like this `"start": "node server.js"`.
8. Now we can run the app by using command `npm run start`.


### 5.3 Run the Flask app
Flask will be used to deploy the machine learning model that give us the news recommendation for the user.
1. Make sure you already install Flask in your computer. You can see how to do it [here](https://flask.palletsprojects.com/en/2.3.x/installation/).
2. After that, create the python file as the main app for the project. We can called it `main.py`.
3. We also need to install Tensorflow and nltk. We can do this by using `pip install tensorflow` and `pip install nltk`.
4. After that, we need to download stopwords for the text processsing inside the app. We can download it from the code, for example `nltk.download('popular')`, or download it manually from [here](https://www.nltk.org/nltk_data/) and then store it inside a folder name nltk.
5. We also need to store the keywords that will be used in the text processing. The keywords can be stored inside a python file, like `keywords.py`, and then to use it we only need to import it.
6. Inside the `main.py`, we can create the route or url for the API. You can see the example in the API-Flask folder.
7. After finished, we can run the app by using `flask --app <python file> run` command. For example, if the file called main, then the command will be `flask --app main run`



