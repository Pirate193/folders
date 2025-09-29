import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(request: NextRequest) {
  try {
    const { message, folderId, messages } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const supabase = createClient();
    let folderContext = "";

    // Fetch folder info
    const { data: folder,error } = await (await supabase)
      .from("folders")
      .select("name,description")
      .eq("id", folderId)
      .single();

    if(error){
      console.error('Failed to fetch folder:',error)
      
    }
    // Fetch recent notes
    const { data: notes ,error:notesError } = await (await supabase)
      .from("notes")
      .select("title,content")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if(notesError){
      console.error('Failed to fetch notes:',notesError)
    }

    if (folder) {
      folderContext = `You are helping a user with folder "${folder.name}". `;
      if (folder.description) {
        folderContext += `Description: ${folder.description}. `;
      }
    }

    if (notes && notes.length > 0) {
      folderContext += `The user has ${notes.length} notes in this folder:\n`;
      notes.forEach((note: any) => {
        folderContext += `- ${note.title || "Untitled"}: ${note.content?.substring(0, 200)}...\n`;
      });
    }

    // Build conversation history for Gemini
    const conversationHistory = messages?.slice(-10) || [];

    // Create the full conversation context
    const systemPrompt = `You are a helpful AI assistant for a student learning app. ${folderContext}

You can help users with:
- Questions about their folders, notes, and files
- General productivity and note-taking advice
- Assignments and project guidance
- Study tips and organization

Be concise, helpful, and friendly. If you don't have enough context, let them know and suggest what information might help.`;

    // Build the conversation for Gemini API
    let conversationText = systemPrompt + "\n\n";

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      conversationText += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
    });

    // Add current message
    conversationText += `Student: ${message}\nAssistant:`;

    // Call Gemini API with correct format
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: conversationText,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    // Save messages to Supabase
    const { error:insertError } = await (await supabase).from("chat_messages").insert([
      {
        folder_id: folderId,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      },
      {
        folder_id: folderId,
        role: "assistant",
        content: aiResponse,
        created_at: new Date().toISOString(),
      },
    ]);

    if(insertError){
      console.error('Failed to insert messages:',insertError)
    }
    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
