import { startEmailWorker } from "./email";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Start all queue workers
export const startWorkers = () => {
  console.log("Starting queue workers...");
  startEmailWorker();
  // Add other workers as needed
  console.log("All workers started");
};

// Execute when run directly
if (require.main === module) {
  startWorkers();
}

export default startWorkers;
