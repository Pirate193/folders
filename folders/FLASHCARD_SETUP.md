# Flashcard System Setup Guide

## Overview
A complete flashcard system has been implemented with support for both text answers and multiple-choice questions. The system includes creation, viewing, studying, and management features.

## 📦 Installation Steps

### 1. Install Required Dependencies

```bash
npm install framer-motion
```

### 2. Set Up Database

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Navigate to: database/flashcards-schema.sql
-- Copy and execute the entire schema
```

The schema includes:
- **Flashcards table** with JSONB support for answers
- **Indexes** for optimal query performance
- **Triggers** for auto-updating timestamps and user_id
- **RLS Policies** for secure data access
- **Validation functions** to ensure data integrity

### 3. Verify Table Structure

After running the schema, your `flashcards` table should have:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `folder_id` | UUID | References folders table |
| `question` | TEXT | The flashcard question |
| `answers` | JSONB | Array of answer objects |
| `is_multiple_choice` | BOOLEAN | Question type flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Note**: No `user_id` column needed! Security is handled through folder ownership (`folders.user_id`), keeping the schema clean and consistent with other tables like `chat_messages`, `notes`, and `files`.

### 4. Answer JSONB Structure

Answers are stored as JSONB arrays with the following structure:

```json
[
  {
    "text": "Answer text",
    "isCorrect": true
  },
  {
    "text": "Another answer",
    "isCorrect": false
  }
]
```

## 🎯 Features Implemented

### 1. **Flashcard Store** (`stores/flashcardStore.ts`)
- ✅ Zustand state management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Folder-based filtering
- ✅ TypeScript interfaces for type safety

### 2. **Creation Dialog** (`components/flashcard-create-dialog.tsx`)
- ✅ Question input with textarea
- ✅ Toggle between text answer and multiple choice
- ✅ Dynamic answer options (up to 6 for multiple choice)
- ✅ Mark correct answers with checkmark button
- ✅ A, B, C, D labeling for multiple choice
- ✅ Validation before saving
- ✅ Toast notifications for feedback

### 3. **Flashcard Viewer** (`components/flashcard-viewer.tsx`)
- ✅ Display question prominently
- ✅ Text input for text-based answers
- ✅ Multiple choice selection with A, B, C, D format
- ✅ Check answer functionality
- ✅ Animated success/error feedback (green for correct, red for incorrect)
- ✅ Show correct answer when wrong
- ✅ Navigation between flashcards (Previous/Next)
- ✅ Keyboard support (Enter to check answer)

### 4. **Flashcard List** (`components/flashcard-list.tsx`)
- ✅ Grid layout of flashcard cards
- ✅ Empty state with placeholder
- ✅ "Add Your First Flashcard" prompt
- ✅ Dropdown menu for each card (Study, Delete)
- ✅ Question preview in cards
- ✅ Answer count display
- ✅ Multiple choice indicator badge
- ✅ "Start Studying" button
- ✅ Study mode with viewer integration
- ✅ Delete confirmation dialog
- ✅ Real-time count updates

### 5. **Integration** (`app/(main)/folders/[folderId]/overview.tsx`)
- ✅ Added to Flashcards tab
- ✅ Flashcard count in overview cards
- ✅ Passes folderId to components

## 🎨 UI Components Used

- **Dialog** - For creation modal
- **Card** - For flashcard display
- **Button** - For actions
- **Input/Textarea** - For text entry
- **Switch** - For toggling question type
- **DropdownMenu** - For card actions
- **AlertDialog** - For delete confirmation
- **Skeleton** - For loading states
- **Toast** - For notifications (via sonner)

## 🔒 Security Features

### Row Level Security (RLS) Policies:
Security is enforced through **folder ownership** - users can only access flashcards in folders they own:

1. **SELECT**: Users can view flashcards in their folders
   ```sql
   folder_id IN (SELECT id FROM folders WHERE user_id = auth.uid())
   ```
2. **INSERT**: Users can create flashcards in their folders
3. **UPDATE**: Users can update flashcards in their folders
4. **DELETE**: Users can delete flashcards in their folders

This approach is consistent with other tables (`chat_messages`, `notes`, `files`) and avoids data duplication.

### Data Validation:
- Question cannot be empty
- Answers must be a valid JSONB array
- At least one answer required
- At least one answer must be marked as correct
- Answer text cannot be empty
- Multiple choice requires at least 2 answers

## 📝 Usage Examples

### Creating a Text Answer Flashcard:
1. Click "Create Flashcard" button
2. Enter your question
3. Keep "Multiple Choice" toggle OFF
4. Enter the correct answer
5. Click the checkmark to mark it as correct
6. Click "Create Flashcard"

### Creating a Multiple Choice Flashcard:
1. Click "Create Flashcard" button
2. Enter your question
3. Toggle "Multiple Choice" ON
4. Enter 2-6 answer options
5. Click the checkmark on the correct answer
6. Click "Create Flashcard"

### Studying Flashcards:
1. Click "Start Studying" button
2. Read the question
3. For text answers: Type your answer
4. For multiple choice: Select an option (A, B, C, or D)
5. Click "Check Answer"
6. Review feedback (green = correct, red = incorrect)
7. Click "Next" to continue

### Managing Flashcards:
- Click the three dots (⋮) on any flashcard
- Select "Study" to practice that specific card
- Select "Delete" to remove the flashcard

## 🎯 Key Features Highlights

### Smart Answer Checking:
- **Text answers**: Case-insensitive comparison
- **Multiple choice**: Single correct answer validation
- **Immediate feedback**: Visual animations and color coding

### Study Mode:
- Progress indicator (Card X of Y)
- Sequential navigation
- Exit anytime
- Automatic state reset between cards

### Responsive Design:
- Mobile-friendly grid layout
- Adaptive dialog sizes
- Touch-friendly buttons
- Smooth animations

## 🐛 Troubleshooting

### Issue: Flashcards not loading
- **Solution**: Check that the table exists in Supabase
- **Solution**: Verify RLS policies are enabled
- **Solution**: Ensure user is authenticated

### Issue: Cannot create flashcard
- **Solution**: Verify folder_id is valid
- **Solution**: Check that at least one answer is marked correct
- **Solution**: Ensure question is not empty

### Issue: Animations not working
- **Solution**: Install framer-motion: `npm install framer-motion`

## 📊 Database Queries

### Get all flashcards for a folder:
```sql
SELECT * FROM flashcards 
WHERE folder_id = 'your-folder-id' 
ORDER BY created_at DESC;
```

### Count flashcards by type:
```sql
SELECT 
  is_multiple_choice,
  COUNT(*) as count
FROM flashcards
GROUP BY is_multiple_choice;
```

### Find flashcards with specific answer:
```sql
SELECT * FROM flashcards 
WHERE answers @> '[{"text": "Paris"}]'::jsonb;
```

## 🚀 Next Steps (Optional Enhancements)

1. **Edit Functionality**: Add ability to edit existing flashcards
2. **Spaced Repetition**: Implement SRS algorithm for optimal learning
3. **Statistics**: Track correct/incorrect answers over time
4. **Tags**: Add tagging system for better organization
5. **Export/Import**: Allow flashcard deck sharing
6. **Shuffle Mode**: Randomize flashcard order
7. **Favorites**: Mark important flashcards
8. **Search**: Filter flashcards by question text

## ✅ Checklist

- [x] Install framer-motion
- [ ] Run database schema in Supabase
- [ ] Test creating a text answer flashcard
- [ ] Test creating a multiple choice flashcard
- [ ] Test study mode
- [ ] Test delete functionality
- [ ] Verify RLS policies work correctly

---

**Created**: 2025-09-30  
**System**: Folders App - Flashcard Module  
**Status**: Ready for Production
