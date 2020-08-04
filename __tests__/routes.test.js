process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const app = require("../app");
const Book = require("../models/book");

describe("Test Routes", () => {
	let b;
	beforeEach(async function () {
		await db.query("DELETE FROM books");
		b = await Book.create({
			isbn: "0691161518",
			"amazon-url": "http://a.co/eobPtX2",
			author: "Matthew Lane",
			language: "english",
			pages: 264,
			publisher: "Princeton University Press",
			title: "Power-Up: Unlocking Hidden Math in Video Games",
			year: 2017,
		});
	});

	describe("GET /books", function () {
		test("get all books", async function () {
			let response = await request(app).get("/books");
			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({ books: [b] });
		});
	});

	describe("GET /books/:id", () => {
		test("get book from isbn", async () => {
			let response = await request(app).get(`/books/${b.isbn}`);
			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({ book: b });
		});

		test("get 404 if isbn is not found", async () => {
			let response = await request(app).get(`/books/2`);
			expect(response.statusCode).toBe(404);
		});
	});

	describe("POST /books", () => {
		test("create a new book", async () => {
			let nb = {
				isbn: "1111111111",
				"amazon-url": "http://a.co/",
				author: "test author",
				language: "english",
				pages: 300,
				publisher: "Princeton University Press",
				title: "new test book",
				year: 2000,
			};
			let resp = await request(app).post("/books").send({ book: nb });

			expect(resp.statusCode).toBe(201);
		});
		test("book won't be added with isbn", async () => {
			let nb = {
				"amazon-url": "http://a.co/",
				author: "test author",
				language: "english",
				pages: 300,
				publisher: "Princeton University Press",
				title: "new test book",
				year: 2000,
			};
			let resp = await request(app).post("/books").send({ book: nb });

			expect(resp.statusCode).toBe(400);
		});
	});
	describe("PUT /books/isbn", () => {
		test("update book from data", async () => {
			b.title = "update title";
			b["amazon-url"] = "http://a.co/eobPtX2";
			let resp = await request(app).put(`/books/${b.isbn}`).send({ book: b });
			expect(resp.statusCode).toBe(200);
			expect(resp.body.book.title).toEqual(b.title);
		});
		test("404 returned if book can't be found", async () => {
			b.title = "update title";
			b["amazon-url"] = "http://a.co/eobPtX2";
			let resp = await request(app).put(`/books/99999`).send({ book: b });
			expect(resp.statusCode).toBe(404);
		});
	});
});
afterAll(async function () {
	await db.end();
});
