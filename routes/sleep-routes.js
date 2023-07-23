const express = require('express');
const router = express.Router();

const sleepRecordController = require('../controllers/sleepRecord');
const sleepSummaryController = require('../controllers/sleepSummary');
const { checkAuthUser } = require('../middleware/check-auth');

router.post('/record/submit', checkAuthUser, sleepRecordController.createSleepRecord);

router.put('/record/update/:id', checkAuthUser, sleepRecordController.updateSleepRecord);

router.post('/records', checkAuthUser, sleepRecordController.getSleepRecords);

router.post('/summary/submit', checkAuthUser, sleepSummaryController.createSleepSummary);

router.put('/summary/update/:id', checkAuthUser, sleepSummaryController.updateSleepSummary);

router.post('/summaries', checkAuthUser, sleepSummaryController.getSleepSummaries);

module.exports = router;