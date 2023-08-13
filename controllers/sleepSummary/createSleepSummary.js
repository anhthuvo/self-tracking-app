const SleepSummary = require("../../models/sleep-summary");
const HttpError = require("../../models/http-error");
const SleepRecord = require("../../models/sleep-record");

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
  let sleepSummary, date, currentTime, upperLimit, lowerLimit;

  if (!req.body.wakeup_at && !req.body.in_bed_at) {
    const error = new HttpError("wakeup_at or in_bed_at is required", 500);
    return next(error);
  }

  try {
    date = parseInt(req.body.wakeup_at)
      ? new Date(parseInt(req.body.wakeup_at))
      : new Date(parseInt(req.body.in_bed_at));
    currentTime = date.getTime();
    upperLimit = date.setHours(24, 0, 0, 0);
    lowerLimit = upperLimit - 60 * 60 * 24 * 1000;
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "wakeup_at or in_bed_at must be timestamp",
      500
    );
    return next(error);
  }

  if (!req.body.wakeup_at) {
    try {
      sleepSummary = await SleepSummary.findOne({
        in_bed_at: { $gte: lowerLimit, $lte: upperLimit },
        user: userId,
      });

      if (!sleepSummary) {
        sleepSummary = new SleepSummary({
          self_assessment: 0,
          latency: 0,
          duration: 0,
          efficiency: 0,
          overall_score: 0,
          in_bed_at: currentTime,
          sleep_at: 0,
          wakeup_at: 0,
          wakeup_time: 0,
          user: userId,
        });
      } else {
        sleepSummary.self_assessment = 0;
        sleepSummary.latency = 0;
        sleepSummary.duration = 0;
        sleepSummary.efficiency = 0;
        sleepSummary.overall_score = 0;
        sleepSummary.in_bed_at = currentTime;
        sleepSummary.sleep_at = 0;
        sleepSummary.wakeup_at = 0;
        sleepSummary.wakeup_time = 0;
      }
      await sleepSummary.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError("Failed to update Record information", 500);
      return next(error);
    }
  } else {
    lowerLimit = currentTime - 60 * 60 * 24 * 1000;
    try {
      sleepSummary = await SleepSummary.findOne({
        in_bed_at: { $gte: lowerLimit, $lte: currentTime },
        user: userId,
        wakeup_at: { $eq: 0 },
      });

      if (sleepSummary) {
        let records = [];
        records = await SleepRecord.find({
          time: { $gte: sleepSummary.in_bed_at, $lte: currentTime },
          user: userId,
        })
          .sort("time")
          .exec();

        let preRecord;
        sleepSummary.wakeup_time = 0;
        for (let index in records) {
          if (index === 0) continue;
          if (!sleepSummary.sleep_at && records[index].confidence > 90) {
            sleepSummary.sleep_at = records[index].time;
          }
          if (
            preRecord &&
            preRecord.confidence > 90 &&
            records[index].confidence < 80
          ) {
            sleepSummary.wakeup_time += 1;
          }
          preRecord = records[index];
        }

        if (!sleepSummary.sleep_at) {
          throw "not found records";
        }
        sleepSummary.self_assessment = req.body.self_assessment;
        sleepSummary.wakeup_at = currentTime;
        sleepSummary.latency = sleepSummary.sleep_at - sleepSummary.in_bed_at;
        sleepSummary.duration = sleepSummary.wakeup_at - sleepSummary.sleep_at;
        sleepSummary.efficiency = Math.ceil(
          (sleepSummary.duration /
            (sleepSummary.wakeup_at - sleepSummary.in_bed_at)) *
            100
        );

        let overall_score = 0;
        if (req.body.self_assessment > 3) {
          sleepSummary.self_assessment = 3;
        } else if (req.body.self_assessment < 0) {
          sleepSummary.self_assessment = 0;
        }
        overall_score += sleepSummary.self_assessment;

        if (sleepSummary.latency < 60 * 15 * 1000) {
          overall_score += 0;
        } else if (sleepSummary.latency < 60 * 30 * 1000) {
          overall_score += 1;
        } else if (sleepSummary.latency < 60 * 60 * 1000) {
          overall_score += 2;
        } else {
          overall_score += 3;
        }

        if (sleepSummary.efficiency > 85) {
          overall_score += 0;
        } else if (sleepSummary.efficiency > 74) {
          overall_score += 1;
        } else if (sleepSummary.efficiency > 65) {
          overall_score += 2;
        } else {
          overall_score += 3;
        }

        if (sleepSummary.duration > 60 * 60 * 7 * 1000) {
          overall_score += 0;
        } else if (sleepSummary.duration > 60 * 60 * 6 * 1000) {
          overall_score += 1;
        } else if (sleepSummary.duration > 60 * 60 * 5 * 1000) {
          overall_score += 2;
        } else {
          overall_score += 3;
        }

        if (sleepSummary.wakeup_time < 2) {
          overall_score += 0;
        } else if (sleepSummary.wakeup_time < 3) {
          overall_score += 1;
        } else if (sleepSummary.wakeup_time < 4) {
          overall_score += 2;
        } else {
          overall_score += 3;
        }

        sleepSummary.overall_score = overall_score;
        await sleepSummary.save();
      } else {
        throw "not found";
      }
    } catch (err) {
      console.log(err);
      const error = new HttpError("Failed to update Record information", 500);
      return next(error);
    }
  }

  res.status(201).json(sleepSummary);
};

module.exports = submitSleepSummary;
