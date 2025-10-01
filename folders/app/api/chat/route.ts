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
    // Fetch recent flashcards
    const { data: flashcards ,error:flashcardsError } = await (await supabase)
      .from("flashcards")
      .select("question,answers")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if(flashcardsError){
      console.error('Failed to fetch flashcards:',flashcardsError)
    }
    if (folder) {
      folderContext = `You are helping a user with folder "${folder.name}". `;
      if (folder.description) {
        folderContext += `Description: ${folder.description}. `;
      }
    }

    if (notes && notes.length > 0) {
      folderContext += `The user has ${notes.length} notes in this folder:\n`;
      notes.forEach((note: {title?: string; content?: string}) => {
        folderContext += `- ${note.title || "Untitled"}: ${note.content?.substring(0, 200)}...\n`;
      });
    }
    if (flashcards && flashcards.length > 0) {
      folderContext += `The user has ${flashcards.length} flashcards in this folder:\n`;
      flashcards.forEach((flashcard: {question: string; answers?: Array<{text: string}>; is_multiple_choice?: boolean}) => {
        // Extract answer texts from the JSONB array
        const answerTexts = flashcard.answers?.map((ans) => ans.text).join(', ') || '';
        const answerPreview = answerTexts.length > 100 ? answerTexts.substring(0, 100) + '...' : answerTexts;
        const questionType = flashcard.is_multiple_choice ? '[Multiple Choice]' : '[Written Answer]';
        folderContext += `- ${questionType} ${flashcard.question}\n  Answers: ${answerPreview}\n`;
      });
    }

    // Build conversation history for Gemini
    const conversationHistory = messages?.slice(-10) || [];

    // Create the full conversation context
    const systemPrompt = `You are an expert AI study assistant and tutor for students. Your goal is to help students learn effectively and achieve academic success.

${folderContext}

YOUR CORE CAPABILITIES:
1. **Content Understanding**: Analyze and explain concepts from their notes, files, and flashcards
2. **Active Learning**: Create study plans, quizzes, and practice questions
3. **Flashcard Mastery**: Quiz students on their flashcards, provide detailed feedback, and help them understand why answers are correct/incorrect
4. **Note Enhancement**: Suggest improvements to their notes, identify gaps, and recommend additional topics to study
5. **Study Strategies**: Provide personalized study techniques based on their content and learning style
6. **Exam Preparation**: Help create study guides, practice tests, and review sessions

HOW TO INTERACT:
- **Be Encouraging**: Celebrate progress and provide constructive feedback
- **Be Socratic**: Ask guiding questions to help students think critically
- **Be Adaptive**: Adjust your teaching style based on the student's responses
- **Be Specific**: Reference their actual notes, flashcards, and files when helping
- **Be Concise**: Keep responses focused and digestible (2-3 paragraphs max unless explaining complex topics)

STUDY SESSION MODES:
1. **Quiz Mode**: When asked to quiz them, use their flashcards to create an interactive study session
   - Ask one question at a time
   - Wait for their answer
   - Provide detailed feedback (why it's right/wrong)
   - Explain the concept further if they're struggling
   - Keep track of their progress

2. **Explain Mode**: When they ask about a concept
   - Break it down into simple terms
   - Use examples and analogies
   - Connect it to what they already know from their notes
   - Suggest related topics to explore

3. **Review Mode**: When preparing for exams
   - Summarize key concepts from their notes
   - Identify important topics they should focus on
   - Create practice questions
   - Suggest study schedules

4. **Brainstorm Mode**: When working on assignments
   - Help organize their thoughts
   - Suggest research directions
   - Provide structure and outlines
   - Encourage critical thinking

IMPORTANT GUIDELINES:
- Always reference their actual content (notes, flashcards, files) when available
- If you don't have enough context, ask specific questions about what they need help with
- Never just give answers - help them learn and understand
- Adapt difficulty based on their responses
- Use emojis sparingly for encouragement (✅ ❌ 💡 📚)
- If they're stuck, break down the problem into smaller steps

Remember: Your goal is not just to answer questions, but to help students become better learners and truly understand the material.`;

    // Build the conversation for Gemini API
    let conversationText = systemPrompt + "\n\n";

    // Add conversation history
    conversationHistory.forEach((msg: {role: string; content: string}) => {
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
            temperature: 0.8,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40,
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
