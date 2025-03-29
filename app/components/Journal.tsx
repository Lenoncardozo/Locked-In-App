"use client"

import { useState, useEffect } from "react"
import { Check, Plus, ArrowRight, Calendar, Edit, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"

// List of journal questions in English
const journalQuestions = [
  {
    id: "q1",
    question: "How do you feel today?",
    options: ["Energized", "Calm", "Tired"]
  },
  {
    id: "q3",
    question: "What area do you want to focus on today?",
    options: ["Work/Productivity", "Self-care", "Relationships"]
  },
  {
    id: "q4",
    question: "How was your sleep quality?",
    options: ["Excellent", "Average", "Poor"]
  },
  {
    id: "q5",
    question: "How will you take care of yourself today?",
    options: ["Physical exercise", "Healthy eating", "Rest time"]
  },
  {
    id: "q8",
    question: "What's your main goal for today?",
    options: ["Complete pending tasks", "Learn something new", "Find balance"]
  },
  {
    id: "q9",
    question: "How do you see yourself at the end of the day?",
    options: ["Accomplished", "Peaceful", "Tired but satisfied"]
  }
];

interface JournalEntry {
  date: string;
  answers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  completedTasks: {
    id: string;
    text: string;
  }[];
}

export default function DailyJournal() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [completedTasks, setCompletedTasks] = useState<{id: string, text: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentViewDay, setCurrentViewDay] = useState<JournalEntry | null>(null);
  const [journalSaved, setJournalSaved] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(true);

  // Load journal entries and completed tasks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load journal entries
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        }

        // Check if today's entry exists to set journalSaved state
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const existingEntryIndex = savedEntries ? 
          JSON.parse(savedEntries).findIndex((entry: any) => entry.date === todayStr) : -1;
        setJournalSaved(existingEntryIndex >= 0);

        // Set selected questions to all available ones - we're using a fixed set now
        setSelectedQuestions(journalQuestions.map(q => q.id));

        // Load answers for today
        const savedAnswers = localStorage.getItem(`answers_${todayStr}`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }

        // Load completed tasks from localStorage
        const savedTasks = localStorage.getItem("focusTasks");
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const completed = tasks.filter((task: any) => task.completed);
          setCompletedTasks(completed);
        }
        
        // Load visibility preference
        const savedVisibility = localStorage.getItem("journalQuestionsVisible");
        if (savedVisibility !== null) {
          setQuestionsVisible(JSON.parse(savedVisibility));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, []);

  // Save answers when they change
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(answers).length > 0) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      localStorage.setItem(`answers_${todayStr}`, JSON.stringify(answers));
    }
  }, [answers]);

  // Save journal entries when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
    }
  }, [journalEntries]);
  
  // Save visibility preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("journalQuestionsVisible", JSON.stringify(questionsVisible));
    }
  }, [questionsVisible]);

  // Function to save journal entry
  const saveJournalEntry = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Check if all questions were answered
    const answeredAll = selectedQuestions.every(qId => answers[qId]);
    if (!answeredAll) {
      alert("Please answer all questions before saving.");
      return;
    }

    // Create journal entry object
    const newEntry: JournalEntry = {
      date: todayStr,
      answers: selectedQuestions.map(qId => {
        const question = journalQuestions.find(q => q.id === qId);
        return {
          questionId: qId,
          question: question?.question || "",
          answer: answers[qId] || ""
        };
      }),
      completedTasks: completedTasks
    };

    // Check if an entry for today already exists
    const existingEntryIndex = journalEntries.findIndex(entry => entry.date === todayStr);
    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...journalEntries];
      updatedEntries[existingEntryIndex] = newEntry;
      setJournalEntries(updatedEntries);
    } else {
      // Add new entry
      setJournalEntries([...journalEntries, newEntry]);
    }

    setJournalSaved(true);
  };

  // Function to edit today's entry
  const editJournal = () => {
    setJournalSaved(false);
  };

  // Function to answer a question
  const answerQuestion = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  // Function to view a specific entry
  const viewEntry = (entry: JournalEntry) => {
    setCurrentViewDay(entry);
    setIsDialogOpen(true);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MM/dd/yyyy');
  };

  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateStr === today;
  };

  // Get today's entry summary
  const getTodaySummary = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = journalEntries.find(entry => entry.date === todayStr);
    
    if (!todayEntry) return null;
    
    // Create a summary of today's responses
    return (
      <div className="space-y-3 p-4 bg-primary/5 rounded">
        {todayEntry.answers.map((answer, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <span className="text-xs font-medium text-primary/70">{answer.question}</span>
              <p className="text-xs text-primary/80">{answer.answer}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Toggle questions visibility
  const toggleQuestionsVisibility = () => {
    setQuestionsVisible(!questionsVisible);
  };

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm w-full max-w-full mx-auto"
         style={{ minHeight: '200px', height: 'auto', position: 'relative' }}>
      <h2 className="text-lg font-medium text-primary/80 text-center">(daily journal)</h2>
      
      {/* Eye button for toggling questions visibility */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleQuestionsVisibility}
        className="absolute top-2 right-2 text-primary/50 hover:text-primary/70 hover:bg-transparent h-7 w-7"
        title={questionsVisible ? "Hide questions" : "Show questions"}
      >
        {questionsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      {journalSaved ? (
        // Show saved journal summary
        <div className="space-y-4">
          {questionsVisible && getTodaySummary()}
          <Button
            onClick={editJournal}
            className="mt-4 bg-primary/10 text-primary/70 hover:bg-primary/20 border-none self-end px-3 py-1 h-8"
          >
            <Edit className="h-3 w-3 mr-1" /> Edit journal
          </Button>
        </div>
      ) : (
        // Show questions
        <>
          {questionsVisible && (
            <div className="space-y-6">
              {journalQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <h3 className="text-sm font-medium text-primary/70">{q.question}</h3>
                  <RadioGroup 
                    value={answers[q.id] || ""}
                    onValueChange={(value) => answerQuestion(q.id, value)}
                    className="flex flex-col space-y-1"
                  >
                    {q.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`${q.id}-option-${index}`} 
                          className="border-primary/30 text-primary" 
                        />
                        <Label 
                          htmlFor={`${q.id}-option-${index}`}
                          className="text-xs text-primary/70 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={saveJournalEntry}
            className="mt-4 bg-primary/10 text-primary/70 hover:bg-primary/20 border-none self-end px-3 py-1 h-8"
          >
            <Check className="h-3 w-3 mr-1" /> Save journal
          </Button>
        </>
      )}

      {/* Previous days history */}
      <div className="pt-4 mt-4 border-t border-primary/10 flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-transparent text-primary/50 hover:bg-primary/5 hover:text-primary/70 border-none text-xs flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" /> previous days
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-primary/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary/80">Journal History</DialogTitle>
            </DialogHeader>
            
            {currentViewDay ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-primary/70">
                    {formatDisplayDate(currentViewDay.date)}
                  </h3>
                  <Button
                    onClick={() => setCurrentViewDay(null)}
                    className="bg-transparent text-primary/50 hover:bg-primary/5 hover:text-primary/70 border-none text-xs"
                  >
                    Back
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {currentViewDay.answers.map((answer, index) => (
                    <div key={index} className="space-y-1">
                      <h4 className="text-xs font-medium text-primary/70">{answer.question}</h4>
                      <p className="text-xs text-primary/60 bg-primary/5 py-1 px-2 rounded">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
                
                {currentViewDay.completedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-primary/70">Completed tasks:</h4>
                    <ul className="space-y-1">
                      {currentViewDay.completedTasks.map((task) => (
                        <li key={task.id} className="text-xs text-primary/60 flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary/40" /> {task.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {journalEntries.length === 0 ? (
                  <p className="text-xs text-primary/50 text-center py-4">
                    No journal entries yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {journalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                      <Button
                        key={entry.date}
                        onClick={() => viewEntry(entry)}
                        className={`w-full justify-between px-3 py-2 h-auto text-left ${
                          isToday(entry.date) 
                            ? 'bg-primary/15 text-primary/90' 
                            : 'bg-background/50 text-primary/70 hover:bg-primary/5'
                        }`}
                      >
                        <span className="text-xs">{formatDisplayDate(entry.date)}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 