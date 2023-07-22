const SleepRecord = require("../../models/sleep-record");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/sleep/record/submit:
 *   post:
 *     summary: submit factor record
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               confidence:
 *                  type: int
 *               motion:
 *                 type: int
 *               light:
 *                 type: int
 *               time:
 *                 type: date
 *             example:   # Sample object
 *               confidence: 85
 *               motion: 1
 *               light: 1
 *               time: 2023-07-10T23:19:13.146+00:00
 *     responses:
 *          '200':
 *              description: OK
 */
const submitSleepRecord = async (req, res, next) => {
  const { userId } = req.userData;

  let sleepRecords = [];
  try {
    if (req.body.records && req.body.records.length > 0) {
      for (record of req.body.records) {
        let ele = new SleepRecord({
          user: userId,
          confidence: record.confidence,
          motion: record.motion,
          light: record.light,
          time: record.time,
        })
        sleepRecords.push(ele);
      }
      sleepRecords = await SleepRecord.create(sleepRecords);
    }
  } catch (err) {
    err && console.error(err);
    const error = new HttpError("Submit record failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json(sleepRecords);
};

module.exports = submitSleepRecord;
