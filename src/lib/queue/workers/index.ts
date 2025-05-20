import { startEmailWorker } from "./email";
import { startReminderWorker } from "./reminder";
import { startSlackWorker } from "./slack";
import { startPriorityEmailWorker } from "./priority-email";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Start all queue workers
export const startWorkers = () => {
  console.log("Starting queue workers...");
  startEmailWorker();
  startReminderWorker();
  startSlackWorker();
  startPriorityEmailWorker();
  console.log("All workers started");
};

// Execute when run directly
if (require.main === module) {
  startWorkers();
}

export default startWorkers;
