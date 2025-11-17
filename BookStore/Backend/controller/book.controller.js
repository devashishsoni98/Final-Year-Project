import Book from "../model/book.model.js";

// export const getBook = async(req, res) => {

//     try {
//         const book = await Book.find();
//         res.status(200).json(book);
//     } catch (error) {
//         console.log("Error: ", error);
//         res.status(500).json(error);
//     }
// };

export const getBook = async(req, res) => {
    try {
        const books = await Book.find();
        // Map books to include numeric id based on list.json IDs
        const booksWithNumericId = books.map(book => ({
            ...book.toObject(),
            id: book.id || book._id.toString()
        }));
        res.status(200).json(booksWithNumericId);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json(error);
    }
};
