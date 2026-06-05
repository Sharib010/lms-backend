const logger = require('../config/logger')
const startWorkers = async () => {
  logger.info('⚙️  Job workers registered (BullMQ ready)')
  // Workers registered here as queues are configured
}
module.exports = { startWorkers }
