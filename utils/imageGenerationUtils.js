require("dotenv").config();
const Together = require("together-ai");
const fs = require("fs");

exports.encodeImageToBase64 = (imagePath) => {
  const buffer = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
};

exports.generateImage = async (prompt, base64Image = null) => {
  try {
    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

    console.log("Generating image with prompt:", prompt);

    const requestOptions = {
      model: "black-forest-labs/FLUX.1-schnell",
      // model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      width: 1024,
      height: 1024,
      steps: 4, // Increased from 2 for better quality
      n: 1 // Generate only 1 image to avoid confusion
    };

    // Add image input if provided (for image-to-image generation)
    if (base64Image) {
      requestOptions.image = base64Image;
    }

    const response = await together.images.create(requestOptions);

    console.log("API Response structure:", JSON.stringify(response, null, 2));

    // Check different possible response structures
    let imageData = null;
    
    if (response.data && response.data.length > 0) {
      // Try different possible property names
      imageData = response.data[0].b64_json || 
                 response.data[0].base64 || 
                 response.data[0].image ||
                 response.data[0].url;
    } else if (response.images && response.images.length > 0) {
      imageData = response.images[0].b64_json || 
                 response.images[0].base64 ||
                 response.images[0].image ||
                 response.images[0].url;
    } else if (response.b64_json) {
      imageData = response.b64_json;
    }

    if (imageData) {
      // Handle both base64 data and URLs
      if (imageData.startsWith('http')) {
        console.log("Received image URL:", imageData);
        // If it's a URL, you might want to download it
        return imageData;
      } else {
        // It's base64 data
        const outputPath = "output.png";
        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        fs.writeFileSync(outputPath, Buffer.from(base64Data, "base64"));
        console.log("Image saved to output.png");
        return outputPath;
      }
    } else {
      console.error("Full API response:", JSON.stringify(response, null, 2));
      throw new Error("Image generation failed: No image data found in response. Check the API response structure above.");
    }
  } catch (error) {
    console.error("Image generation error:", error);
    
    // Provide more specific error information
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error("Network Error: No response received from API");
    } else {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
};