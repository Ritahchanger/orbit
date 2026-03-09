const {
  subscribeNewsletterValidator,
  unsubscribeValidator,
  updatePreferencesValidator,
} = require("../validators/newsletter.validator");

const newsletterService = require("./newsletter.service");



const subscribe = async (req, res) => {
  const { error } = subscribeNewsletterValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const subscriber = await newsletterService.subscribeUser(req.body);
  return res
    .status(201)
    .json({ success: true, message: "Subscribed successfully", subscriber });
};

const unsubscribe = async (req, res) => {
  const { error } = unsubscribeValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const subscriber = await newsletterService.unsubscribeUser(req.body);
  return res.status(200).json({
    success: true,
    message: "Unsubscribed successfully",
    subscriber,
  });
};

const updatePreferences = async (req, res) => {
  const { error } = updatePreferencesValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { email, preferences } = req.body;

  const subscriber = await newsletterService.updatePreferences({
    email,
    preferences,
  });
  return res.status(200).json({
    success: true,
    message: "Preferences updated successfully",
    subscriber,
  });
};

const getAllNewsLettersController = async (req, res) => {
  const { subscribed } = req.query;

  let subscribedFilter;
  if (subscribed === "true") subscribedFilter = true;
  else if (subscribed === "false") subscribedFilter = false;

  const subscribers = await newsletterService.getAllNewsletters({
    subscribed: subscribedFilter,
  });

  res.status(200).json({
    success: true,
    count: subscribers.length,
    data: subscribers,
  });
};

const sendNewsletterController = async (req, res) => {
  const { subject,content, campaignId } = req.body;

  if (!subject || !content) {
    return res.status(400).json({
      success: false,
      message: "Subject and content are required.",
    });
  }

  const summary = await newsletterService.sendNewsLetter({
    subject,
    content,
    campaignId,
  });
  return res.status(200).json({
    success: true,
    message: "Newsletter sending process completed.",
    summary,
  });
};

module.exports = {
  subscribe,
  unsubscribe,
  updatePreferences,
  getAllNewsLettersController,
  sendNewsletterController,
};
