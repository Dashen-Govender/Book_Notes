CREATE TABLE books (
	coverid int NOT NULL PRIMARY KEY, 
	olid VARCHAR(20) NOT NULL,
	title VARCHAR(250),
	author VARCHAR(250),
	review VARCHAR(250),
	rating INT,
	revisionDate DATE
);

INSERT INTO books 
VALUES (1, 'OL24221103M', 'Survival of the Fittest', 'Jonathan Kellerman', 'This book was a great read.', 8, '2010-03-11'),
	   (3, 'OL27181978M', 'The Cat in the Hat', 'Dr. Seuss', 'I enjoyed the adventures of how far my imagination would take me reading this book.', 7, '2014-05-10'),
	   (8, 'OL1403467M', 'Prince Caspian', 'C.S. Lewis', 'This book is a great wander and it was fun to read.', 9, '2013-09-21'),
	   (21, 'OL32360751M', 'Julius Caesar', 'Shakespeare', 'This book is a great poetic master piece and a good study as well.', 8, '2017-10-01'),
       (28, 'OL32009549M', 'The Hobbit', 'J R R Tolkien ', 'The Hobbit is an adventures and mystical read. There are a lot of elements and it really stirs the imagination.', 10, '2020-03-14');

CREATE TABLE books2 (
	IDName VARCHAR(50) NOT NULL,
	IDValue VARCHAR(20) NOT NULL,
	OLKEY VARCHAR(50) NOT NULL,
	CoverID INT NOT NULL
);