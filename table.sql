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