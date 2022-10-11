class Book {
    constructor(
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        isUpdating
        ) {
            this.name = name;
            this.year = year;
            this.author = author;
            this.summary = summary;
            this.publisher = publisher;
            this.pageCount = pageCount;
            this.readPage = readPage;
            this.reading = reading;
            this.isUpdating = isUpdating;

            if (!name) {
                throw new Error('property name null');
            }

            if (readPage > pageCount) {
                throw new Error('readPage property has value bigger than pageCount');
            }
    }
}

module.exports = Book;