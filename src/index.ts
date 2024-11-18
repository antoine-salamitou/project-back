import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { signUpUser, signInUser, getUsers } from "./controllers/users";
import { getAdminConfig, updateAdminConfig } from "./controllers/admin";
import { authenticateUser } from "./middlewares/authenticate-user";
import {
  getOnboardingInfo,
  getOnboardingPage,
  getUser,
  updateOnboardingComponent,
  setOnboardingStepCount,
} from "./controllers/onboarding";

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.WEBSITE_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get("content-length");
  const route = req.originalUrl;

  console.log(`Route: ${route}`);
  if (contentLength) {
    console.log(`Payload size: ${contentLength} bytes`);
  } else {
    console.log("No content-length header provided");
  }
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post(`/user/sign-up`, signUpUser);
app.post(`/user/sign-in`, signInUser);
app.get("/users", getUsers);
app.get("/user", authenticateUser, getUser);

app.get("/admin/config", getAdminConfig);
app.put("/admin/config", updateAdminConfig);

app.get("/onboarding", authenticateUser, getOnboardingPage);
app.patch("/onboarding", authenticateUser, updateOnboardingComponent);
app.get("/onboarding/info", getOnboardingInfo);
app.put("/onboarding/step-count", setOnboardingStepCount);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
