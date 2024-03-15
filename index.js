import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import { password } from "./databasekeys.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "pug");

const API_URL = "https://openlibrary.org/api/books?";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Book Notes",
  password: password,
  port: 5432,
});
db.connect();

let items = [];
let books = [];

// Get a list of books from the library and the books you have already reviewed.

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY coverid ASC");
    const result2 = await db.query("SELECT * FROM books2 ORDER BY idname ASC");
    items = result.rows;
    books = result2.rows;
    res.render("index.ejs", {
      listItems: JSON.stringify(items),
      bookids: JSON.stringify(books),
    });
  } catch (error) {
    console.log(error);
  }
});

// Select a book to review.

app.post("/selectreview", async (req, res) => {
  try {
    const coverid = req.body.Book;
    console.log("coverid: " + coverid);
    const book = books.find((book) => book.coverid === coverid);
    const bookolid = book.idvalue;
    console.log("olid: " + bookolid);
    const result = await axios.get(API_URL, {
      params: {
        bibkeys: "olid:" + bookolid,
        jscmd: "data",
        format: "json",
      },
    });
    const data = result.data;
    for (var key in data) {
      var title = data[key].title;
      if (data[key].authors === undefined) {
        var author = "unknown";
      } else {
        const authors = data[key].authors[0];
        for (key in authors) {
          if (key === "name") {
            var author = authors[key];
          }
        }
      }
    }
    res.render("editor.ejs", {
      coverid: coverid,
      olid: bookolid,
      title: JSON.stringify(title),
      author: JSON.stringify(author),
    });
  } catch (error) {
    console.log(error);
  }
});

// Submit a new review.

app.post("/submitreview", async (req, res) => {
  try {
    const coverid = req.body.mixedid.slice(0, req.body.mixedid.indexOf("/"));
    const olid = req.body.mixedid.slice(req.body.mixedid.indexOf("/") + 1);
    var title = req.body.title.slice(req.body.title.indexOf(":") + 2);
    const author = req.body.author.slice(req.body.author.indexOf(":") + 2);
    const review = req.body.review;
    const rating = req.body.rating;
    const today = new Date();
    items.push({
      coverid: parseInt(coverid),
      olid: olid,
      title: title,
      author: author,
      review: review,
      rating: parseInt(rating),
      revisiondate: today,
    });
    console.log(items);
    await db.query("INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7);", [
      parseInt(coverid),
      olid,
      title,
      author,
      review,
      parseInt(rating),
      today,
    ]);
    console.log("row in database books created.");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Select a reviewed book

app.post("/selectreviewed", async (req, res) => {
  try {
    const coverid = req.body.rBook;
    const book = items.find((item) => item.coverid === parseInt(coverid));
    const olid = book.olid;
    const title = book.title;
    const author = book.author;
    const review = book.review;
    const rating = book.rating;
    res.render("editor.ejs", {
      coverid: coverid,
      olid: olid,
      title: JSON.stringify(title),
      author: JSON.stringify(author),
      review: JSON.stringify(review),
      rating: JSON.stringify(rating),
    });
  } catch (error) {
    console.log(error);
  }
});

// Edit a review.

app.post("/editreview", async (req, res) => {
  try {
    const coverid = req.body.mixedid.slice(0, req.body.mixedid.indexOf("/"));
    const review = req.body.review;
    const rating = req.body.rating;
    const today = new Date();
    for (let i = 0; i < items.length; i++) {
      if (items[i].coverid === parseInt(coverid)) {
        items[i].review = review;
        items[i].rating = parseInt(rating);
        items[i].date = today;
        break;
      }
    }
    console.log(items);
    await db.query(
      "UPDATE books SET review = $1, rating = $2, revisiondate = $3 WHERE coverid = $4",
      [review, parseInt(rating), today, parseInt(coverid)]
    );
    console.log("row in database books updated.");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Delete a review.

app.post("/deletereview", async (req, res) => {
  try {
    const coverid = req.body.mixedid.slice(0, req.body.mixedid.indexOf("/"));
    for (let i = 0; i < items.length; i++) {
      if (items[i].coverid === parseInt(coverid)) {
        items.splice(i);
        break;
      }
    }
    await db.query("DELETE FROM books WHERE coverid = $1;", [
      parseInt(coverid),
    ]);
    console.log("row in database books deleted.");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
