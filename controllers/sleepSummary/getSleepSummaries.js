const SleepSummary = require("../../models/sleep-summary");
const HttpError = require("../../models/http-error");


const getSleepSummarys = async (req, res, next) => {
  const { userId } = req.userData;

  if (!req.body.start_at || !req.body.end_at) {
    const error = new HttpError("Provide start_at, end_at", 403);
    return next(error);
  }
  let records = [];
  try {
    records = await SleepSummary.find({
      wakeup_at: { $gte: req.body.start_at, $lte: req.body.end_at },
      user: userId,
    }).exec();
  } catch (err) {
    console.log(err)
    const error = new HttpError("Failed to get Record", 500);
    return next(error);
  }

  res.status(201).json(records);
};

module.exports = getSleepSummarys;

/**
 * @swagger
 * /api/sleep/summaries:
 *   post:
 *     summary: get record in a range of timestamp
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               start_at: 
 *                  type: timestamp
 *               end_at:
 *                 type: timestamp
 *             example:   # Sample object
 *               start_at: 1690713398000
 *               end_at: 1690759538000
 *     responses:
 *          '200':
 *              description: OK
*/