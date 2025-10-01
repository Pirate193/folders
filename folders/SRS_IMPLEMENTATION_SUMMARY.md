# Spaced Repetition System (SRS) - Implementation Summary

## ✅ Completed Components

### 1. **Database Schema** (`database/flashcards-srs-schema.sql`)
- ✅ Added SRS columns to flashcards table:
  - `ease_factor` (SM-2 ease factor, default 2.5)
  - `interval_days` (days until next review)
  - `repetitions` (consecutive correct reviews)
  - `next_review_date` (when card is due)
  - `last_reviewed_at` (last review timestamp)
  - `total_reviews` (total review count)
  - `correct_reviews` (correct review count)

- ✅ Created `flashcard_reviews` table for history tracking
- ✅ Added helper functions:
  - `get_due_flashcards(folder_id)` - Get cards due for review
  - `get_study_stats(folder_id)` - Get study statistics
  - `get_recent_reviews(folder_id, limit)` - Get recent activity

- ✅ Added RLS policies for security
- ✅ Created indexes for performance

### 2. **SRS Algorithm** (`lib/srs-algorithm.ts`)
- ✅ Implemented SuperMemo SM-2 algorithm
- ✅ Quality ratings 0-5:
  - 0: Complete blackout → Reset to 0 days
  - 1-2: Incorrect → Reset to 0 days
  - 3-4: Correct → Normal progression
  - 5: Perfect → Longer interval

- ✅ Helper functions:
  - `calculateNextReview()` - Core SM-2 algorithm
  - `getQualityLabel()` - Get rating label
  - `getIntervalPreview()` - Preview next interval
  - `isDue()` - Check if card is due
  - `formatNextReview()` - Format date display
  - `calculateSuccessRate()` - Calculate percentage
  - `isMastered()` - Check if card is mastered
  - `getDifficultyLevel()` - Get difficulty level

### 3. **Flashcard Store** (`stores/flashcardStore.ts`)
- ✅ Updated Flashcard type with SRS fields
- ✅ Added StudyStats interface
- ✅ Implemented SRS functions:
  - `reviewFlashcard()` - Record review and update SRS data
  - `fetchDueFlashcards()` - Get cards due for review
  - `fetchStudyStats()` - Get folder statistics

### 4. **Flashcard Viewer SRS** (`components/flashcard-viewer-srs.tsx`)
- ✅ Enhanced viewer with quality rating buttons
- ✅ Shows 3 rating options after checking answer:
  - **Again** - Review today (quality 0-2)
  - **Good/Hard** - Normal interval (quality 1-3)
  - **Easy** - Longer interval (quality 2-5)

- ✅ Shows interval preview for each button
- ✅ Tracks time taken for each review
- ✅ Saves review to database
- ✅ Shows success rate per card
- ✅ Auto-advances after rating

## 🔄 Next Steps to Complete

### 5. **Update Flashcard List** (PENDING)
Need to modify `components/flashcard-list.tsx`:
- Add "Study Due Cards" button
- Show due card count
- Filter to show only due cards in study mode
- Use FlashcardViewerSRS instead of FlashcardViewer
- Show SRS stats in card preview

### 6. **Create Study Dashboard** (PENDING)
Create `components/study-dashboard.tsx`:
- Show cards due today
- Show cards due this week
- Show mastered cards count
- Show new cards count
- Display success rate
- Show study streak
- Recent review activity

### 7. **Update Overview Page** (PENDING)
Modify `app/(main)/folders/[folderId]/overview.tsx`:
- Add study dashboard widget
- Update flashcard count to show due cards
- Add quick study button

## 📊 How It Works

### **Study Flow:**
```
1. User clicks "Study Due Cards"
   → Fetches cards where next_review_date <= NOW()

2. User sees flashcard question
   → Tries to answer

3. User clicks "Check Answer"
   → Shows correct/incorrect feedback

4. User rates difficulty:
   → Again (0-2): See it again today
   → Good/Hard (1-3): See it in 1-6 days
   → Easy (2-5): See it in longer interval

5. System calculates next review using SM-2:
   → Updates ease_factor
   → Calculates new interval
   → Sets next_review_date
   → Saves to database

6. Repeat for all due cards

7. Session complete:
   → Shows statistics
   → "Next review: X cards tomorrow"
```

### **SM-2 Algorithm Logic:**
```typescript
// If quality < 3 (incorrect):
- Reset repetitions to 0
- Reset interval to 0 (review today)
- Decrease ease factor by 0.2

// If quality >= 3 (correct):
- Increment repetitions
- Calculate new ease factor
- Calculate new interval:
  - First review: 1 day
  - Second review: 6 days
  - Subsequent: interval * ease_factor
- Set next review date
```

## 🎯 Quality Rating Guide

| Quality | Button | Meaning | Next Interval |
|---------|--------|---------|---------------|
| 0 | Again | Complete blackout | Today |
| 1 | Hard | Wrong, but remembered | Today |
| 2 | Hard | Wrong, seemed easy | Today |
| 3 | Good | Correct with effort | 1-6 days |
| 4 | Good | Correct easily | Normal |
| 5 | Easy | Perfect recall | Longer |

## 📈 Statistics Tracked

### **Per Flashcard:**
- Total reviews
- Correct reviews
- Success rate (%)
- Ease factor
- Interval days
- Repetitions
- Next review date
- Last reviewed date

### **Per Folder:**
- Total cards
- Due today
- Due this week
- Mastered cards (3+ reps, ease >= 2.5)
- New cards (never reviewed)
- Average ease factor
- Total reviews
- Overall success rate

## 🎨 UI Components Status

### ✅ Completed:
- FlashcardViewerSRS with quality ratings
- Quality rating buttons with interval previews
- Success rate display
- Time tracking
- Loading states

### 🔄 Pending:
- Study dashboard widget
- Due cards filter in list
- Study mode toggle
- Statistics display
- Progress tracking
- Study streak counter

## 🔧 Database Setup Required

Run this SQL in Supabase:
```sql
-- Run the entire flashcards-srs-schema.sql file
-- This will:
-- 1. Add SRS columns to flashcards table
-- 2. Create flashcard_reviews table
-- 3. Add indexes
-- 4. Create helper functions
-- 5. Set up RLS policies
```

## 📝 Usage Example

```typescript
// In study mode component:
import { useFlashcardStore } from '@/stores/flashcardStore'
import FlashcardViewerSRS from '@/components/flashcard-viewer-srs'

const StudyMode = ({ folderId }) => {
  const { fetchDueFlashcards, flashcards } = useFlashcardStore()
  
  useEffect(() => {
    fetchDueFlashcards(folderId)
  }, [folderId])
  
  return (
    <div>
      <h2>{flashcards.length} cards due for review</h2>
      <FlashcardViewerSRS 
        flashcard={flashcards[currentIndex]}
        folderId={folderId}
        onNext={handleNext}
      />
    </div>
  )
}
```

## 🎉 Benefits

1. **Scientific Learning**: Uses proven SM-2 algorithm
2. **Optimal Intervals**: Shows cards at perfect times
3. **Progress Tracking**: Detailed statistics
4. **Adaptive**: Adjusts to user performance
5. **Efficient**: Focus on cards you need to review
6. **Motivating**: See progress and mastery

## 📚 References

- SuperMemo SM-2 Algorithm
- Anki spaced repetition system
- Research on optimal learning intervals

---

**Status**: Core SRS implementation complete, UI integration pending
**Next**: Update flashcard list and create study dashboard
