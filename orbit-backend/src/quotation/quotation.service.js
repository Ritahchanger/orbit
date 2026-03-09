const QuoteRequest = require("./quotation.model");


const createQuoteRequest = async (data) => {
  const quoteRequest = new QuoteRequest(data);
  await quoteRequest.save();
  return quoteRequest;
};



const fetchAllQuoteRequests = async () => {
  const quoteRequests = await QuoteRequest.find().sort({ createdAt: -1 });
  return quoteRequests;
};


const deleteQuoteRequestById = async (id) =>{

  const deletedQuote = await QuoteRequest.findByIdAndDelete(id);

  return deletedQuote
}



module.exports = { createQuoteRequest,fetchAllQuoteRequests,deleteQuoteRequestById }
