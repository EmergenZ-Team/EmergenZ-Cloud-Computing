# API-EmergenZ

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
    "message": "New history record added and news retrieved",
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


## 3. Database Architecture
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


## 4. Cloud Architecture
TBA



## 5. How to Deploy
TBA

