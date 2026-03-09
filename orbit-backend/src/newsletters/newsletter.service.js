const Newsletter = require("./newsletters.model");
const { transporter } = require("../utils/transporter");
const queue = require("../utils/queue");

const BATCH_SIZE = parseInt(process.env.NEWS_LETTERS_BATCH_SIZE, 10) || 100;

const subscribeUser = async ({ email, preferences = {} }) => {
  const existing = await Newsletter.findOne({ email });
  if (existing && existing.subscribed) {
    throw new Error("Email is already subscribed.");
  }

  if (existing && !existing.subscribed) {
    existing.subscribed = true;
    existing.subscribedAt = new Date();
    existing.unsubscribedAt = null;
    existing.preferences = preferences;
    await existing.save();
    return existing;
  }

  const newSubscriber = new Newsletter({ email, preferences });
  await newSubscriber.save();
  return newSubscriber;
};

const unsubscribeUser = async ({ email }) => {
  const subscriber = await Newsletter.findOne({ email });
  if (!subscriber || !subscriber.subscribed) {
    throw new Error("Email is not subscribed or already unsubscribed.");
  }

  subscriber.subscribed = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  return subscriber;
};

const updatePreferences = async ({ email, preferences }) => {
  const subscriber = await Newsletter.findOne({ email });
  if (!subscriber || !subscriber.subscribed) {
    throw new Error("Subscriber not found or unsubscribed.");
  }

  subscriber.preferences = preferences;
  await subscriber.save();
  return subscriber;
};

const getAllNewsletters = async ({ subscribed }) => {
  let filter = {};

  if (typeof subscribed === "boolean") {
    filter.subscribed = subscribed;
  }

  const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 });
  return subscribers;
};

// Main function to send newsletter - now just queues the task
const sendNewsLetter = async ({ subject, content, campaignId }) => {
  const subscribers = await Newsletter.find({ subscribed: true }).select(
    "email preferences"
  );

  // 🔍 ADD VALIDATION
  const validSubscribers = subscribers.filter(
    (sub) =>
      sub.email &&
      sub.email.trim() !== "" &&
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(sub.email)
  );

  console.log("🔍 DEBUG - Valid subscribers:", {
    totalFound: subscribers.length,
    validCount: validSubscribers.length,
    validEmails: validSubscribers.map((s) => s.email),
  });

  if (validSubscribers.length === 0) {
    throw new Error("No valid subscribers with email addresses found");
  }

  console.log(
    `Queueing newsletter for ${validSubscribers.length} valid subscribers...`
  );

  // 🔧 FIX: Use the already parsed BATCH_SIZE from line 4
  // Remove line 85 - DON'T redeclare BATCH_SIZE here!

  console.log("🔍 Batch creation debug:", {
    validSubscribersLength: validSubscribers.length,
    BATCH_SIZE: BATCH_SIZE,
    isArray: Array.isArray(validSubscribers),
    firstSubscriber: validSubscribers[0],
  });

  // Create batches using a working approach
  const batches = [];
  for (let i = 0; i < validSubscribers.length; i += BATCH_SIZE) {
    const batch = validSubscribers.slice(i, i + BATCH_SIZE);
    console.log(`🔍 Created batch ${batches.length + 1}:`, {
      start: i,
      end: i + BATCH_SIZE, // Now BATCH_SIZE is a number, not a string!
      size: batch.length,
      firstEmail: batch[0] ? batch[0].email : 'No email',
    });
    batches.push(batch);
  }

  console.log(`Created ${batches.length} batches`);
  console.log(
    "🔍 All batches:",
    batches.map((batch, idx) => ({
      batchIndex: idx,
      size: batch.length,
      emails: batch.map((s) => s.email),
    }))
  );

  // If batches are still empty, use a fallback
  if (batches.length === 0 || batches[0].length === 0) {
    console.log("⚠️  Batches empty, using fallback approach");
    batches.push([...validSubscribers]); // Create one batch with all subscribers
  }

  // Queue each batch
  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`🔍 Processing batch ${batchIndex}:`, {
      batchLength: batch.length,
      firstItem: batch[0],
      isArray: Array.isArray(batch),
    });

    const mappedBatch = batch.map((sub) => {
      return {
        email: sub.email,
        preferences: sub.preferences || {},
      };
    });

    const batchData = {
      batch: mappedBatch,
      subject,
      content: content,
      campaignId: campaignId || `campaign-${Date.now()}`,
      batchIndex: batchIndex + 1,
      totalBatches: batches.length,
    };

    console.log(`📦 Final Batch ${batchIndex + 1}/${batches.length}:`, {
      size: batchData.batch.length,
      emails: batchData.batch.map((b) => b.email),
      hasData: batchData.batch.length > 0,
    });

    if (batchData.batch.length > 0) {
      try {
        await queue.publishToQueue("newsletter_batches", batchData);
        console.log(
          `✅ Batch ${batchIndex + 1} queued successfully with ${batchData.batch.length
          } emails`
        );
      } catch (queueError) {
        console.error(
          `❌ Failed to queue batch ${batchIndex + 1}:`,
          queueError
        );
      }
    } else {
      console.log(`❌ Batch ${batchIndex + 1} is empty - skipping`);
    }
  }

  return {
    success: true,
    totalSubscribers: subscribers.length,
    validSubscribers: validSubscribers.length,
    totalBatches: batches.length,
    message: "Newsletter queued for processing",
  };
};

// Process individual emails (worker will call this)
const processSingleEmail = async ({ email, subject, content, campaignId }) => {
  try {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject,
      html: content,
      headers: {
        "X-Campaign-ID": campaignId,
      },
    };

    await transporter.sendMail(mailOptions);

    // Optional: Update sent count or log success
    await Newsletter.updateOne(
      { email },
      {
        $inc: { emailsSent: 1 },
        $set: { lastEmailSent: new Date() },
      }
    );

    return { success: true, email };
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);

    // Update failure count
    await Newsletter.updateOne({ email }, { $inc: { failedAttempts: 1 } });

    throw error; // Re-throw to trigger nack
  }
};

// Process batch of emails
const processEmailBatch = async ({
  batch,
  subject,
  content,
  campaignId,
  batchIndex,
  totalBatches,
}) => {
  console.log(
    `Processing batch ${batchIndex + 1}/${totalBatches} with ${batch.length
    } emails`
  );

  const emailPromises = batch.map((subscriber) =>
    queue.publishToQueue("newsletter_emails", {
      email: subscriber.email,
      subject,
      content,
      campaignId,
    })
  );

  await Promise.all(emailPromises);
  console.log(
    `Queued ${batch.length} individual emails from batch ${batchIndex + 1}`
  );
};

module.exports = {
  subscribeUser,
  unsubscribeUser,
  updatePreferences,
  getAllNewsletters,
  sendNewsLetter,
  processSingleEmail,
  processEmailBatch,
};
