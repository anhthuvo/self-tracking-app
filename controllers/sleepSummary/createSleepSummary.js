const SleepSummary = require("../../models/sleep-summary");
const HttpError = require("../../models/http-error");

/**
 * @swagger
 * /api/sleep/summary/submit:
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
const submitSleepSummary = async (req, res, next) => {
  const { userId } = req.userData;
  let sleepSummary;
  let date = new Date()
  let in_bed_at = date.getTime()
  let upperLimit = date.setHours(24, 0, 0, 0);
  let lowerLimit = upperLimit - 60*60*24*1000;
  
  try {
    sleepSummary = await SleepSummary.findOne({ 
      in_bed_at: { $gte: lowerLimit, $lte: upperLimit } ,
      user: userId,    
    });
  } catch (err) {
    const error = new HttpError("Failed to update Record information", 500);
    return next(error);
  }

  if (!sleepSummary) {
    try {
      sleepSummary = new SleepSummary({
        self_assessment: 0,
        latency: 0,
        duration: 0,
        efficiency: 0,
        overall_score: 0,
        in_bed_at,
        sleep_at: 0,
        wakeup_at: 0,
        user: userId,
      });
      await sleepSummary.save();
    } catch (err) {
      err && console.error(err);
      const error = new HttpError(
        "Submit record failed, please try again.",
        500
      );
      return next(error);
    }
  } else {
    sleepSummary.self_assessment = 0
    sleepSummary.latency = 0
    sleepSummary.duration = 0
    sleepSummary.efficiency = 0
    sleepSummary.overall_score = 0
    sleepSummary.in_bed_at = in_bed_at
    sleepSummary.sleep_at = 0
    sleepSummary.wakeup_at = 0
    await sleepSummary.save();
  }

  res.status(201).json(sleepSummary);
};

module.exports = submitSleepSummary;
