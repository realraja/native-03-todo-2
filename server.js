import { config } from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from 'cloudinary'

config({
    path: "./config/config.env"
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET
})

// console.log(process.env.CLOUD_NAME)

connectDB();
app.listen(process.env.PORT, ()=>{
    console.log('server listening on port', process.env.PORT);
})

/*import {v2 as cloudinary} from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: "dwc3gwskl", 
        api_key: "149488542588472", 
        api_secret: "<your_api_secret>" // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
        public_id: "shoes"
    }).catch((error)=>{console.log(error)});
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url("shoes", {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url("shoes", {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();
*/