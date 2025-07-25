const { generateImage, encodeImageToBase64 } = require("../utils/imageGenerationUtils");
const fs = require("fs");
const path = require("path");

exports.handleImageGeneration = async (req, res) => {
  try {
    const selfiePath = req.file?.path;
    const prompt = req.body.prompt || "A scenic background with warm lighting";

    console.log("Uploaded file path:", selfiePath);
    console.log("Prompt received:", prompt);

    // Prepare base64 image if file was uploaded
    let base64Image = null;
    if (selfiePath && fs.existsSync(selfiePath)) {
      try {
        base64Image = encodeImageToBase64(selfiePath);
        console.log("Successfully encoded uploaded image to base64");
      } catch (encodeError) {
        console.error("Error encoding image:", encodeError.message);
        // Continue without the image
      }
    }

    // Generate the image
    const result = await generateImage(prompt, base64Image);

    let response = {
      message: "Image generated successfully",
    };

    // Handle different types of results (file path or URL)
    if (result.startsWith('http')) {
      response.imageUrl = result;
    } else {
      // It's a file path
      response.imagePath = result;
      
      // Optionally copy to outputs directory
      try {
        const outputDir = path.join(__dirname, "../outputs");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, "generated.png");
        fs.copyFileSync(result, outputPath);
        response.outputPath = outputPath;
      } catch (copyError) {
        console.error("Error copying to outputs directory:", copyError.message);
      }
    }

    // Clean up uploaded file
    if (selfiePath && fs.existsSync(selfiePath)) {
      try {
        fs.unlinkSync(selfiePath);
        console.log("Cleaned up uploaded file");
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError.message);
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Controller Error:", error.message);
    
    // Clean up uploaded file even on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file after error:", cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      error: error.message,
      details: "Check server logs for more information"
    });
  }
};