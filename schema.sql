create table if not exists all_movies(
     id serial primary key ,
     title varchar (255),
     overview varchar (10000),
     poster_path varchar(1000),
     release_date integer
);


create table if not exists favorite(
     id serial primary key,
     movie_id integer,
     title varchar (255),
     overview varchar (10000),
     poster_path varchar (1000),
     release_date varchar (255),
     comment varchar (10000)
)

-- insert into all_movies (title , overview , poster_path , release_date) values ('django',
-- 'anything anything anything anything anything anything anything ' , 'http://google.com.png',2020
-- )