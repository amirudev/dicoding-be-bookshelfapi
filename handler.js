const { nanoid } = require('nanoid');
const bookshelf = require('./data/bookshelf');
const Book = require('./models/book');

const addBookHandler = (request, h) => {
  const book = request.payload;
  let newBookData;
  let response;

  try {
    newBookData = new Book(
      book.name,
      book.year,
      book.author,
      book.summary,
      book.publisher,
      book.pageCount,
      book.readPage,
      book.reading,
    );

    newBookData.id = nanoid(16);
    newBookData.finished = false;
    newBookData.insertedAt = new Date().toISOString();
    newBookData.updatedAt = newBookData.insertedAt;

    if (book.readPage === book.pageCount) {
      newBookData.finished = true;
    }

    bookshelf.push(newBookData);
    const isSuccess = bookshelf.filter((bf) => bf.id === newBookData.id).length > 0;

    if (isSuccess) {
      response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: newBookData.id,
        },
      });

      response.code(201);
      return response;
    }
  } catch (err) {
    switch (err.message) {
      case 'property name null':
        response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });

        response.code(400);
        break;
      case 'readPage property has value bigger than pageCount':
        response = h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });

        response.code(400);
        break;
      default:
        response = h.response({
          status: 'error',
          message: 'Buku gagal ditambahkan',
        });

        response.code(500);
        break;
    }
  }

  return response;
};

const filterBookByName = (c, q) => c.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));

const filterBookReading = (books, readingStatus) => {
  let filteredBook = books;

  if (typeof readingStatus === 'boolean') {
    filteredBook = books.filter((book) => book.reading === readingStatus);
  }

  return filteredBook;
};

const filterBookFinished = (books, finishStatus) => {
  let filteredBook = books;

  if (typeof finishStatus === 'boolean') {
    filteredBook = books.filter((book) => book.finished === finishStatus);
  }

  return filteredBook;
};

const mapBookForDisplay = (books) => books.map((book) => ({
  id: book.id,
  name: book.name,
  publisher: book.publisher,
}));

const getAllBookHandler = (request, h) => {
  const { reading, finished, name } = request.query;

  let books = bookshelf;
  if (reading) {
    books = filterBookReading(books, reading === '1');
  }

  if (finished) {
    books = filterBookFinished(books, finished === '1');
  }

  if (name) {
    books = filterBookByName(books, name);
  }

  const response = h.response({
    status: 'success',
    data: {
      books: mapBookForDisplay(books),
    },
  });

  return response.code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = bookshelf.filter((bookFilter) => bookFilter.id === id)[0];

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });

  response.code(404);
  return response;
};

const updateBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  let newBookData;

  try {
    newBookData = new Book(name, year, author, summary, publisher, pageCount, readPage, reading);
    newBookData.id = id;

    newBookData.finished = false;
    newBookData.updatedAt = new Date().toISOString();

    if (newBookData.readPage === newBookData.pageCount) {
      newBookData.finished = true;
    }

    const index = bookshelf.findIndex((book) => book.id === id);

    if (index !== -1) {
      const currentBookData = bookshelf.filter((book) => book.id === id)[0];

      newBookData.insertedAt = currentBookData.insertedAt;

      bookshelf[index] = newBookData;

      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });

      return response.code(200);
    }

    throw new Error('book not found');
  } catch (err) {
    let response;

    switch (err.message) {
      case 'property name null':
        response = h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });

        return response.code(400);
      case 'readPage property has value bigger than pageCount':
        response = h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });

        return response.code(400);
      case 'book not found':
        response = h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });

        return response.code(404);
      default:
        response = h.response({
          status: 'error',
          message: 'Buku gagal ditambahkan',
        });

        return response.code(500);
    }
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = bookshelf.findIndex((book) => book.id === id);

  if (index !== -1) {
    bookshelf.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
