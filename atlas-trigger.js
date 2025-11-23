/**
 * MongoDB Atlas Trigger
 * 
 * This trigger fires when a new document is inserted into biggieback_sessions
 * with status: "pending"
 * 
 * Configuration:
 * - Type: Database Trigger
 * - Event Type: Insert
 * - Collection: biggieback_sessions
 * - Full Document: Enabled
 * 
 * This function calls the backend /process endpoint to start AI processing
 */

exports = async function(changeEvent) {
  const doc = changeEvent.fullDocument;
  
  // Only process if status is "pending"
  if (doc.status !== "pending") {
    return;
  }
  
  const sessionId = doc._id.toString();
  const backendUrl = context.values.get("BACKEND_URL") || "http://localhost:8000";
  
  // Call backend process endpoint
  const http = context.services.get("http");
  
  try {
    const response = await http.post({
      url: `${backendUrl}/process/${sessionId}`,
      headers: {
        "Content-Type": ["application/json"]
      }
    });
    
    console.log(`Trigger processed session ${sessionId}:`, response.statusCode);
    return response;
  } catch (error) {
    console.error(`Error processing session ${sessionId}:`, error);
    // Update document status to error
    const mongodb = context.services.get("mongodb-atlas");
    const db = mongodb.db("biggieback");
    const collection = db.collection("biggieback_sessions");
    
    await collection.updateOne(
      { _id: doc._id },
      { 
        $set: { 
          status: "error",
          error: error.message,
          updatedAt: new Date()
        }
      }
    );
    
    throw error;
  }
};

