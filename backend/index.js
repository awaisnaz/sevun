import express from 'express';
import cors from "cors";
import "dotenv/config.js";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import axios from "axios";
import Sentiment from "sentiment";
const sentiment = new Sentiment();

const apiKey = process.env.GOOGLE_MAPS_API;
// const placeId = 'ChIJc-kz1FKN3zgRktDQiSB3pqs&cb=80440353';

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Reviews model
const ReviewsSchema = new mongoose.Schema({
  placeId: String,
  reviewId: Number,
  name: String,
  review: String,
  sentiment: Number
});
const Reviews = mongoose.model('Reviews', ReviewsSchema);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({credentials: true, origin: ['http://localhost:5173', 'http://localhost:3000/login']}));
app.use(cors());

app.post("/saveReviews", async (req, res, next) => {
  // getting post body
  let placeId = req.body.placeId;
  
  // Check if Reviews are already populated. If so, then don't store again.
  const document = await Reviews.findOne({ ["placeId"]: placeId });
  if (document != null) {
    res.status(201).json({ message: 'Reviews already exist.' });
    next();
  }
  else {
    // Construct the URL for the Places API with reviews
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=review&key=${apiKey}`;

    // Make the request to the API
    const response = await axios.get(url);
    
    if (response.data.status === 'OK') {
      const reviews = response.data.result.reviews;
      // console.log("reviews: ", reviews);
      
      // Get the latest 40 reviews (or fewer if not available)
      const latestReviews = reviews.slice(0, 40);

      for (let i = 0; i < latestReviews.length; i++) {

        let review = latestReviews[i];
        let sent = sentiment.analyze(review.text).score
        const reviews = new Reviews({ 
          placeId: placeId,
          reviewId: i + 1,
          name: review.author_name,
          review: review.text,
          sentiment: sent
        });
        await reviews.save();
      }
      res.status(201).json({ message: 'Reviews gotten successfully.' });
      next();
    } else {
      console.error('Error fetching reviews:', response.data.status);
    }
  }
});

app.post("/getReviews", async (req, res, next) => {
  // get the reviews
  let reviews = await Reviews.find();
  // console.log("document: ", document);
  if (reviews != null) {
    // console.log("Reviews already exist. Exiting without updating.");
    let temp = [];
    for (let i = 0; i < reviews.length; i++) {
      let temp2 = reviews[i];
      let temp3 = {};
      temp3.name = temp2.name;
      temp3.review = temp2.review;
      temp3.sentiment = temp2.sentiment;
      temp.push(temp3);
    }
    reviews = temp;
    // console.log("temp: ", temp);
    res.status(201).json({ reviews });
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));