import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

interface FlashcardAnswer {
  text: string;
  isCorrect: boolean;
}

interface GeneratedFlashcard {
  question: string;
  answers: FlashcardAnswer[];
}

export async function POST(request: NextRequest) {
  try {
    const { folderId, topic, description, isMultipleChoice, numberOfOptions, numberOfFlashcards } = await request.json();

    // Validation
    if (!folderId || !topic) {
      return NextResponse.json(
        { error: "folderId and topic are required" },
        { status: 400 }
      );
    }

    if (numberOfFlashcards < 1 || numberOfFlashcards > 20) {
      return NextResponse.json(
        { error: "numberOfFlashcards must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Verify folder exists and user has access
    const supabase = createClient();
    const { data: folder, error: folderError } = await (await supabase)
      .from("folders")
      .select("id, name, user_id")
      .eq("id", folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json(
        { error: "Folder not found or access denied" },
        { status: 404 }
      );
    }

    // Build the prompt for Gemini
    const prompt = buildFlashcardPrompt(
      topic,
      description,
      isMultipleChoice,
      numberOfOptions,
      numberOfFlashcards
    );

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4000,
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
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from Gemini
    const flashcards = parseFlashcardsFromResponse(aiResponse);

    if (!flashcards || flashcards.length === 0) {
      throw new Error("Failed to parse flashcards from AI response");
    }

    // Insert flashcards into database
    const flashcardsToInsert = flashcards.map((flashcard) => ({
      folder_id: folderId,
      question: flashcard.question,
      answers: flashcard.answers,
      is_multiple_choice: isMultipleChoice,
    }));

    const { data: insertedFlashcards, error: insertError } = await (await supabase)
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save flashcards to database");
    }

    return NextResponse.json({
      success: true,
      count: insertedFlashcards?.length || 0,
      flashcards: insertedFlashcards,
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate flashcards",
      },
      { status: 500 }
    );
  }
}

function buildFlashcardPrompt(
  topic: string,
  description: string | undefined,
  isMultipleChoice: boolean,
  numberOfOptions: number,
  numberOfFlashcards: number
): string {
  const focusArea = description ? `\n\nSPECIFIC FOCUS: ${description}\nMake sure to emphasize these aspects in your questions.` : '';
  
  if (isMultipleChoice) {
    return `You are an expert educator creating study flashcards. Generate exactly ${numberOfFlashcards} multiple-choice flashcards about "${topic}".${focusArea}

IMPORTANT REQUIREMENTS:
1. Each flashcard must have exactly ${numberOfOptions} answer options
2. Only ONE answer should be marked as correct (isCorrect: true)
3. All other answers must be marked as incorrect (isCorrect: false)
4. Make incorrect answers plausible but clearly wrong
5. Questions should test understanding, not just memorization
6. Cover different aspects of the topic

Return ONLY a valid JSON array in this exact format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "What is the capital of France?",
    "answers": [
      {"text": "Paris", "isCorrect": true},
      {"text": "London", "isCorrect": false},
      {"text": "Berlin", "isCorrect": false},
      {"text": "Madrid", "isCorrect": false}
    ]
  }
]

Generate ${numberOfFlashcards} flashcards about "${topic}" with ${numberOfOptions} options each.`;
  } else {
    return `You are an expert educator creating study flashcards. Generate exactly ${numberOfFlashcards} written-answer flashcards about "${topic}".${focusArea}

IMPORTANT REQUIREMENTS:
1. Each flashcard should have 1-3 acceptable correct answers
2. All answers must be marked as correct (isCorrect: true)
3. Questions should be clear and specific
4. Answers should be concise (1-3 words or short phrases)
5. Cover different aspects of the topic

Return ONLY a valid JSON array in this exact format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "What is the capital of France?",
    "answers": [
      {"text": "Paris", "isCorrect": true}
    ]
  },
  {
    "question": "Who wrote Romeo and Juliet?",
    "answers": [
      {"text": "William Shakespeare", "isCorrect": true},
      {"text": "Shakespeare", "isCorrect": true}
    ]
  }
]

Generate ${numberOfFlashcards} flashcards about "${topic}".`;
  }
}

function parseFlashcardsFromResponse(response: string): GeneratedFlashcard[] {
  try {
    // Remove markdown code blocks if present
    let cleanedResponse = response.trim();
    
    // Remove ```json and ``` if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "");
    }
    
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/\s*```$/, "");
    }

    cleanedResponse = cleanedResponse.trim();

    // Parse JSON
    const flashcards = JSON.parse(cleanedResponse);

    // Validate structure
    if (!Array.isArray(flashcards)) {
      throw new Error("Response is not an array");
    }

    // Validate each flashcard
    const validFlashcards = flashcards.filter((fc) => {
      return (
        fc.question &&
        typeof fc.question === "string" &&
        Array.isArray(fc.answers) &&
        fc.answers.length > 0 &&
        fc.answers.every(
          (ans: {text: string; isCorrect: boolean}) =>
            ans.text &&
            typeof ans.text === "string" &&
            typeof ans.isCorrect === "boolean"
        )
      );
    });

    return validFlashcards;
  } catch (error) {
    console.error("Failed to parse flashcards:", error);
    console.error("Raw response:", response);
    throw new Error("Failed to parse AI response");
  }
}
