const Router = require("express").Router();

const quoteRequestController = require("./quotation.controller");

const asyncWrapper = require("../middlewares/asyncMiddleware");

const tokenValidator = require("../middlewares/tokenValidator");

Router.post("/", asyncWrapper(quoteRequestController.addQuoteRequest));

Router.get(
  "/",
  tokenValidator,
  asyncWrapper(quoteRequestController.getAllQuoteRequests)
);

Router.delete(
  "/:id",
  tokenValidator,
  asyncWrapper(quoteRequestController.deleteQuoteRequest)
);

Router.post(
  "/generate-pdf",
  tokenValidator,
  asyncWrapper(quoteRequestController.generatePdf)
);

module.exports = Router;
